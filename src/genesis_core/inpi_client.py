"""
Genesis Core — InpiRneClient Centralized Gateway
Centralized Async HTTP Client for INPI RNE Official API (data.inpi.fr / registre-national-entreprises.inpi.fr)
Features:
- OAuth2 / JWT SSO Authentication with proactive token auto-refresh (50 min TTL)
- Rate-limiting (min 200ms delay between requests)
- LRU In-Memory Cache (24h TTL)
- Retry backoff logic (3 attempts for HTTP 429 / 503)
"""

import os
import sys
import time
import asyncio
import pathlib
from typing import Dict, Any, Optional, Tuple
import httpx
from dotenv import load_dotenv

# Search locations for .env
PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[4]
POSSIBLE_ENV_PATHS = [
    PROJECT_ROOT / ".env",
    pathlib.Path.home() / ".env"
]

for env_path in POSSIBLE_ENV_PATHS:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)

INPI_BASE_URL = "https://registre-national-entreprises.inpi.fr"
LOGIN_ENDPOINT = f"{INPI_BASE_URL}/api/sso/login"
TOKEN_MAX_AGE_SECONDS = 3000  # 50 minutes proactive refresh limit (token expires at 60 min)
CACHE_TTL_SECONDS = 86400    # 24 hours in-memory cache for RNE static records
MIN_REQUEST_INTERVAL = 0.200  # 200 ms minimum delay to respect INPI rate limits


