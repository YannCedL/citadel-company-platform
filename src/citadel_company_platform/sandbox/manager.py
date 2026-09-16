# Contrôleur & Garde-Barrière Sandbox — CITADEL 360°
# Micro-Action 2.2 : Quota 350 entreprises au total, max 5 ajouts/IP, réponses polies 403
import logging
from typing import Dict, Set, Optional, Any
from fastapi import HTTPException
from .storage import SandboxDiskStorage

logger = logging.getLogger("citadel.sandbox.manager")

# Paramètres configurables
MAX_TOTAL_COMPANIES = 350      # 200 vitrines de base + 150 ajouts autorisés
MAX_DISCOVERIES_PER_IP = 5     # 5 nouvelles entreprises autorisées par testeur/IP

FORBIDDEN_GLOBAL_QUOTA = (
    "Environnement Sandbox : Le quota de demonstration (350 entreprises) est atteint "
    "pour proteger les quotas API officiels. Vous pouvez consulter librement les 350 "
    "entreprises du catalogue ou nous contacter pour une demonstration complete sans limite."
)

FORBIDDEN_USER_QUOTA = (
    "Environnement Sandbox : Vous avez utilise vos 5 recherches d'entreprises inedites autorisees. "
    "Vous pouvez continuer a explorer et comparer librement les centaines d'entreprises deja "
    "enregistrees dans le catalogue, ou nous contacter sur LinkedIn pour un acces complet."
)

class SandboxManager:
    def __init__(self, storage: Optional[SandboxDiskStorage] = None):
        self.storage = storage or SandboxDiskStorage()
        # IP -> Set des SIRENs inédits découverts par cette IP
        self.ip_discoveries: Dict[str, Set[str]] = {}

    def is_cached(self, siren: str) -> bool:
        """Retourne True si l'entreprise est déjà présente dans le cache (accès illimité)."""
        return self.storage.has_company(siren)

    def get_cached_profile(self, siren: str):
        """Récupère directement le profil mis en cache."""
        return self.storage.get_company(siren)

    def can_explore_new_company(self, client_ip: str, siren: str) -> bool:
        """
        Vérifie si une nouvelle entreprise peut être interrogée auprès des API d'État.
        Lève une exception HTTPException 403 explicite en cas de dépassement.
        """
        # 1. Si déjà en cache -> Toujours autorisé (0 quota)
        if self.is_cached(siren):
            return True

        # 2. Vérification du Plafond Global du Serveur
        current_total = self.storage.count()
        if current_total >= MAX_TOTAL_COMPANIES:
            logger.warning(f"Quota global atteint ({current_total}/{MAX_TOTAL_COMPANIES})")
            raise HTTPException(
                status_code=403,
                detail=FORBIDDEN_GLOBAL_QUOTA
            )

        # 3. Vérification du Quota par Visiteur (IP)
        discovered = self.ip_discoveries.get(client_ip, set())
        if len(discovered) >= MAX_DISCOVERIES_PER_IP and siren not in discovered:
            logger.info(f"Visiteur {client_ip} a atteint sa limite de 5 decouvertes.")
            raise HTTPException(
                status_code=403,
                detail=FORBIDDEN_USER_QUOTA
            )

        return True

    def record_new_discovery(self, client_ip: str, siren: str, contract_data: Any) -> bool:
        """Enregistre une nouvelle entreprise découverte sur le disque et comptabilise le quota."""
        saved = self.storage.save_company(siren, contract_data)
        if saved:
            if client_ip not in self.ip_discoveries:
                self.ip_discoveries[client_ip] = set()
            self.ip_discoveries[client_ip].add(str(siren).strip())
            logger.info(f"Nouvelle entreprise {siren} enregistree. Total cache : {self.storage.count()}/{MAX_TOTAL_COMPANIES}")
        return saved
