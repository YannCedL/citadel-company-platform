# Script d'Amorçage (Seed) — 200 Entreprises de Démonstration CITADEL 360°
# Extraction officielle certifiée auprès des registres légaux (INPI RNE / BODACC / INSEE)
# Cadencement à 800 ms entre chaque entreprise pour respecter scrupuleusement les quotas de l'État

import os
import sys
import time
import asyncio
import logging

# Configuration des chemins d'accès au monorepo
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PLATFORM_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "src"))
GENESIS_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "genesis-core", "src"))
ARGUS_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "argus-company-research", "src"))
ARIADNE_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "ariadne-corporate-graph", "src"))
CHAMBER_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "chamber-executive-network", "src"))
MERCURY_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "mercury-financial-intel", "src"))
RAVEN_SRC = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "raven-corporate-monitor", "src"))

for p in [PLATFORM_SRC, GENESIS_SRC, ARGUS_SRC, ARIADNE_SRC, CHAMBER_SRC, MERCURY_SRC, RAVEN_SRC]:
    if p not in sys.path:
        sys.path.insert(0, p)

from citadel_company_platform.engine import company_full_profile_async
from citadel_company_platform.sandbox.storage import SandboxDiskStorage

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("citadel.seed")

# LISTE OFFICIELLE DES 200 ENTREPRISES AVEC SIRENS CERTIFIÉS (2026)
SHOWCASE_200 = [
    # 1. CAC 40 & Géants Mondiaux
    ("775670417", "LVMH"),
    ("542051180", "TOTALENERGIES SE"),
    ("632012100", "L'OREAL"),
    ("395030844", "SANOFI"),
    ("383474814", "AIRBUS"),
    ("662042449", "BNP PARIBAS"),
    ("542048574", "SCHNEIDER ELECTRIC SE"),
    ("552096281", "AIR LIQUIDE"),
    ("572076396", "HERMES INTERNATIONAL"),
    ("562082909", "SAFRAN"),
    ("712049618", "ESSILORLUXOTTICA"),
    ("552037806", "VINCI"),
    ("722057460", "AXA FRANCE IARD"),
    ("552075020", "KERING"),
    ("552032534", "DANONE"),
    ("542065479", "STELLANTIS AUTO SAS"),
    ("582041943", "PERNOD RICARD"),
    ("542039532", "SAINT-GOBAIN"),
    ("542107651", "ENGIE"),
    ("775666399", "CAPGEMINI"),
    ("322306440", "DASSAULT SYSTEMES"),
    ("380129866", "ORANGE"),
    ("784608416", "CREDIT AGRICOLE SA"),
    ("855200507", "MICHELIN"),
    ("552120222", "SOCIETE GENERALE"),
    ("582005019", "LEGRAND"),
    ("403210032", "VEOLIA ENVIRONNEMENT"),
    ("542080601", "PUBLICIS GROUPE"),
    ("552059024", "THALES"),
    ("652014051", "CARREFOUR"),
    ("572015246", "BOUYGUES"),
    ("389058447", "ALSTOM"),
    ("441639465", "RENAULT"),
    ("329032238", "TELEPERFORMANCE"),
    ("390807907", "EUROFINS SCIENTIFIC"),
    ("524630373", "EDENRED"),
    ("682024096", "UNIBAIL-RODAMCO-WESTFIELD"),
    ("775724818", "BUREAU VERITAS"),
    ("602036444", "ACCOR"),
    ("343134763", "VIVENDI"),

    # 2. Tech, Licornes & ETI Numériques (Avec Mistral AI)
    ("491904546", "BLABLACAR (COMUTO)"),
    ("794598813", "DOCTOLIB"),
    ("424761419", "OVHCLOUD"),
    ("537604597", "MIRAKL"),
    ("752979930", "MANOMANO"),
    ("824012173", "SWILE"),
    ("819489626", "QONTO (OLINDA)"),
    ("818353070", "ALAN"),
    ("810708800", "PAYFIT"),
    ("533427191", "CONTENTSQUARE"),
    ("802073742", "LEDGER"),
    ("517887857", "VESTIAIRE COLLECTIVE"),
    ("803681758", "BACK MARKET"),
    ("844355844", "SORARE"),
    ("817723992", "MEERO"),
    ("898969829", "DEEZER"),
    ("484786413", "CRITEO"),
    ("484175252", "TALEND"),
    ("402968655", "DEVOTEAM"),
    ("326820065", "SOPRA STERIA GROUP"),
    ("323946491", "ATOS"),
    ("348607417", "ALTEN"),
    ("414763888", "AKKODIS"),
    ("418907861", "AUBAY"),
    ("339432635", "NEURONES"),
    ("418166021", "OCTO TECHNOLOGY"),
    ("377599386", "WAVESTONE"),
    ("342376332", "ILIAD (FREE)"),
    ("410218010", "CEGID"),
    ("952418325", "MISTRAL AI"),

    # 3. Grande Distribution & Commerce (Avec Coopérative U)
    ("306138900", "DECATHLON"),
    ("410409460", "AUCHAN HYPERMARCHES"),
    ("384560942", "LEROY MERLIN FRANCE"),
    ("055800239", "FNAC DARTY"),
    ("552116493", "GALERIES LAFAYETTE"),
    ("552018020", "MONOPRIX"),
    ("554501486", "CASINO GUICHARD PERRACHON"),
    ("393712286", "SEPHORA"),
    ("383196656", "MAISONS DU MONDE"),
    ("344103270", "KIABI EUROPE"),
    ("347384570", "BOULANGER"),
    ("542086616", "DARTY GRAND EST"),
    ("451678973", "CASTORAMA FRANCE"),
    ("389988411", "BRICO DEPOT"),
    ("380554303", "INTERMARCHE (ITM ALIMENTAIRE)"),
    ("304602956", "COOPERATIVE U"),
    ("383527330", "BRICOMARCHE"),
    ("313344301", "CELIO FRANCE"),
    ("345131049", "JULES"),
    ("675452775", "PROMOD"),
    ("615750007", "YVES ROCHER"),
    ("388752016", "MARIONNAUD PARFUMERIES"),
    ("388602187", "NOCIBE FRANCE"),
    ("784939688", "PICARD SURGELES"),
    ("384879946", "GRAND FRAIS (PROSOL)"),

    # 4. Industrie, Aéronautique, Défense & Transports (Avec STEF corrigé & OpMobility)
    ("562024422", "CMA CGM"),
    ("552043021", "AIR FRANCE KLM"),
    ("712042456", "DASSAULT AVIATION"),
    ("441179993", "NAVAL GROUP"),
    ("388408247", "NEXTER SYSTEMS (KNDS)"),
    ("808332670", "SNCF"),
    ("775663438", "RATP"),
    ("552016628", "AEROPORTS DE PARIS (ADP)"),
    ("552058463", "KEOLIS"),
    ("521352989", "TRANSDEV GROUP"),
    ("542050836", "GEODIS"),
    ("055804124", "BOLLORE"),
    ("399361930", "STEF SA"),
    ("445074602", "ARKEMA"),
    ("552142200", "VALLOUREC"),
    ("632045381", "ERAMET"),
    ("562008151", "IMERYS"),
    ("393525852", "NEXANS"),
    ("552008443", "BIC"),
    ("302554985", "SEB SA"),
    ("303970297", "SOMFY"),
    ("552030967", "VALEO"),
    ("542022710", "FORVIA (FAURECIA)"),
    ("035680156", "OPMOBILITY SE"),
    ("582146015", "REMY COINTREAU"),
    ("444314454", "TIKEHAU CAPITAL"),
    ("572043966", "EURAZEO"),
    ("572016459", "WENDEL"),
    ("542023841", "FIVES"),
    ("857802508", "MANITOU BF"),

    # 5. Banque, Assurance, Big 4 (Avec Bpifrance, PwC, Emeis, Clariane)
    ("343115135", "GROUPAMA ASSURANCES MUTUELLES"),
    ("450527635", "COVEA"),
    ("775709702", "MAIF"),
    ("781456512", "MACIF"),
    ("775701477", "MATMUT"),
    ("341737062", "CNP ASSURANCES"),
    ("542044524", "NATIXIS"),
    ("421100645", "LA BANQUE POSTALE"),
    ("493455042", "BPCE"),
    ("348779034", "CREDIT MUTUEL ALLIANCE FEDERALE"),
    ("302519228", "ROTHSCHILD & CO"),
    ("320252489", "BPIFRANCE SA"),
    ("702022724", "KAUFMAN & BROAD"),
    ("444346795", "NEXITY"),
    ("335480877", "ALTAREA"),
    ("582074944", "ICADE"),
    ("780152914", "KLEPIERRE"),
    ("592014419", "GECINA"),
    ("672006483", "PRICEWATERHOUSECOOPERS AUDIT (PwC)"),
    ("341498186", "CENTURY 21 FRANCE"),
    ("398188185", "EMEIS (EX-ORPEA)"),
    ("447800475", "CLARIANE (EX-KORIAN)"),
    ("775726417", "KPMG SA"),
    ("398436576", "DELOITTE CONSEIL"),
    ("344366315", "ERNST & YOUNG (EY)"),

    # 6. Agroalimentaire, Luxe, Mode & Cosmétiques
    ("331142577", "LACTALIS (BSA)"),
    ("847120185", "SAVENCIA (BONGRAIN)"),
    ("542088067", "BEL (FROMAGERIES BEL)"),
    ("301940219", "SODEXO"),
    ("408168003", "ELIOR GROUP"),
    ("494273873", "TEREOS"),
    ("448350058", "ROQUETTE FRERES"),
    ("329590821", "AVRIL (SOPROGROS)"),
    ("447250044", "BONDUELLE"),
    ("572058329", "FLEURY MICHON"),
    ("378036230", "LABEYRIE FINE FOODS"),
    ("312450075", "ANDROS"),
    ("572099497", "LINDT & SPRUNGLI FRANCE"),
    ("338275522", "CHANEL SAS"),
    ("612035832", "CHRISTIAN DIOR"),
    ("318363841", "LOUIS VUITTON MALLETIER"),
    ("428755839", "GUCCI FRANCE"),
    ("339794562", "BALENCIAGA"),
    ("303497556", "SAINT LAURENT PARIS"),
    ("552051427", "GIVENCHY"),
    ("572172104", "CELINE"),
    ("390589331", "CLARINS"),
    ("722026853", "SISLEY"),
    ("337651061", "L'OCCITANE FRANCAISE"),
    ("342241825", "NUXE"),

    # 7. Santé, Énergie, BTP & Médias
    ("345035257", "SANOFI WINTHROP INDUSTRIE"),
    ("085480796", "SERVIER (LABORATOIRES)"),
    ("668800261", "PIERRE FABRE"),
    ("382894327", "BIOCOOP"),
    ("562058867", "BOIRON"),
    ("673620399", "BIOMERIEUX"),
    ("419838529", "IPSEN"),
    ("308641547", "GUERBET"),
    ("552081317", "EDF (ELECTRICITE DE FRANCE)"),
    ("444619258", "RTE"),
    ("444608442", "ENEDIS"),
    ("444786511", "GRDF"),
    ("709804839", "EIFFAGE"),
    ("662049287", "SPIE"),
    ("552025314", "COLAS"),
    ("348866260", "EUROVIA"),
    ("542016654", "SOCOTEC"),
    ("534747043", "APAVE"),
    ("333069527", "DEKRA INDUSTRIAL"),
    ("326300159", "TF1"),
    ("339012452", "METROPOLE TELEVISION (M6)"),
    ("329211534", "CANAL+"),
    ("433521093", "LE MONDE"),
    ("542077755", "LE FIGARO"),
    ("582073744", "LES ECHOS")
]

