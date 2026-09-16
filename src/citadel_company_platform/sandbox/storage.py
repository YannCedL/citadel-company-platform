# Moteur de Cache Persistant sur Disque — CITADEL 360°
# Micro-Action 2.1 : Sauvegarde JSON certifiée, indexation mémoire O(1) et sérialisation Pydantic
import os
import json
import logging
from typing import Dict, Any, Optional, Set

logger = logging.getLogger("citadel.sandbox.storage")

class SandboxDiskStorage:
    def __init__(self, storage_dir: Optional[str] = None):
        if storage_dir is None:
            # Répertoire par défaut : apps/citadel-company-platform/data/sandbox_cache
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "sandbox_cache"))
        else:
            base_dir = storage_dir
            
        self.storage_dir = base_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Index en mémoire vive (O(1)) des SIRENs déjà persistés
        self.indexed_sirens: Set[str] = set()
        self.indexed_names: Dict[str, str] = {} # Nom/Raison sociale -> SIREN
        self._refresh_index()

    def _refresh_index(self):
        """Scanne le dossier de cache en quelques millisecondes et charge l'index."""
        self.indexed_sirens.clear()
        self.indexed_names.clear()
        
        try:
            for filename in os.listdir(self.storage_dir):
                if filename.endswith(".json"):
                    siren = filename[:-5]
                    if len(siren) == 9 and siren.isdigit():
                        self.indexed_sirens.add(siren)
                        # Lecture légère du nom si disponible
                        try:
                            filepath = os.path.join(self.storage_dir, filename)
                            with open(filepath, "r", encoding="utf-8") as f:
                                data = json.load(f)
                                res = data.get("result", {})
                                name = res.get("company_name") or res.get("name")
                                if name:
                                    self.indexed_names[name.upper().strip()] = siren
                        except Exception:
                            pass
            logger.info(f"Sandbox storage synchronise : {len(self.indexed_sirens)} entreprises en cache.")
        except Exception as e:
            logger.error(f"Erreur lors du scan du cache sandbox : {e}")

    def has_company(self, siren: str) -> bool:
        """Vérifie instantanément (O(1)) si l'entreprise est déjà enregistrée."""
        clean_siren = str(siren).strip()
        return clean_siren in self.indexed_sirens

    def get_company(self, siren: str) -> Optional[Dict[str, Any]]:
        """Récupère la fiche complète 360° depuis le fichier JSON."""
        clean_siren = str(siren).strip()
        if not self.has_company(clean_siren):
            return None
            
        filepath = os.path.join(self.storage_dir, f"{clean_siren}.json")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erreur de lecture du cache pour {clean_siren} : {e}")
            return None

    def save_company(self, siren: str, contract_dict_or_obj: Any) -> bool:
        """
        Enregistre une nouvelle entreprise sur le disque.
        Sérialisation robuste pour éviter les crashes sur dates ou objets spécifiques.
        """
        clean_siren = str(siren).strip()
        if not clean_siren or len(clean_siren) != 9 or not clean_siren.isdigit():
            return False

        # Conversion en dictionnaire sérialisable
        if hasattr(contract_dict_or_obj, "model_dump"):
            payload = contract_dict_or_obj.model_dump(mode="json")
        elif hasattr(contract_dict_or_obj, "dict"):
            payload = contract_dict_or_obj.dict()
        elif isinstance(contract_dict_or_obj, dict):
            payload = contract_dict_or_obj
        else:
            return False

        filepath = os.path.join(self.storage_dir, f"{clean_siren}.json")
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
                
            self.indexed_sirens.add(clean_siren)
            res = payload.get("result", {})
            name = res.get("company_name") or res.get("name")
            if name:
                self.indexed_names[name.upper().strip()] = clean_siren
            return True
        except Exception as e:
            logger.error(f"Erreur d'ecriture du cache pour {clean_siren} : {e}")
            return False

    def count(self) -> int:
        """Nombre total d'entreprises en cache."""
        return len(self.indexed_sirens)
