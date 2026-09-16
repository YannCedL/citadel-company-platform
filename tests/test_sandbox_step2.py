# Tests Unitaires — Étape 2 : Moteur Sandbox & Cache Persistant
import os
import shutil
import tempfile
import pytest
from fastapi import HTTPException
from citadel_company_platform.sandbox.storage import SandboxDiskStorage
from citadel_company_platform.sandbox.manager import (
    SandboxManager,
    MAX_TOTAL_COMPANIES,
    MAX_DISCOVERIES_PER_IP
)

@pytest.fixture
def temp_sandbox_dir():
    temp_dir = tempfile.mkdtemp(prefix="citadel_test_sandbox_")
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)

def test_storage_save_and_retrieve(temp_sandbox_dir):
    storage = SandboxDiskStorage(storage_dir=temp_sandbox_dir)
    assert storage.count() == 0

    siren = "552032534" # Danone
    dummy_payload = {
        "siren": siren,
        "result": {"company_name": "DANONE", "siren": siren}
    }

    assert storage.save_company(siren, dummy_payload) is True
    assert storage.count() == 1
    assert storage.has_company(siren) is True

    # Récupération
    retrieved = storage.get_company(siren)
    assert retrieved is not None
    assert retrieved["result"]["company_name"] == "DANONE"

def test_storage_persistence_after_restart(temp_sandbox_dir):
    # Première session
    storage1 = SandboxDiskStorage(storage_dir=temp_sandbox_dir)
    storage1.save_company("306138900", {"result": {"company_name": "DECATHLON"}})
    assert storage1.count() == 1

    # Deuxième session simulant un redémarrage du serveur
    storage2 = SandboxDiskStorage(storage_dir=temp_sandbox_dir)
    assert storage2.count() == 1
    assert storage2.has_company("306138900") is True
    assert storage2.get_company("306138900")["result"]["company_name"] == "DECATHLON"

def test_manager_allow_cached_always(temp_sandbox_dir):
    storage = SandboxDiskStorage(storage_dir=temp_sandbox_dir)
    storage.save_company("552032534", {"result": {"company_name": "DANONE"}})
    manager = SandboxManager(storage=storage)

    # Même si une IP a fait 100 requêtes, une entreprise en cache est TOUJOURS autorisée
    assert manager.can_explore_new_company("192.168.1.50", "552032534") is True

def test_manager_enforces_user_quota(temp_sandbox_dir):
    storage = SandboxDiskStorage(storage_dir=temp_sandbox_dir)
    manager = SandboxManager(storage=storage)
    client_ip = "203.0.113.19"

    # L'IP découvre 5 nouvelles entreprises
    for i in range(MAX_DISCOVERIES_PER_IP):
        test_siren = f"10000000{i}"
        assert manager.can_explore_new_company(client_ip, test_siren) is True
        manager.record_new_discovery(client_ip, test_siren, {"result": {"company_name": f"PME {i}"}})

    # À la 6ème entreprise inédite -> Doit lever HTTP 403
    with pytest.raises(HTTPException) as exc:
        manager.can_explore_new_company(client_ip, "999999999")
    assert exc.value.status_code == 403
    assert "5 recherches" in exc.value.detail

    # Mais une entreprise déjà enregistrée reste consultable sans 403
    assert manager.can_explore_new_company(client_ip, "100000000") is True