class InpiRneClient:
    """Singleton Async HTTP Client for INPI RNE API."""

    def __init__(self):
        self._token: Optional[str] = None
        self._token_timestamp: float = 0.0
        self._last_request_time: float = 0.0
        self._cache_company: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._cache_attachments: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._lock: Optional[asyncio.Lock] = None
        self._lock_loop: Optional[asyncio.AbstractEventLoop] = None
        self._http_client: Optional[httpx.AsyncClient] = None
        self._client_loop: Optional[asyncio.AbstractEventLoop] = None

    def _get_lock(self) -> asyncio.Lock:
        loop = asyncio.get_running_loop()
        if self._lock is None or self._lock_loop != loop:
            self._lock_loop = loop
            self._lock = asyncio.Lock()
        return self._lock

    def _get_client(self) -> httpx.AsyncClient:
        loop = asyncio.get_running_loop()
        if (
            self._http_client is None
            or self._http_client.is_closed
            or self._client_loop != loop
        ):
            self._client_loop = loop
            self._http_client = httpx.AsyncClient(
                timeout=15.0,
                verify=True,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            )
        return self._http_client

    def _get_credentials(self) -> Tuple[str, str]:
        username = os.getenv("INPI_USERNAME")
        password = os.getenv("INPI_PASSWORD")
        if not username or not password:
            raise ValueError("INPI_USERNAME and INPI_PASSWORD must be configured in environment or .env file.")
        return username, password

    async def _rate_limit(self):
        """Enforces a minimum interval between requests."""
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < MIN_REQUEST_INTERVAL:
            await asyncio.sleep(MIN_REQUEST_INTERVAL - elapsed)
        self._last_request_time = time.time()

    async def authenticate(self, force: bool = False) -> str:
        """
        Authenticates against INPI SSO endpoint and acquires JWT Bearer token.
        Proactively refreshes if token is missing or older than 50 minutes.
        """
        async with self._get_lock():

            now = time.time()
            if not force and self._token and (now - self._token_timestamp < TOKEN_MAX_AGE_SECONDS):
                return self._token

            username, password = self._get_credentials()
            client = self._get_client()

            await self._rate_limit()
            resp = await client.post(LOGIN_ENDPOINT, json={"username": username, "password": password})
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                token = data.get("token") or data.get("access_token")
                if not token:
                    raise RuntimeError("INPI SSO response did not contain a valid token.")
                self._token = token
                self._token_timestamp = time.time()
                return self._token
            else:
                raise RuntimeError(f"INPI SSO Authentication failed [HTTP {resp.status_code}]: {resp.text[:200]}")

    async def _get_auth_headers(self, force: bool = False) -> Dict[str, str]:
        token = await self.authenticate(force=force)
        return {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

    async def get_company_profile(self, siren: str, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetches full company profile from GET /api/companies/{siren}.
        Uses 24h LRU in-memory cache and 3-attempt exponential retry logic.
        """
        clean_siren = siren.strip().replace(" ", "")
        now = time.time()

        # Check Cache
        if not force_refresh and clean_siren in self._cache_company:
            cached_time, cached_data = self._cache_company[clean_siren]
            if now - cached_time < CACHE_TTL_SECONDS:
                return cached_data

        headers = await self._get_auth_headers()
        url = f"{INPI_BASE_URL}/api/companies/{clean_siren}"
        client = self._get_client()

        last_error = None
        for attempt in range(1, 4):
            try:
                await self._rate_limit()
                resp = await client.get(url, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    self._cache_company[clean_siren] = (time.time(), data)
                    return data
                elif resp.status_code in [401, 403] and attempt == 1:
                    # Token expired, force re-authentication once
                    headers = await self._get_auth_headers(force=True)
                    continue
                elif resp.status_code in [429, 503]:
                    # Rate limit or temporary service unavailable
                    await asyncio.sleep(attempt * 0.5)
                    continue
                elif resp.status_code == 404:
                    return {"status": "NOT_FOUND", "message": f"Company SIREN {clean_siren} not found in INPI RNE."}
                else:
                    last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
            except Exception as e:
                last_error = str(e)
                await asyncio.sleep(attempt * 0.5)

        raise RuntimeError(f"Failed to fetch INPI profile for SIREN {clean_siren} after 3 attempts. Error: {last_error}")

    async def get_company_attachments(self, siren: str, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetches official attachments, legal acts, and financial filings from GET /api/companies/{siren}/attachments.
        Returns JSON containing 'actes', 'bilans', and 'bilansSaisis'.
        """
        clean_siren = siren.strip().replace(" ", "")
        now = time.time()

        # Check Cache
        if not force_refresh and clean_siren in self._cache_attachments:
            cached_time, cached_data = self._cache_attachments[clean_siren]
            if now - cached_time < CACHE_TTL_SECONDS:
                return cached_data

        headers = await self._get_auth_headers()
        url = f"{INPI_BASE_URL}/api/companies/{clean_siren}/attachments"
        client = self._get_client()

        last_error = None
        for attempt in range(1, 4):
            try:
                await self._rate_limit()
                resp = await client.get(url, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    self._cache_attachments[clean_siren] = (time.time(), data)
                    return data
                elif resp.status_code in [401, 403] and attempt == 1:
                    headers = await self._get_auth_headers(force=True)
                    continue
                elif resp.status_code in [429, 503]:
                    await asyncio.sleep(attempt * 0.5)
                    continue
                elif resp.status_code == 404:
                    return {"actes": [], "bilans": [], "bilansSaisis": []}
                else:
                    last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
            except Exception as e:
                last_error = str(e)
                await asyncio.sleep(attempt * 0.5)

        return {"actes": [], "bilans": [], "bilansSaisis": [], "error": last_error}

    async def download_attachment_pdf(self, attachment_id: str) -> Optional[bytes]:
        """
        Downloads binary PDF document for a balance sheet attachment from
        GET /api/bilans/{attachment_id}/download.
        Returns raw bytes of PDF file if successful, or None.
        """
        clean_id = attachment_id.strip()
        if not clean_id:
            return None

        # Check Cache
        if hasattr(self, "_cache_pdf") and clean_id in self._cache_pdf:
            cached_time, cached_bytes = self._cache_pdf[clean_id]
            if time.time() - cached_time < CACHE_TTL_SECONDS:
                return cached_bytes

        if not hasattr(self, "_cache_pdf"):
            self._cache_pdf: Dict[str, Tuple[float, bytes]] = {}

        headers = await self._get_auth_headers()
        url = f"{INPI_BASE_URL}/api/bilans/{clean_id}/download"
        client = self._get_client()

        for attempt in range(1, 4):
            try:
                await self._rate_limit()
                resp = await client.get(url, headers=headers)
                
                if resp.status_code == 200 and resp.content and resp.content.startswith(b"%PDF"):
                    self._cache_pdf[clean_id] = (time.time(), resp.content)
                    return resp.content
                elif resp.status_code in [401, 403] and attempt == 1:
                    headers = await self._get_auth_headers(force=True)
                    continue
                elif resp.status_code in [429, 503]:
                    await asyncio.sleep(attempt * 0.5)
                    continue
                else:
                    return None
            except Exception:
                await asyncio.sleep(attempt * 0.5)

        return None

    def clear_cache(self):
        """Clears in-memory caches."""
        self._cache_company.clear()
        self._cache_attachments.clear()
        if hasattr(self, "_cache_pdf"):
            self._cache_pdf.clear()

    async def close(self):
        """Closes the underlying HTTP client."""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()


# Global Singleton Instance
inpi_client = InpiRneClient()