async def run_seed(limit: int = 200, delay_seconds: float = 0.8):
    storage = SandboxDiskStorage()
    logger.info(f"Demarrage du seed : {limit} entreprises cibles. Entreprises deja en cache : {storage.count()}")

    success_count = 0
    already_cached_count = 0
    failed_count = 0

    targets = SHOWCASE_200[:limit]

    for idx, (siren, name) in enumerate(targets, 1):
        if storage.has_company(siren):
            logger.info(f"[{idx}/{len(targets)}] {name} ({siren}) : DEJA EN CACHE DISQUE.")
            already_cached_count += 1
            continue

        logger.info(f"[{idx}/{len(targets)}] Extraction officielle 360° pour {name} ({siren})...")
        try:
            contract = await company_full_profile_async(siren, force_refresh=True)
            if contract and contract.result and contract.result.get("siren"):
                storage.save_company(siren, contract)
                logger.info(f" -> {name} ({siren}) : ENREGISTRE AVEC SUCCES.")
                success_count += 1
            else:
                logger.warning(f" -> {name} ({siren}) : Profil incomplet.")
                failed_count += 1
        except Exception as e:
            logger.error(f" -> {name} ({siren}) : Erreur lors de l'extraction : {e}")
            failed_count += 1

        # Pause régulée pour respecter les serveurs de l'État
        await asyncio.sleep(delay_seconds)

    logger.info("=" * 60)
    logger.info(f"BILAN DU SEED SANDBOX :")
    logger.info(f"- Deja en cache : {already_cached_count}")
    logger.info(f"- Nouveaux ajouts : {success_count}")
    logger.info(f"- Echecs : {failed_count}")
    logger.info(f"- Total entreprises disponibles dans le catalogue : {storage.count()}/350")
    logger.info("=" * 60)

if __name__ == "__main__":
    max_to_seed = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    asyncio.run(run_seed(limit=max_to_seed, delay_seconds=0.8))
