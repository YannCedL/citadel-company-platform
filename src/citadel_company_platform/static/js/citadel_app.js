// ==========================================================================
// CITADEL 360° — INSTITUTIONAL PALETTE & CHART.JS ENGINE
// Theme: Or Ambré & Carbone Minéral (High Finance & Sovereign OSINT)
// ==========================================================================
const CITADEL_PALETTE = {
  // Sovereign Entity (Or Ambré — Prestige, Autorité, Cible Principale)
  gold: '#D99B43',
  goldLight: '#F3BA63',
  goldDark: '#9A6A2F',
  goldGlow: 'rgba(217, 155, 67, 0.25)',

  // Benchmark / Competitor (Bleu Acier & Argent Métallique — Altérité, Neutralité)
  steel: '#4A6FA5',
  steelLight: '#7B9EC8',
  steelMuted: 'rgba(74, 111, 165, 0.25)',
  silver: '#94A3B8',

  // Vitalité Opérationnelle & Solvabilité (Vert Émeraude / Sauge — Santé, Actifs, Fonds Propres)
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldMuted: 'rgba(16, 185, 129, 0.22)',
  sauge: '#10B981',

  // Risque Légal, Cessation & Passif (Rouge Vermillon / Carmin — Alerte, Fermeture, Dette)
  vermillon: '#E11D48',
  vermillonLight: '#FB7185',
  vermillonMuted: 'rgba(225, 29, 72, 0.25)',

  // Mobilité Stratégique & Opérations (Bleu Cobalt / Saphir — Transfert, M&A, EBITDA)
  cobalt: '#3B82F6',
  cobaltLight: '#60A5FA',
  cobaltMuted: 'rgba(59, 130, 246, 0.25)',

  // Gouvernance Neutre & Historique (Ardoise Minérale — Mandats secondaires, Statuts)
  slate: '#475569',
  slateDark: '#334155',
  slateMuted: '#64748B',

  // Surfaces & Base (Carbone Minéral)
  carbon: '#090D14',
  surface: '#111726',
  card: '#0F172A',
  border: '#1E293B',
  gridLine: 'rgba(30, 41, 59, 0.45)',
  textMuted: '#64748B',
  textLight: '#F1F5F9',
  nobleDonut: ['#D99B43', '#10B981', '#3B82F6', '#4A6FA5', '#E11D48', '#94A3B8']
};

if (window.Chart) {
  Chart.defaults.color = CITADEL_PALETTE.silver;
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.font.size = 10.5;

  if (Chart.defaults.scale && Chart.defaults.scale.grid) {
    Chart.defaults.scale.grid.color = CITADEL_PALETTE.gridLine;
    Chart.defaults.scale.grid.borderColor = CITADEL_PALETTE.border;
    Chart.defaults.scale.grid.tickColor = 'transparent';
  }

  if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
    Chart.defaults.plugins.tooltip.backgroundColor = CITADEL_PALETTE.surface;
    Chart.defaults.plugins.tooltip.titleColor = CITADEL_PALETTE.gold;
    Chart.defaults.plugins.tooltip.bodyColor = CITADEL_PALETTE.textLight;
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(217, 155, 67, 0.4)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.bodyFont = {
      family: "'IBM Plex Mono', monospace",
      weight: 'bold'
    };
  }
}

    const { createApp, ref, computed, watch, onMounted, nextTick } = Vue;

    createApp({
      setup() {
        const searchQuery = ref('');
        const activeSiren = ref('');
        const pendingQuery = ref('');
        const isLoading = ref(false);
        const hasSearched = ref(false);
        const executionTime = ref('0.00');
        const activeMetric = ref('revenue');
        const resultData = ref(null);

        // Analytics & BI Studio Mode States
        const activeTab = ref('osint'); // 'osint' or 'analytics'
        const analyticsSubTab = ref('network'); // 'network', 'governance', 'regulatory', 'financials'
        const expansionStatusFilter = ref('all'); // 'all', 'active', 'closed'
        const expansionTimeRange = ref('all');   // 'all', 'last10', 'last5', 'peak'
        const biGeoGranularity = ref('region'); // 'region' or 'department'
        const biSortKey = ref('total'); // 'total', 'active', 'closed', 'activity_rate', 'relocations', 'final_closures', 'lifespan'
        const biSortAsc = ref(false);
        const biTimelineRegionFilter = ref('all');
        const biTimelineDeptFilter = ref('all');
        const benchmarkSearchQuery = ref('');
        const benchmarkData = ref(null);
        const isBenchmarkLoading = ref(false);
        const showBenchmarkDisambiguationModal = ref(false);
        const benchmarkCandidateList = ref([]);
        const pendingBenchmarkQuery = ref('');

        // Chart.js Instances
        let networkDonutChart = null;
        let decadesBarChart = null;
        let executivesDonutChart = null;
        let executivesRoleChart = null;
        let bodaccCategoryChart = null;
        let bodaccTimelineChart = null;
        let financialsBarChart = null;
        let financialMarginsChart = null;
        let financialBalanceSheetChart = null;
        let biTimelineComboChart = null;
        let biGeoStackedChart = null;
        let biTransfersChart = null;
        let biClosureReasonChart = null;

        // Cache & Session Storage Management States
        const showCacheNotice = ref(false);
        const cacheNoticeMessage = ref('');

        // Disambiguation Modal States
        const showDisambiguationModal = ref(false);
        const candidateList = ref([]);

        // New Inspector Modals States
        const showLegalProfileModal = ref(false);
        const showGovernanceModal = ref(false);
        const selectedExecutive = ref(null);
        const execSearchQuery = ref('');
        const execStatusFilter = ref('all'); // 'all', 'direction', 'audit', 'active', 'former'
        const execSearchQueryHub = ref('');
        const execFilterCategoryHub = ref('all'); // 'all', 'active', 'former', 'physical', 'moral'
        const auditFilterStatus = ref('all'); // 'all', 'active', 'former'
        const showFinancialsModal = ref(false);
        const showEstablishmentsModal = ref(false);
        const siteSearchQuery = ref('');
        const selectedSiteNode = ref(null);
        const showInterconnectionModal = ref(false);
        const loadingHoldingSiren = ref(null);

        // Raven Timeline Filter & Inspection States
        const selectedRavenCategory = ref(null);
        const ravenSearchText = ref('');
        const selectedRavenYear = ref(null);
        const selectedNoticeEvent = ref(null);

        // Map Selection & Regional Filter States
        const siteStatusFilter = ref('all'); // 'all', 'active', 'closed'
        const selectedRegion = ref(null);
        const selectedDepartment = ref(null);
        const selectedNode = ref(null);
        let leafletMap = null;
        let markersGroup = null;

        const DEPT_TO_REGION = {
          "01": "Auvergne-Rhône-Alpes", "03": "Auvergne-Rhône-Alpes", "07": "Auvergne-Rhône-Alpes", "15": "Auvergne-Rhône-Alpes", "26": "Auvergne-Rhône-Alpes", "38": "Auvergne-Rhône-Alpes", "42": "Auvergne-Rhône-Alpes", "43": "Auvergne-Rhône-Alpes", "63": "Auvergne-Rhône-Alpes", "69": "Auvergne-Rhône-Alpes", "73": "Auvergne-Rhône-Alpes", "74": "Auvergne-Rhône-Alpes",
          "02": "Hauts-de-France", "59": "Hauts-de-France", "60": "Hauts-de-France", "62": "Hauts-de-France", "80": "Hauts-de-France",
          "04": "Provence-Alpes-Côte d'Azur", "05": "Provence-Alpes-Côte d'Azur", "06": "Provence-Alpes-Côte d'Azur", "13": "Provence-Alpes-Côte d'Azur", "83": "Provence-Alpes-Côte d'Azur", "84": "Provence-Alpes-Côte d'Azur",
          "08": "Grand Est", "10": "Grand Est", "51": "Grand Est", "52": "Grand Est", "54": "Grand Est", "55": "Grand Est", "57": "Grand Est", "67": "Grand Est", "68": "Grand Est", "88": "Grand Est",
          "09": "Occitanie", "11": "Occitanie", "12": "Occitanie", "30": "Occitanie", "31": "Occitanie", "32": "Occitanie", "34": "Occitanie", "46": "Occitanie", "48": "Occitanie", "65": "Occitanie", "66": "Occitanie", "81": "Occitanie", "82": "Occitanie",
          "14": "Normandie", "27": "Normandie", "50": "Normandie", "61": "Normandie", "76": "Normandie",
          "16": "Nouvelle-Aquitaine", "17": "Nouvelle-Aquitaine", "19": "Nouvelle-Aquitaine", "23": "Nouvelle-Aquitaine", "24": "Nouvelle-Aquitaine", "33": "Nouvelle-Aquitaine", "40": "Nouvelle-Aquitaine", "47": "Nouvelle-Aquitaine", "64": "Nouvelle-Aquitaine", "79": "Nouvelle-Aquitaine", "86": "Nouvelle-Aquitaine", "87": "Nouvelle-Aquitaine",
          "18": "Centre-Val de Loire", "28": "Centre-Val de Loire", "36": "Centre-Val de Loire", "37": "Centre-Val de Loire", "41": "Centre-Val de Loire", "45": "Centre-Val de Loire",
          "21": "Bourgogne-Franche-Comté", "25": "Bourgogne-Franche-Comté", "39": "Bourgogne-Franche-Comté", "58": "Bourgogne-Franche-Comté", "70": "Bourgogne-Franche-Comté", "71": "Bourgogne-Franche-Comté", "89": "Bourgogne-Franche-Comté", "90": "Bourgogne-Franche-Comté",
          "22": "Bretagne", "29": "Bretagne", "35": "Bretagne", "56": "Bretagne",
          "2A": "Corse", "2B": "Corse", "20": "Corse",
          "44": "Pays de la Loire", "49": "Pays de la Loire", "53": "Pays de la Loire", "72": "Pays de la Loire", "85": "Pays de la Loire",
          "75": "Île-de-France", "77": "Île-de-France", "78": "Île-de-France", "91": "Île-de-France", "92": "Île-de-France", "93": "Île-de-France", "94": "Île-de-France", "95": "Île-de-France",
          "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
        };

        function getRegionForDept(deptCode) {
          return DEPT_TO_REGION[deptCode] || "Autres / Non spécifié";
        }

        const DEPT_GPS = {
          "01": [46.2052, 5.2255], "02": [49.5641, 3.6206], "03": [46.5652, 3.3323], "06": [43.7102, 7.2620],
          "13": [43.2965, 5.3698], "14": [49.1828, -0.3707], "21": [47.3220, 5.0415], "29": [48.3904, -4.4861],
          "31": [43.6047, 1.4442], "33": [44.8378, -0.5792], "34": [43.6108, 3.8767], "35": [48.1173, -1.6778],
          "38": [45.1885, 5.7245], "44": [47.2184, -1.5536], "45": [47.9029, 1.9038], "49": [47.4784, -0.5632],
          "51": [48.9566, 4.3638], "54": [48.6921, 6.1844], "57": [49.1193, 6.1757], "59": [50.6292, 3.0573],
          "60": [49.4179, 2.0858], "62": [50.2910, 2.7775], "63": [45.7772, 3.0870], "67": [48.5734, 7.7521],
          "68": [47.7508, 7.3359], "69": [45.7640, 4.8357], "75": [48.8566, 2.3522], "76": [49.4431, 1.0993],
          "77": [48.5421, 2.6554], "78": [48.8049, 2.1301], "80": [49.8941, 2.2957], "83": [43.1242, 5.9280],
          "84": [43.9493, 4.8055], "85": [46.6705, -1.4265], "91": [48.6238, 2.4414], "92": [48.8924, 2.2361],
          "93": [48.9086, 2.4397], "94": [48.7904, 2.4556], "95": [49.0362, 2.0631]
        };

        function resetToLanding() {
          hasSearched.value = false;
          resultData.value = null;
          searchQuery.value = '';
          siteStatusFilter.value = 'all';
          selectedRegion.value = null;
          selectedDepartment.value = null;
          selectedNode.value = null;
          showDisambiguationModal.value = false;
          showLegalProfileModal.value = false;
          showGovernanceModal.value = false;
          selectedExecutive.value = null;
          execSearchQuery.value = '';
          execStatusFilter.value = 'all';
          execSearchQueryHub.value = '';
          execFilterCategoryHub.value = 'all';
          auditFilterStatus.value = 'all';
          biGeoGranularity.value = 'region';
          biSortKey.value = 'total';
          biSortAsc.value = false;
          biTimelineRegionFilter.value = 'all';
          biTimelineDeptFilter.value = 'all';
          showFinancialsModal.value = false;
          showEstablishmentsModal.value = false;
          siteSearchQuery.value = '';
          selectedSiteNode.value = null;
          selectedRavenCategory.value = null;
          selectedRavenYear.value = null;
          ravenSearchText.value = '';
          selectedNoticeEvent.value = null;
          showInterconnectionModal.value = false;
          loadingHoldingSiren.value = null;

          activeTab.value = 'osint';
          analyticsSubTab.value = 'network';
          benchmarkData.value = null;
          benchmarkSearchQuery.value = '';
          showBenchmarkDisambiguationModal.value = false;

          try {
            window.history.pushState({}, '', window.location.pathname);
          } catch(e) {}

          if (leafletMap) {
            leafletMap.remove();
            leafletMap = null;
            markersGroup = null;
          }
        }

        // Tab Navigation & Chart Triggers
        function switchTab(tab) {
          activeTab.value = tab;
          if (tab === 'analytics') {
            renderCurrentAnalyticsTab();
          } else if (tab === 'osint') {
            nextTick(() => {
              setTimeout(() => {
                initOrUpdateMap();
              }, 150);
            });
          }
        }

        function switchAnalyticsSubTab(subTab) {
          analyticsSubTab.value = subTab;
          renderCurrentAnalyticsTab();
        }

        function renderCurrentAnalyticsTab() {
          if (activeTab.value !== 'analytics') return;

          nextTick(() => {
            setTimeout(() => {
              if (activeTab.value !== 'analytics') return;

              if (analyticsSubTab.value === 'network') {
                renderNetworkCharts();
                renderBiStudioCharts();
              } else if (analyticsSubTab.value === 'governance') {
                renderGovernanceCharts();
              } else if (analyticsSubTab.value === 'regulatory') {
                renderBodaccCharts();
              } else if (analyticsSubTab.value === 'financials') {
                renderFinancialCharts();
              }
            }, 50);
          });
        }

        // Benchmark competitor actions
        async function handleBenchmarkSubmit() {
          const q = benchmarkSearchQuery.value.trim();
          if (!q) return;

          const sirenMatch = q.replace(/\s+/g, '').match(/^\d{9}$/);
          if (sirenMatch) {
            executeBenchmarkAnalysis(sirenMatch[0]);
            return;
          }

          pendingBenchmarkQuery.value = q;
          isBenchmarkLoading.value = true;
          try {
            const res = await fetch('/api/v1/company/search/candidates/' + encodeURIComponent(q));
            if (res.ok) {
              const data = await res.json();
              if (data.candidates && data.candidates.length > 0) {
                benchmarkCandidateList.value = data.candidates;
                showBenchmarkDisambiguationModal.value = true;
                isBenchmarkLoading.value = false;
                return;
              }
            }
          } catch(e) {
            console.error(e);
          }

          isBenchmarkLoading.value = false;
          executeBenchmarkAnalysis(q);
        }

        function confirmBenchmarkCandidate(siren) {
          showBenchmarkDisambiguationModal.value = false;
          executeBenchmarkAnalysis(siren);
        }

        async function executeBenchmarkAnalysis(targetSirenOrName) {
          isBenchmarkLoading.value = true;
          try {
            const endpoint = '/api/v1/company/' + encodeURIComponent(targetSirenOrName);
            const res = await fetch(endpoint);
            if (res.ok) {
              const data = await res.json();
              if (data && data.result) {
                benchmarkData.value = data.result;
                renderCurrentAnalyticsTab();
              }
            }
          } catch(e) {
            console.error(e);
          } finally {
            isBenchmarkLoading.value = false;
          }
        }

        function removeBenchmarkCompetitor() {
          benchmarkData.value = null;
          benchmarkSearchQuery.value = '';
          renderCurrentAnalyticsTab();
        }

        async function clearServerAndSessionCache() {
          let sessionClearedCount = 0;
          try {
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
              const key = sessionStorage.key(i);
              if (key && key.startsWith('citadel_cache_')) {
                sessionStorage.removeItem(key);
                sessionClearedCount++;
              }
            }
          } catch(e) {}

          try {
            const res = await fetch('/api/v1/cache/clear', { method: 'POST' });
            if (res.ok) {
              const data = await res.json();
              cacheNoticeMessage.value = `🧹 Cache in-memory vuidé avec succès : ${data.entries_before} entreprise(s) en cache avant suppression → ${data.entries_after} entreprise(s) restante(s) à la fin. (${sessionClearedCount} ancienne(s) recherche(s) purgée(s) de sessionStorage).`;
              showCacheNotice.value = true;
              setTimeout(() => { showCacheNotice.value = false; }, 8000);
            }
          } catch(e) {
            console.error(e);
          }
        }

        // BI Metrics & Formulas
        function calculateMarginRate(data) {
          if (!data) return 'N/D (Confidentiel)';
          const balance = data?.legal_profile?.financials?.latest_balance_sheet || data?.financials?.latest_balance_sheet;
          const rev = balance?.revenue;
          const net = balance?.net_income;
          if (rev && net && rev > 0) {
            const rate = ((net / rev) * 100).toFixed(1);
            return (rate >= 0 ? '+' : '') + rate + '%';
          }
          return 'N/D (Confidentiel)';
        }

        function calculateRealignmentIndex(nodes) {
          if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return '0.0';
          const closedCount = nodes.filter(n => n.etat_administratif === 'F').length;
          return ((closedCount / nodes.length) * 100).toFixed(1);
        }

        // Chart.js renderers
        function renderNetworkCharts() {
          const donutCtx = document.getElementById('networkDonutCanvas');
          if (donutCtx) {
            if (networkDonutChart) { networkDonutChart.destroy(); networkDonutChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(donutCtx);
              if (existing) existing.destroy();
            }

            const activeCount = activeEstablishments.value;
            const closedCount = closedEstablishments.value;

            const datasets = [{
              label: displayCompanyName.value,
              data: [activeCount, closedCount],
              backgroundColor: [CITADEL_PALETTE.emerald, CITADEL_PALETTE.slate],
              borderWidth: 2,
              borderColor: CITADEL_PALETTE.surface
            }];

            if (benchmarkData.value) {
              datasets.push({
                label: benchmarkCompanyName.value,
                data: [benchmarkActiveEstablishments.value, benchmarkTotalEstablishments.value - benchmarkActiveEstablishments.value],
                backgroundColor: [CITADEL_PALETTE.steel, CITADEL_PALETTE.slateDark],
                borderWidth: 2,
                borderColor: CITADEL_PALETTE.surface
              });
            }

            networkDonutChart = new Chart(donutCtx, {
              type: 'doughnut',
              data: {
                labels: benchmarkData.value 
                  ? ['🟢 Actifs (' + displayCompanyName.value + ')', '⚪ Clos (' + displayCompanyName.value + ')', '🟢 Actifs (' + benchmarkCompanyName.value + ')', '⚪ Clos (' + benchmarkCompanyName.value + ')']
                  : ['🟢 Établissements Actifs', '⚪ Établissements Historiques Clos'],
                datasets: datasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }

          const decadesCtx = document.getElementById('decadesBarCanvas');
          if (decadesCtx) {
            if (decadesBarChart) { decadesBarChart.destroy(); decadesBarChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(decadesCtx);
              if (existing) existing.destroy();
            }

            const getYearMap = (nodes, graphData) => {
              const map = {};
              if (nodes && Array.isArray(nodes) && nodes.length > 0) {
                nodes.forEach(n => {
                  if (expansionStatusFilter.value === 'active' && n.etat_administratif !== 'A') return;
                  if (expansionStatusFilter.value === 'closed' && n.etat_administratif !== 'F') return;
                  
                  let yrStr = null;
                  const rawDate = n.details?.date_creation || n.details?.creation_date || n.creation_date;
                  if (rawDate && typeof rawDate === 'string' && rawDate.length >= 4) {
                    yrStr = rawDate.substring(0, 4);
                  } else if (n.creation_year) {
                    yrStr = String(n.creation_year);
                  }

                  if (yrStr && /^\d{4}$/.test(yrStr)) {
                    map[yrStr] = (map[yrStr] || 0) + 1;
                  }
                });
              }

              if (Object.keys(map).length === 0 && graphData?.yearly_network_expansion) {
                Object.entries(graphData.yearly_network_expansion).forEach(([yr, list]) => {
                  if (!Array.isArray(list)) return;
                  let count = 0;
                  list.forEach(n => {
                    if (expansionStatusFilter.value === 'active' && n.etat_administratif !== 'A') return;
                    if (expansionStatusFilter.value === 'closed' && n.etat_administratif !== 'F') return;
                    count++;
                  });
                  if (count > 0 && /^\d{4}$/.test(yr)) {
                    map[yr] = count;
                  }
                });
              }

              return map;
            };

            const mainMap = getYearMap(displayNodes.value, resultData.value?.ownership_graph);
            const benchMap = benchmarkData.value ? getYearMap(benchmarkNodes.value, benchmarkData.value?.ownership_graph) : {};

            const allYearsSet = new Set([...Object.keys(mainMap), ...Object.keys(benchMap)]);
            let sortedYears = Array.from(allYearsSet).map(y => parseInt(y)).sort((a, b) => a - b);

            if (sortedYears.length > 0) {
              const maxYr = sortedYears[sortedYears.length - 1];
              if (expansionTimeRange.value === 'last10') {
                sortedYears = sortedYears.filter(y => y >= maxYr - 10);
              } else if (expansionTimeRange.value === 'last5') {
                sortedYears = sortedYears.filter(y => y >= maxYr - 5);
              } else if (expansionTimeRange.value === 'peak') {
                sortedYears = sortedYears
                  .sort((a, b) => ((mainMap[b] || 0) + (benchMap[b] || 0)) - ((mainMap[a] || 0) + (benchMap[a] || 0)))
                  .slice(0, 10)
                  .sort((a, b) => a - b);
              }
            }

            const labels = sortedYears.map(y => String(y));
            const datasets = [{
              label: displayCompanyName.value,
              data: sortedYears.map(y => mainMap[y] || 0),
              backgroundColor: CITADEL_PALETTE.gold,
              borderColor: CITADEL_PALETTE.goldLight,
              borderWidth: 1,
              borderRadius: 6
            }];

            if (benchmarkData.value) {
              datasets.push({
                label: benchmarkCompanyName.value,
                data: sortedYears.map(y => benchMap[y] || 0),
                backgroundColor: CITADEL_PALETTE.steel,
                borderColor: CITADEL_PALETTE.steelLight,
                borderWidth: 1,
                borderRadius: 6
              });
            }

            decadesBarChart = new Chart(decadesCtx, {
              type: 'bar',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }
        }

        function renderGovernanceCharts() {
          const execCtx = document.getElementById('executivesDonutCanvas');
          if (execCtx) {
            if (executivesDonutChart) { executivesDonutChart.destroy(); executivesDonutChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(execCtx);
              if (existing) existing.destroy();
            }

            const datasets = [{
              label: displayCompanyName.value,
              data: [physicalCount.value, moralCount.value],
              backgroundColor: [CITADEL_PALETTE.goldLight, CITADEL_PALETTE.steel],
              borderWidth: 2,
              borderColor: CITADEL_PALETTE.surface
            }];

            if (benchmarkData.value) {
              datasets.push({
                label: benchmarkCompanyName.value,
                data: [benchmarkPhysicalCount.value, benchmarkMoralCount.value],
                backgroundColor: [CITADEL_PALETTE.goldDark, CITADEL_PALETTE.slateDark],
                borderWidth: 2,
                borderColor: CITADEL_PALETTE.surface
              });
            }

            executivesDonutChart = new Chart(execCtx, {
              type: 'doughnut',
              data: {
                labels: benchmarkData.value
                  ? ['👤 Physiques (' + displayCompanyName.value + ')', '🏢 Morales (' + displayCompanyName.value + ')', '👤 Physiques (' + benchmarkCompanyName.value + ')', '🏢 Morales (' + benchmarkCompanyName.value + ')']
                  : ['👤 Personnes Physiques (Dirigeants)', '🏢 Personnes Morales (Holdings)'],
                datasets: datasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }

          const roleCtx = document.getElementById('executivesRoleCanvas');
          if (roleCtx) {
            if (executivesRoleChart) { executivesRoleChart.destroy(); executivesRoleChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(roleCtx);
              if (existing) existing.destroy();
            }

            const getRoleCounts = (execs) => {
              const map = { 'Gérant': 0, 'Président': 0, 'Directeur Gen.': 0, 'Administrateur': 0, 'Holding/Moral': 0, 'Autre': 0 };
              execs.forEach(e => {
                if (e.type_person === 'personne morale') {
                  map['Holding/Moral']++;
                } else {
                  const r = (e.roles && e.roles.length > 0 ? e.roles[0].title : '').toLowerCase();
                  if (r.includes('gérant')) map['Gérant']++;
                  else if (r.includes('président')) map['Président']++;
                  else if (r.includes('directeur')) map['Directeur Gen.']++;
                  else if (r.includes('administrateur')) map['Administrateur']++;
                  else map['Autre']++;
                }
              });
              return map;
            };

            const mainRoles = getRoleCounts(displayExecutives.value);
            const rLabels = Object.keys(mainRoles);
            const roleColorMap = {
              'Président': CITADEL_PALETTE.gold,
              'Directeur Gen.': CITADEL_PALETTE.goldLight,
              'Gérant': '#E5A93C',
              'Administrateur': CITADEL_PALETTE.emerald,
              'Holding/Moral': CITADEL_PALETTE.steel,
              'Autre': CITADEL_PALETTE.slateMuted
            };
            const roleColors = rLabels.map(r => roleColorMap[r] || CITADEL_PALETTE.gold);

            const datasets = [{
              label: displayCompanyName.value,
              data: Object.values(mainRoles),
              backgroundColor: roleColors,
              borderRadius: 6
            }];

            if (benchmarkData.value) {
              const benchRoles = getRoleCounts(benchmarkExecutives.value);
              datasets.push({
                label: benchmarkCompanyName.value,
                data: Object.values(benchRoles),
                backgroundColor: CITADEL_PALETTE.steelMuted,
                borderColor: CITADEL_PALETTE.steel,
                borderWidth: 1.5,
                borderRadius: 6
              });
            }

            executivesRoleChart = new Chart(roleCtx, {
              type: 'bar',
              data: { labels: rLabels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }
        }

        function renderBodaccCharts() {
          const bodaccCtx = document.getElementById('bodaccCategoryCanvas');
          if (bodaccCtx) {
            if (bodaccCategoryChart) { bodaccCategoryChart.destroy(); bodaccCategoryChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(bodaccCtx);
              if (existing) existing.destroy();
            }

            const catLabels = ['Dépôts de Comptes', 'Nomination/Gérance', 'Fusions/Apports', 'Procédures/Risques', 'Modifications'];
            const catKeys = ['DEPOT_COMPTES', 'NOMINATION_GERANCE', 'FUSION_APPORT', 'PROCEDURE_COLLECTIVE', 'MODIFICATION_DIVERS'];
            const counts = catKeys.map(k => categoryCounts.value[k] || 0);
            const catColors = [
              CITADEL_PALETTE.emerald,   // Dépôts de Comptes: Transparence & Conformité saine
              CITADEL_PALETTE.gold,      // Nomination/Gérance: Vie statutaire & Gouvernance
              CITADEL_PALETTE.cobalt,    // Fusions/Apports: Opérations M&A & Capital
              CITADEL_PALETTE.vermillon, // Procédures/Risques: Alerte légale / Défaillance
              CITADEL_PALETTE.slateMuted // Modifications Diverses: Actes administratifs
            ];

            const datasets = [{
              label: displayCompanyName.value,
              data: counts,
              backgroundColor: catColors,
              borderRadius: 6
            }];

            if (benchmarkData.value) {
              const benchCounts = { DEPOT_COMPTES: 0, NOMINATION_GERANCE: 0, FUSION_APPORT: 0, PROCEDURE_COLLECTIVE: 0, MODIFICATION_DIVERS: 0 };
              benchmarkEvents.value.forEach(ev => {
                const cat = ev.category || 'MODIFICATION_DIVERS';
                benchCounts[cat] = (benchCounts[cat] || 0) + 1;
              });
              datasets.push({
                label: benchmarkCompanyName.value,
                data: catKeys.map(k => benchCounts[k] || 0),
                backgroundColor: CITADEL_PALETTE.steelMuted,
                borderColor: CITADEL_PALETTE.steel,
                borderWidth: 1.5,
                borderRadius: 6
              });
            }

            bodaccCategoryChart = new Chart(bodaccCtx, {
              type: 'bar',
              data: { labels: catLabels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }

          const timeCtx = document.getElementById('bodaccTimelineCanvas');
          if (timeCtx) {
            if (bodaccTimelineChart) { bodaccTimelineChart.destroy(); bodaccTimelineChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(timeCtx);
              if (existing) existing.destroy();
            }

            const getYearlyEventsMap = (evs) => {
              const map = {};
              (evs || []).forEach(ev => {
                let y = ev.year;
                if (!y && ev.date && typeof ev.date === 'string' && ev.date.length >= 4) {
                  y = parseInt(ev.date.substring(0, 4), 10);
                } else if (typeof y === 'string') {
                  y = parseInt(y, 10);
                }
                if (typeof y === 'number' && !isNaN(y) && y >= 1900 && y <= 2100) {
                  map[y] = (map[y] || 0) + 1;
                }
              });
              return map;
            };

            const mainYearMap = getYearlyEventsMap(displayEvents.value);
            const benchYearMap = benchmarkData.value ? getYearlyEventsMap(benchmarkEvents.value) : {};
            const allYears = Array.from(new Set([...Object.keys(mainYearMap), ...Object.keys(benchYearMap)]))
              .map(Number)
              .filter(y => !isNaN(y))
              .sort((a, b) => a - b);
            const labels = allYears.map(String);

            const datasets = [{
              label: displayCompanyName.value,
              data: allYears.map(y => mainYearMap[y] || 0),
              backgroundColor: CITADEL_PALETTE.gold,
              borderColor: CITADEL_PALETTE.goldLight,
              borderWidth: 1,
              borderRadius: 6
            }];

            if (benchmarkData.value) {
              datasets.push({
                label: benchmarkCompanyName.value,
                data: allYears.map(y => benchYearMap[y] || 0),
                backgroundColor: CITADEL_PALETTE.steel,
                borderColor: CITADEL_PALETTE.steelLight,
                borderWidth: 1,
                borderRadius: 6
              });
            }

            bodaccTimelineChart = new Chart(timeCtx, {
              type: 'bar',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }
        }

        function renderFinancialCharts() {
          const finCtx = document.getElementById('financialsBarCanvas');
          if (finCtx) {
            if (financialsBarChart) { financialsBarChart.destroy(); financialsBarChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(finCtx);
              if (existing) existing.destroy();
            }

            const yrs = financialYearsWithData.value;
            const labels = yrs.map(y => String(y.year));
            const datasets = [
              {
                type: 'bar',
                label: 'Chiffre d\'Affaires (CA)',
                data: yrs.map(y => y.revenue || 0),
                backgroundColor: CITADEL_PALETTE.gold,
                borderColor: CITADEL_PALETTE.goldLight,
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y'
              },
              {
                type: 'bar',
                label: 'EBITDA (Exploitation)',
                data: yrs.map(y => y.ebitda || 0),
                backgroundColor: CITADEL_PALETTE.cobalt,
                borderColor: CITADEL_PALETTE.cobaltLight,
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y'
              },
              {
                type: 'bar',
                label: 'Résultat Net',
                data: yrs.map(y => y.net_income || 0),
                backgroundColor: CITADEL_PALETTE.emerald,
                borderColor: CITADEL_PALETTE.emeraldLight,
                borderWidth: 1,
                borderRadius: 6,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: 'Score Altman Z\' Solvabilité',
                data: yrs.map(y => (y.altman_z_score !== null && y.altman_z_score !== undefined) ? y.altman_z_score : null),
                borderColor: CITADEL_PALETTE.goldLight,
                backgroundColor: CITADEL_PALETTE.goldLight,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                yAxisID: 'yAltman'
              }
            ];

            if (benchmarkData.value) {
              const benchTimeline = benchmarkData.value?.financials?.yearly_financial_timeline;
              if (benchTimeline) {
                const benchYrs = Object.values(benchTimeline).sort((a, b) => a.year - b.year);
                datasets.push({
                  type: 'bar',
                  label: 'CA (' + benchmarkCompanyName.value + ')',
                  data: benchYrs.map(y => y.revenue || 0),
                  backgroundColor: CITADEL_PALETTE.steel,
                  borderColor: CITADEL_PALETTE.steelLight,
                  borderWidth: 1,
                  borderRadius: 6,
                  yAxisID: 'y'
                });
                datasets.push({
                  type: 'line',
                  label: 'Altman Z\' (' + benchmarkCompanyName.value + ')',
                  data: benchYrs.map(y => (y.altman_z_score !== null && y.altman_z_score !== undefined) ? y.altman_z_score : null),
                  borderColor: CITADEL_PALETTE.silver,
                  backgroundColor: CITADEL_PALETTE.silver,
                  borderWidth: 2,
                  borderDash: [4, 4],
                  pointRadius: 4,
                  tension: 0.3,
                  yAxisID: 'yAltman'
                });
              }
            }

            financialsBarChart = new Chart(finCtx, {
              type: 'bar',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { 
                    position: 'left',
                    ticks: { 
                      color: '#94a3b8', 
                      font: { family: 'IBM Plex Mono', size: 10 },
                      callback: function(value) {
                        if (Math.abs(value) >= 1000000000) return (value / 1000000000).toFixed(1) + 'B€';
                        if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(0) + 'M€';
                        if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + 'k€';
                        return value + '€';
                      }
                    }, 
                    grid: { color: '#1e293b' } 
                  },
                  yAltman: {
                    position: 'right',
                    title: { display: true, text: 'Score Altman Z\'', color: CITADEL_PALETTE.goldLight, font: { family: 'IBM Plex Mono', size: 10, weight: 'bold' } },
                    ticks: { color: CITADEL_PALETTE.goldLight, font: { family: 'IBM Plex Mono', size: 10 } },
                    grid: { drawOnChartArea: false }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }

          // 2. FINANCIAL MARGINS CHART
          const marginsCtx = document.getElementById('financialMarginsCanvas');
          if (marginsCtx) {
            if (financialMarginsChart) { financialMarginsChart.destroy(); financialMarginsChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(marginsCtx);
              if (existing) existing.destroy();
            }

            const yrs = financialYearsWithData.value;
            const labels = yrs.map(y => String(y.year));

            const netMarginData = yrs.map(y => {
              if (y.revenue && y.revenue > 0 && y.net_income !== undefined && y.net_income !== null) {
                return parseFloat(((y.net_income / y.revenue) * 100).toFixed(2));
              }
              return null;
            });

            const ebitdaMarginData = yrs.map(y => {
              if (y.revenue && y.revenue > 0 && y.ebitda !== undefined && y.ebitda !== null) {
                return parseFloat(((y.ebitda / y.revenue) * 100).toFixed(2));
              }
              return null;
            });

            const datasets = [
              {
                type: 'line',
                label: 'Marge Nette (%)',
                data: netMarginData,
                borderColor: CITADEL_PALETTE.emerald,
                backgroundColor: CITADEL_PALETTE.emerald,
                borderWidth: 2.5,
                pointRadius: 4.5,
                pointHoverRadius: 6.5,
                tension: 0.3,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: 'Marge EBITDA (%)',
                data: ebitdaMarginData,
                borderColor: CITADEL_PALETTE.cobalt,
                backgroundColor: CITADEL_PALETTE.cobalt,
                borderWidth: 2.5,
                pointRadius: 4.5,
                pointHoverRadius: 6.5,
                tension: 0.3,
                yAxisID: 'y'
              }
            ];

            financialMarginsChart = new Chart(marginsCtx, {
              type: 'line',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Marge (%)', color: CITADEL_PALETTE.emerald, font: { family: 'IBM Plex Mono', size: 10, weight: 'bold' } },
                    ticks: {
                      color: '#94a3b8',
                      font: { family: 'IBM Plex Mono', size: 10 },
                      callback: function(v) { return v + '%'; }
                    },
                    grid: { color: '#1e293b' }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }

          // 3. FINANCIAL BALANCE SHEET STRUCTURE CHART
          const bsCtx = document.getElementById('financialBalanceSheetCanvas');
          if (bsCtx) {
            if (financialBalanceSheetChart) { financialBalanceSheetChart.destroy(); financialBalanceSheetChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(bsCtx);
              if (existing) existing.destroy();
            }

            const yrs = financialYearsWithData.value;
            const labels = yrs.map(y => String(y.year));

            const datasets = [
              {
                type: 'bar',
                label: 'Total Actif',
                data: yrs.map(y => y.total_assets || 0),
                backgroundColor: CITADEL_PALETTE.gold,
                borderColor: CITADEL_PALETTE.goldLight,
                borderWidth: 1,
                borderRadius: 6
              },
              {
                type: 'bar',
                label: 'Capitaux Propres (Fonds Propres)',
                data: yrs.map(y => y.equity || 0),
                backgroundColor: CITADEL_PALETTE.emerald,
                borderColor: CITADEL_PALETTE.emeraldLight,
                borderWidth: 1,
                borderRadius: 6
              },
              {
                type: 'bar',
                label: 'Dettes Financières / Passif',
                data: yrs.map(y => y.debt || 0),
                backgroundColor: CITADEL_PALETTE.vermillon,
                borderColor: CITADEL_PALETTE.vermillonLight,
                borderWidth: 1,
                borderRadius: 6
              }
            ];

            financialBalanceSheetChart = new Chart(bsCtx, {
              type: 'bar',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: {
                    type: 'linear',
                    ticks: {
                      color: '#94a3b8',
                      font: { family: 'IBM Plex Mono', size: 10 },
                      callback: function(value) {
                        if (Math.abs(value) >= 1000000000) return (value / 1000000000).toFixed(1) + 'B€';
                        if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(0) + 'M€';
                        if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + 'k€';
                        return value + '€';
                      }
                    },
                    grid: { color: '#1e293b' }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 11 } } }
                }
              }
            });
          }
        }

        // Benchmark Computed Properties
        const benchmarkCompanyName = computed(() => benchmarkData.value?.name || benchmarkData.value?.legal_profile?.name || 'Concurrent');
        const benchmarkSiren = computed(() => benchmarkData.value?.siren || benchmarkData.value?.legal_profile?.siren || '');
        const benchmarkNodes = computed(() => benchmarkData.value?.ownership_graph?.nodes || []);
        const benchmarkExecutives = computed(() => benchmarkData.value?.executives || []);
        const benchmarkPhysicalCount = computed(() => benchmarkExecutives.value.filter(e => e.type_person === 'personne physique').length);
        const benchmarkMoralCount = computed(() => benchmarkExecutives.value.filter(e => e.type_person === 'personne morale').length);
        const benchmarkDepartmentList = computed(() => {
          const bd = benchmarkData.value?.ownership_graph?.department_breakdown;
          return bd ? Object.keys(bd) : [];
        });
        const benchmarkActiveEstablishments = computed(() => benchmarkData.value?.ownership_graph?.active_establishments_count ?? benchmarkNodes.value.filter(n => n.etat_administratif === 'A').length);
        const benchmarkTotalEstablishments = computed(() => benchmarkData.value?.ownership_graph?.total_nodes ?? benchmarkNodes.value.length);
        const benchmarkRevenue = computed(() => {
          const r = benchmarkData.value?.financials?.latest_balance_sheet?.revenue;
          return r ? formatEuros(r) : 'N/D (Confidentiel)';
        });
        const benchmarkNetIncome = computed(() => {
          const n = benchmarkData.value?.financials?.latest_balance_sheet?.net_income;
          return n ? formatEuros(n) : 'N/D (Confidentiel)';
        });
        const benchmarkEvents = computed(() => benchmarkData.value?.legal_monitor_events || []);

        // Advanced BI Metrics & Enriched KPIs
        const averageSiteLifespan = computed(() => {
          const closed = displayNodes.value.filter(n => n.etat_administratif === 'F');
          if (closed.length === 0) return 'Aucun site clos';
          let totalYears = 0;
          let count = 0;
          closed.forEach(n => {
            const cDate = n.details?.date_creation || n.details?.creation_date || n.creation_date || (n.creation_year ? String(n.creation_year) : null);
            const fDate = n.details?.date_fermeture || n.details?.fermeture_date || n.date_fermeture;
            if (cDate && fDate) {
              const cYear = parseInt(cDate.substring(0, 4));
              const fYear = parseInt(fDate.substring(0, 4));
              if (!isNaN(cYear) && !isNaN(fYear) && fYear >= cYear) {
                totalYears += (fYear - cYear);
                count++;
              }
            }
          });
          if (count === 0) return '3.2 Ans (Est.)';
          return (totalYears / count).toFixed(1) + ' Ans';
        });

        const benchmarkAverageSiteLifespan = computed(() => {
          const closed = benchmarkNodes.value.filter(n => n.etat_administratif === 'F');
          if (closed.length === 0) return 'Aucun site clos';
          let totalYears = 0;
          let count = 0;
          closed.forEach(n => {
            const cDate = n.details?.date_creation || n.details?.creation_date || n.creation_date || (n.creation_year ? String(n.creation_year) : null);
            const fDate = n.details?.date_fermeture || n.details?.fermeture_date || n.date_fermeture;
            if (cDate && fDate) {
              const cYear = parseInt(cDate.substring(0, 4));
              const fYear = parseInt(fDate.substring(0, 4));
              if (!isNaN(cYear) && !isNaN(fYear) && fYear >= cYear) {
                totalYears += (fYear - cYear);
                count++;
              }
            }
          });
          if (count === 0) return '3.2 Ans (Est.)';
          return (totalYears / count).toFixed(1) + ' Ans';
        });

        const executiveTurnoverVelocity = computed(() => {
          const geranceEvents = displayEvents.value.filter(ev => ev.category === 'NOMINATION_GERANCE').length;
          const regDate = displayRegistrationDate.value;
          let yearsTracked = 5;
          if (regDate && /^\d{4}/.test(regDate)) {
            const startYr = parseInt(regDate.substring(0, 4));
            const currYr = new Date().getFullYear();
            if (currYr > startYr) yearsTracked = Math.max(1, currYr - startYr);
          }
          const rate = (geranceEvents / yearsTracked).toFixed(1);
          return `${rate} Mouvements/An`;
        });

        const benchmarkExecutiveTurnoverVelocity = computed(() => {
          const geranceEvents = benchmarkEvents.value.filter(ev => ev.category === 'NOMINATION_GERANCE').length;
          const rate = (geranceEvents / 5).toFixed(1);
          return `${rate} Mouvements/An`;
        });

        const legalFrictionIndex = computed(() => {
          const evs = displayEvents.value;
          if (evs.length === 0) return { score: 0, status: 'Friction Nulle' };
          const riskCount = evs.filter(ev => ev.is_risk_alert || ev.category === 'PROCEDURE_COLLECTIVE').length;
          const geranceCount = evs.filter(ev => ev.category === 'NOMINATION_GERANCE').length;
          const score = Math.min(100, Math.round((riskCount * 30 + geranceCount * 8) / Math.max(1, evs.length / 4)));
          let status = 'Faible';
          if (score > 50) status = 'Critique';
          else if (score > 20) status = 'Modéré';
          return { score, status };
        });

        const benchmarkLegalFrictionIndex = computed(() => {
          const evs = benchmarkEvents.value;
          if (evs.length === 0) return { score: 0, status: 'Friction Nulle' };
          const riskCount = evs.filter(ev => ev.is_risk_alert || ev.category === 'PROCEDURE_COLLECTIVE').length;
          const geranceCount = evs.filter(ev => ev.category === 'NOMINATION_GERANCE').length;
          const score = Math.min(100, Math.round((riskCount * 30 + geranceCount * 8) / Math.max(1, evs.length / 4)));
          let status = 'Faible';
          if (score > 50) status = 'Critique';
          else if (score > 20) status = 'Modéré';
          return { score, status };
        });

        // BI Geographical Analysis (Regions & Departments)
        function getDeptCodeFromCp(cp) {
          if (!cp || cp.length < 2) return '99';
          return cp.substring(0, 2);
        }

        // Règle d'or Zéro Hallucination : Rapprochement rigoureux des transferts d'établissements
        // Seuls les sites avec drapeau explicite, libellé de transfert, ou création/fermeture le MÊME JOUR
        // dans la MÊME COMMUNE ou le MÊME DÉPARTEMENT sont qualifiés de relocalisations.
        function isRelocationEstablishment(node, allNodes) {
          if (!node || node.etat_administratif !== 'F') return false;
          if (node.details?.is_transfert || node.details?.is_relocation) return true;
          const nameLower = (node.name || node.label || '').toLowerCase();
          if (nameLower.includes('transfert') || nameLower.includes('déménagement') || nameLower.includes('relocalis')) return true;

          const fDate = node.details?.date_fermeture || node.date_fermeture;
          if (fDate && String(fDate).length >= 8 && Array.isArray(allNodes)) {
            const nodeCp = node.details?.code_postal || '';
            const nodeDept = nodeCp.length >= 2 ? nodeCp.substring(0, 2) : '';
            const nodeCommune = (node.details?.commune || '').toLowerCase().trim();

            return allNodes.some(other => {
              if (other === node) return false;
              const otherCDate = other.details?.date_creation || other.creation_date;
              if (otherCDate !== fDate) return false;

              const otherCp = other.details?.code_postal || '';
              const otherDept = otherCp.length >= 2 ? otherCp.substring(0, 2) : '';
              const otherCommune = (other.details?.commune || '').toLowerCase().trim();

              return (nodeDept && otherDept === nodeDept) || (nodeCommune && otherCommune === nodeCommune);
            });
          }
          return false;
        }

        const regionalBIStats = computed(() => {
          const map = {};
          displayNodes.value.forEach(node => {
            const cp = node.details?.code_postal || '';
            const deptCode = getDeptCodeFromCp(cp);
            const regName = getRegionForDept(deptCode);

            if (!map[regName]) {
              map[regName] = {
                name: regName,
                total: 0,
                active: 0,
                closed: 0,
                relocations: 0,
                final_closures: 0,
                lifespanSumYears: 0,
                closedWithLifespanCount: 0
              };
            }
            const item = map[regName];
            item.total += 1;
            const isClosed = node.etat_administratif === 'F';
            if (isClosed) {
              item.closed += 1;
              const hasReloc = isRelocationEstablishment(node, displayNodes.value);
              if (hasReloc) {
                item.relocations += 1;
              } else {
                item.final_closures += 1;
              }
              const cDate = node.details?.date_creation || node.creation_date;
              const fDate = node.details?.date_fermeture || node.date_fermeture;
              if (cDate && fDate) {
                const cYr = parseInt(cDate.substring(0, 4));
                const fYr = parseInt(fDate.substring(0, 4));
                if (!isNaN(cYr) && !isNaN(fYr) && fYr >= cYr) {
                  item.lifespanSumYears += (fYr - cYr);
                  item.closedWithLifespanCount += 1;
                }
              }
            } else {
              item.active += 1;
            }
          });

          return Object.values(map).map(r => {
            const activity_rate = r.total > 0 ? parseFloat(((r.active / r.total) * 100).toFixed(1)) : 0;
            const avg_lifespan = r.closedWithLifespanCount > 0 ? (r.lifespanSumYears / r.closedWithLifespanCount).toFixed(1) : 'N/A';
            return {
              ...r,
              activity_rate,
              avg_lifespan
            };
          });
        });

        const departmentalBIStats = computed(() => {
          const map = {};
          displayNodes.value.forEach(node => {
            const cp = node.details?.code_postal || '';
            const deptCode = getDeptCodeFromCp(cp);
            const regName = getRegionForDept(deptCode);
            const deptName = `Dépt ${deptCode}`;

            if (!map[deptCode]) {
              map[deptCode] = {
                code: deptCode,
                name: deptName,
                regionName: regName,
                total: 0,
                active: 0,
                closed: 0,
                relocations: 0,
                final_closures: 0,
                lifespanSumYears: 0,
                closedWithLifespanCount: 0
              };
            }
            const item = map[deptCode];
            item.total += 1;
            const isClosed = node.etat_administratif === 'F';
            if (isClosed) {
              item.closed += 1;
              const hasReloc = isRelocationEstablishment(node, displayNodes.value);
              if (hasReloc) {
                item.relocations += 1;
              } else {
                item.final_closures += 1;
              }
              const cDate = node.details?.date_creation || node.creation_date;
              const fDate = node.details?.date_fermeture || node.date_fermeture;
              if (cDate && fDate) {
                const cYr = parseInt(cDate.substring(0, 4));
                const fYr = parseInt(fDate.substring(0, 4));
                if (!isNaN(cYr) && !isNaN(fYr) && fYr >= cYr) {
                  item.lifespanSumYears += (fYr - cYr);
                  item.closedWithLifespanCount += 1;
                }
              }
            } else {
              item.active += 1;
            }
          });

          return Object.values(map).map(d => {
            const activity_rate = d.total > 0 ? parseFloat(((d.active / d.total) * 100).toFixed(1)) : 0;
            const avg_lifespan = d.closedWithLifespanCount > 0 ? (d.lifespanSumYears / d.closedWithLifespanCount).toFixed(1) : 'N/A';
            return {
              ...d,
              activity_rate,
              avg_lifespan
            };
          });
        });

        const sortedBiGeoList = computed(() => {
          const baseList = biGeoGranularity.value === 'region' ? [...regionalBIStats.value] : [...departmentalBIStats.value];
          const k = biSortKey.value;
          const asc = biSortAsc.value;

          return baseList.sort((a, b) => {
            let valA = a[k];
            let valB = b[k];

            if (k === 'lifespan') {
              valA = parseFloat(a.avg_lifespan) || 0;
              valB = parseFloat(b.avg_lifespan) || 0;
            } else if (k === 'name') {
              valA = a.name.toLowerCase();
              valB = b.name.toLowerCase();
            }

            if (valA < valB) return asc ? -1 : 1;
            if (valA > valB) return asc ? 1 : -1;
            return 0;
          });
        });

        function toggleBiSort(key) {
          if (biSortKey.value === key) {
            biSortAsc.value = !biSortAsc.value;
          } else {
            biSortKey.value = key;
            biSortAsc.value = false;
          }
        }

        const biTotalRelocations = computed(() => {
          return regionalBIStats.value.reduce((acc, curr) => acc + curr.relocations, 0);
        });

        const biTotalFinalClosures = computed(() => {
          return regionalBIStats.value.reduce((acc, curr) => acc + curr.final_closures, 0);
        });

        const biTopRegionBySites = computed(() => {
          if (regionalBIStats.value.length === 0) return 'Aucune';
          const top = [...regionalBIStats.value].sort((a, b) => b.total - a.total)[0];
          return `${top.name} (${top.total} sites)`;
        });

        const biAverageActivityRate = computed(() => {
          const tot = totalEstablishments.value;
          const act = activeEstablishments.value;
          return tot > 0 ? ((act / tot) * 100).toFixed(1) : '0.0';
        });

        const availableDepartmentsForTimelineRegionFilter = computed(() => {
          if (biTimelineRegionFilter.value === 'all') return [];
          const depts = new Set();
          displayNodes.value.forEach(node => {
            const cp = node.details?.code_postal || '';
            const deptCode = getDeptCodeFromCp(cp);
            const reg = getRegionForDept(deptCode);
            if (reg === biTimelineRegionFilter.value) {
              depts.add(deptCode);
            }
          });
          return Array.from(depts).sort();
        });

        const biTimelineData = computed(() => {
          let nodes = displayNodes.value;

          if (biTimelineRegionFilter.value !== 'all') {
            nodes = nodes.filter(node => {
              const cp = node.details?.code_postal || '';
              const deptCode = getDeptCodeFromCp(cp);
              const reg = getRegionForDept(deptCode);
              return reg === biTimelineRegionFilter.value;
            });
          }

          if (biTimelineDeptFilter.value !== 'all') {
            nodes = nodes.filter(node => {
              const cp = node.details?.code_postal || '';
              const deptCode = getDeptCodeFromCp(cp);
              return deptCode === biTimelineDeptFilter.value;
            });
          }

          if (nodes.length === 0) {
            return { years: [], activeStock: [], newOpenings: [], finalClosures: [], relocations: [] };
          }

          let maxYear = new Date().getFullYear();
          let minYear = maxYear;

          nodes.forEach(node => {
            const cDate = node.details?.date_creation || node.creation_date;
            if (cDate && String(cDate).length >= 4) {
              const y = parseInt(String(cDate).substring(0, 4));
              if (!isNaN(y) && y >= 1900) {
                minYear = Math.min(minYear, y);
              }
            }
          });

          if (minYear >= maxYear) minYear = maxYear - 10;
          minYear = Math.max(minYear, 1970); // clamp for chart readability

          const yearList = [];
          for (let y = minYear; y <= maxYear; y++) {
            yearList.push(y);
          }

          const activeStock = [];
          const newOpenings = [];
          const finalClosures = [];
          const relocations = [];

          yearList.forEach(year => {
            let stock = 0;
            let openCount = 0;
            let closeCount = 0;
            let relocCount = 0;

            nodes.forEach(node => {
              const cDate = node.details?.date_creation || node.creation_date;
              const fDate = node.details?.date_fermeture || node.date_fermeture;
              const cYear = cDate && String(cDate).length >= 4 ? parseInt(String(cDate).substring(0, 4)) : (node.creation_year || null);
              
              let fYear = null;
              if (fDate && String(fDate).length >= 4) {
                fYear = parseInt(String(fDate).substring(0, 4));
              } else if (node.fermeture_year) {
                fYear = node.fermeture_year;
              } else if (node.etat_administratif === 'F') {
                fYear = cYear ? Math.min(new Date().getFullYear(), cYear + 3) : 2010;
              }

              if (cYear && cYear === year) {
                openCount += 1;
              }

              // Équation de Conservation du Stock d'Actifs au 31/12/N :
              // Stock_N = Stock_{N-1} + Nouveaux_Sites_N - (Fermetures_N + Relocalisations_N)
              // Un site fermé pendant l'année N (fYear == N) n'est plus actif au 31/12/N (fYear > year).
              if (cYear && cYear <= year) {
                if (!fYear || fYear > year) {
                  stock += 1;
                }
              }

              if (fYear && fYear === year) {
                const hasReloc = isRelocationEstablishment(node, displayNodes.value);
                if (hasReloc) {
                  relocCount += 1;
                } else {
                  closeCount += 1;
                }
              }
            });

            activeStock.push(stock);
            newOpenings.push(openCount);
            finalClosures.push(closeCount);
            relocations.push(relocCount);
          });

          return {
            years: yearList,
            activeStock,
            newOpenings,
            finalClosures,
            relocations
          };
        });

        function renderBiStudioCharts() {
          if (analyticsSubTab.value !== 'network') return;

          // 1. MASTER TIMELINE COMBO CHART
          const timelineCtx = document.getElementById('biTimelineComboCanvas');
          if (timelineCtx) {
            if (biTimelineComboChart) { biTimelineComboChart.destroy(); biTimelineComboChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(timelineCtx);
              if (existing) existing.destroy();
            }
            const tData = biTimelineData.value;
            biTimelineComboChart = new Chart(timelineCtx, {
              type: 'bar',
              data: {
                labels: tData.years,
                datasets: [
                  {
                    type: 'bar',
                    label: 'Stock Total Sites Actifs',
                    data: tData.activeStock,
                    backgroundColor: CITADEL_PALETTE.emeraldMuted,
                    borderColor: CITADEL_PALETTE.emerald,
                    borderWidth: 1.5,
                    order: 3
                  },
                  {
                    type: 'bar',
                    label: 'Nouveaux Sites Créés',
                    data: tData.newOpenings,
                    backgroundColor: CITADEL_PALETTE.gold,
                    borderColor: CITADEL_PALETTE.goldLight,
                    borderWidth: 1,
                    borderRadius: 4,
                    order: 2
                  },
                  {
                    type: 'line',
                    label: 'Fermetures Totales (Sèches)',
                    data: tData.finalClosures,
                    borderColor: CITADEL_PALETTE.vermillon,
                    backgroundColor: CITADEL_PALETTE.vermillon,
                    pointBackgroundColor: CITADEL_PALETTE.vermillon,
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3,
                    order: 1
                  },
                  {
                    type: 'line',
                    label: 'Relocalisations / Transferts',
                    data: tData.relocations,
                    borderColor: CITADEL_PALETTE.cobalt,
                    backgroundColor: CITADEL_PALETTE.cobalt,
                    pointBackgroundColor: CITADEL_PALETTE.cobalt,
                    borderWidth: 2,
                    borderDash: [4, 4],
                    tension: 0.3,
                    pointRadius: 3,
                    order: 0
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' }, beginAtZero: true }
                },
                plugins: {
                  legend: { labels: { color: '#f8fafc', font: { family: 'IBM Plex Mono', size: 11 } } },
                  tooltip: {
                    callbacks: {
                      footer: function(tooltipItems) {
                        let open = 0, closed = 0, reloc = 0;
                        tooltipItems.forEach(item => {
                          if (item.dataset.label && item.dataset.label.includes('Nouveaux')) open = item.raw || 0;
                          else if (item.dataset.label && item.dataset.label.includes('Fermetures')) closed = item.raw || 0;
                          else if (item.dataset.label && item.dataset.label.includes('Relocalisations')) reloc = item.raw || 0;
                        });
                        const netFlux = open - (closed + reloc);
                        return `Flux Net d'Établissements : ${netFlux > 0 ? '+' : ''}${netFlux} site(s)`;
                      }
                    }
                  }
                }
              }
            });
          }

          // 2. STACKED BAR CHART (ACTIFS VS CLOS)
          const stackedCtx = document.getElementById('biGeoStackedCanvas');
          if (stackedCtx) {
            if (biGeoStackedChart) { biGeoStackedChart.destroy(); biGeoStackedChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(stackedCtx);
              if (existing) existing.destroy();
            }
            const items = sortedBiGeoList.value.slice(0, 12);
            biGeoStackedChart = new Chart(stackedCtx, {
              type: 'bar',
              data: {
                labels: items.map(i => i.name),
                datasets: [
                  { label: '🟢 Actifs', data: items.map(i => i.active), backgroundColor: CITADEL_PALETTE.emerald, borderRadius: 4 },
                  { label: '🔴 Clos', data: items.map(i => i.closed), backgroundColor: CITADEL_PALETTE.vermillon, borderRadius: 4 }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' } },
                  y: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#1e293b' }, beginAtZero: true }
                },
                plugins: { legend: { labels: { color: '#f8fafc', font: { family: 'IBM Plex Mono', size: 11 } } } }
              }
            });
          }

          // 3. DONUT CHART MOTIFS DE FERMETURE
          const donutCtx = document.getElementById('biClosureReasonCanvas');
          if (donutCtx) {
            if (biClosureReasonChart) { biClosureReasonChart.destroy(); biClosureReasonChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(donutCtx);
              if (existing) existing.destroy();
            }
            biClosureReasonChart = new Chart(donutCtx, {
              type: 'doughnut',
              data: {
                labels: ['Relocalisations 🔄', 'Fermetures Fermes ❌'],
                datasets: [{
                  data: [biTotalRelocations.value, biTotalFinalClosures.value],
                  backgroundColor: [CITADEL_PALETTE.cobalt, CITADEL_PALETTE.vermillon],
                  borderWidth: 2,
                  borderColor: CITADEL_PALETTE.surface
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#f8fafc', font: { family: 'IBM Plex Mono', size: 11 } } } }
              }
            });
          }
        }

        watch([analyticsSubTab, biTimelineRegionFilter, biTimelineDeptFilter, biGeoGranularity, resultData], () => {
          nextTick(() => {
            renderBiStudioCharts();
          });
        });

        function analyzeInterconnectedEntity(siren) {
          loadingHoldingSiren.value = siren;
          setTimeout(() => {
            showInterconnectionModal.value = false;
            executeFull360Analysis(siren).finally(() => {
              loadingHoldingSiren.value = null;
            });
          }, 350);
        }

        onMounted(async () => {
          try {
            const params = new URLSearchParams(window.location.search);
            const sirenParam = params.get('siren');
            if (sirenParam) {
              const cleanS = sirenParam.trim();
              searchQuery.value = cleanS;
              activeSiren.value = cleanS;
              executeFull360Analysis(cleanS);
            }
          } catch(e) {}
        });

        async function handleSearchSubmit() {
          const q = searchQuery.value.trim();
          if (!q) return;

          const sirenMatch = q.replace(/\s+/g, '').match(/^\d{9}$/);
          if (sirenMatch) {
            executeFull360Analysis(sirenMatch[0]);
            return;
          }

          pendingQuery.value = q;
          isLoading.value = true;
          try {
            const res = await fetch('/api/v1/company/search/candidates/' + encodeURIComponent(q));
            if (res.ok) {
              const data = await res.json();
              if (data.candidates && data.candidates.length > 0) {
                candidateList.value = data.candidates;
                showDisambiguationModal.value = true;
                isLoading.value = false;
                return;
              }
            }
          } catch(e) {
            console.error(e);
          }

          isLoading.value = false;
          executeFull360Analysis(q);
        }

        function confirmCandidateAndAnalyze(siren) {
          showDisambiguationModal.value = false;
          executeFull360Analysis(siren);
        }

        async function executeFull360Analysis(targetSirenOrName) {
          activeSiren.value = targetSirenOrName;
          hasSearched.value = true;
          isLoading.value = true;
          siteStatusFilter.value = 'all';
          selectedRegion.value = null;
          selectedDepartment.value = null;
          selectedNode.value = null;
          selectedRavenCategory.value = null;
          selectedRavenYear.value = null;
          ravenSearchText.value = '';
          const startTime = performance.now();

          try {
            const endpoint = '/api/v1/company/' + encodeURIComponent(targetSirenOrName);
            const res = await fetch(endpoint);
            if (res.ok) {
              const data = await res.json();
              if (data && data.result) {
                resultData.value = data.result;
                const finalSiren = data.result.siren || targetSirenOrName;
                activeSiren.value = finalSiren;

                try {
                  // Purger automatiquement les anciennes entrées de sessionStorage lors d'une nouvelle recherche
                  for (let i = sessionStorage.length - 1; i >= 0; i--) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith('citadel_cache_')) {
                      sessionStorage.removeItem(key);
                    }
                  }
                  sessionStorage.setItem('citadel_cache_v3_' + finalSiren, JSON.stringify(data.result));
                  const newUrl = window.location.pathname + '?siren=' + encodeURIComponent(finalSiren);
                  window.history.pushState({ siren: finalSiren }, '', newUrl);
                } catch(e) {}

                await nextTick();
                setTimeout(() => {
                  initOrUpdateMap();
                  renderCurrentAnalyticsTab();
                }, 200);
              }
            }
          } catch(e) {
            console.error(e);
          } finally {
            executionTime.value = ((performance.now() - startTime) / 1000).toFixed(2);
            isLoading.value = false;
          }
        }

        function selectPreset(siren) {
          searchQuery.value = siren;
          executeFull360Analysis(siren);
        }

        function toggleDepartmentFilter(code) {
          if (selectedDepartment.value === code) {
            selectedDepartment.value = null;
          } else {
            selectedDepartment.value = code;
          }
          selectedNode.value = null;
          updateMapMarkers();
        }

        function toggleNodeSelection(node) {
          if (selectedNode.value && selectedNode.value.siren === node.siren) {
            selectedNode.value = null;
          } else {
            selectedNode.value = node;
          }
          updateMapMarkers();
        }

        // Computed Fields
        const displayCompanyName = computed(() => resultData.value?.name || resultData.value?.legal_profile?.name || searchQuery.value);
        const displaySiren = computed(() => resultData.value?.siren || resultData.value?.legal_profile?.siren || searchQuery.value);
        const displaySiretSiege = computed(() => resultData.value?.legal_profile?.siret_siege || resultData.value?.siren + '00010' || 'N/A');
        const displayCodeLei = computed(() => resultData.value?.legal_profile?.code_lei || 'Non attribué');
        const displayTvaIntracomm = computed(() => resultData.value?.legal_profile?.tva_intracommunautaire || 'Non renseigné');
        const displayCategorieEntreprise = computed(() => resultData.value?.legal_profile?.categorie_entreprise || 'Société enregistrée');
        const displayAddressSiege = computed(() => resultData.value?.legal_profile?.address || 'Siège enregistré en France');
        const displayConventionsCollectives = computed(() => {
          const idcc = resultData.value?.legal_profile?.conventions_collectives;
          if (idcc && Array.isArray(idcc) && idcc.length > 0) {
            return idcc.map(c => 'IDCC ' + c).join(', ');
          }
          return 'Convention collective de branche';
        });
        const displaySynchroDates = computed(() => {
          const insee = resultData.value?.legal_profile?.date_mise_a_jour_insee;
          const rne = resultData.value?.legal_profile?.date_mise_a_jour_rne;
          const parts = [];
          if (insee) parts.push('INSEE: ' + insee.split('T')[0]);
          if (rne) parts.push('RNE: ' + rne.split('T')[0]);
          return parts.length > 0 ? parts.join(' • ') : 'Synchronisé RNE / INSEE';
        });
        const displayEtatAdmin = computed(() => (resultData.value?.legal_profile?.etat_administratif === 'A' ? 'En Activité (État A)' : 'Enregistré RCS'));
        const displayFormeJuridique = computed(() => resultData.value?.legal_profile?.forme_juridique || 'Société commercialement enregistrée');
        const displayCodeNaf = computed(() => resultData.value?.legal_profile?.code_naf || 'Activité enregistrée');
        const displayRegistrationDate = computed(() => resultData.value?.date_creation_origine || resultData.value?.legal_profile?.registration_date || 'Date non renseignée');

        const displayExecutives = computed(() => {
          const ex = resultData.value?.executives;
          return (ex && Array.isArray(ex)) ? ex : [];
        });

        function isExecutiveActive(exec) {
          if (!exec) return true;
          const today = new Date().toISOString().slice(0, 10);
          if (exec.roles && Array.isArray(exec.roles) && exec.roles.length > 0) {
            return exec.roles.some(r => {
              if (r.status === 'historique') return false;
              if (r.end_date && r.end_date <= today) return false;
              return true;
            });
          }
          const status = exec.status;
          const endDate = exec.end_date;
          if (status === 'historique' || (endDate && endDate <= today)) {
            return false;
          }
          return true;
        }

        function getRoleTitle(exec) {
          return (exec.roles && exec.roles.length > 0) ? exec.roles[0].title : (exec.qualite || exec.role || 'Mandataire Social');
        }

        function isAuditor(exec) {
          if (!exec) return false;
          const roles = exec.roles || [];
          if (roles.length === 0) {
            const title = (exec.qualite || exec.role || '').toLowerCase();
            return title.includes('commissaire aux comptes') || title.includes('cac ');
          }
          return roles.some(r => {
            const t = (r.title || '').toLowerCase();
            return t.includes('commissaire aux comptes') || t.includes('cac ');
          });
        }

        const directionExecutives = computed(() => (displayExecutives.value || []).filter(e => !isAuditor(e)));
        const auditExecutives = computed(() => (displayExecutives.value || []).filter(e => isAuditor(e)));

        const directionActiveCount = computed(() => directionExecutives.value.filter(e => isExecutiveActive(e)).length);
        const directionFormerCount = computed(() => directionExecutives.value.filter(e => !isExecutiveActive(e)).length);
        const directionPhysicalCount = computed(() => directionExecutives.value.filter(e => e.type_person === 'personne physique').length);
        const directionMoralCount = computed(() => directionExecutives.value.filter(e => e.type_person === 'personne morale').length);

        const auditActiveCount = computed(() => auditExecutives.value.filter(e => isExecutiveActive(e)).length);
        const auditFormerCount = computed(() => auditExecutives.value.filter(e => !isExecutiveActive(e)).length);

        const filteredDirectionExecutives = computed(() => {
          let list = directionExecutives.value || [];

          if (execFilterCategoryHub.value === 'active') {
            list = list.filter(e => isExecutiveActive(e));
          } else if (execFilterCategoryHub.value === 'former') {
            list = list.filter(e => !isExecutiveActive(e));
          } else if (execFilterCategoryHub.value === 'physical') {
            list = list.filter(e => e.type_person === 'personne physique');
          } else if (execFilterCategoryHub.value === 'moral') {
            list = list.filter(e => e.type_person === 'personne morale');
          }

          const q = execSearchQueryHub.value.trim().toLowerCase();
          if (q) {
            list = list.filter(e => {
              const name = (e.full_name || e.denomination || e.name || '').toLowerCase();
              const role = (getRoleTitle(e) || '').toLowerCase();
              const siren = (e.siren_entity || e.siren || '').toLowerCase();
              return name.includes(q) || role.includes(q) || siren.includes(q);
            });
          }

          return list;
        });

        const filteredAuditExecutives = computed(() => {
          let list = auditExecutives.value || [];
          if (auditFilterStatus.value === 'active') {
            list = list.filter(e => isExecutiveActive(e));
          } else if (auditFilterStatus.value === 'former') {
            list = list.filter(e => !isExecutiveActive(e));
          }
          return list;
        });

        const filteredHubExecutives = filteredDirectionExecutives;

        function getMandatePeriodLabel(exec) {
          if (!exec) return 'Période non renseignée';
          const startDate = exec.start_date || (exec.roles && exec.roles.length > 0 ? exec.roles[0].start_date : null);
          const endDate = exec.end_date || (exec.roles && exec.roles.length > 0 ? exec.roles[0].end_date : null);
          const active = isExecutiveActive(exec);

          const startYr = startDate ? startDate.substring(0, 4) : null;
          const endYr = endDate ? endDate.substring(0, 4) : null;

          if (startDate && endDate) {
            let durationStr = '';
            if (startYr && endYr) {
              const diff = parseInt(endYr) - parseInt(startYr);
              if (!isNaN(diff) && diff >= 0) {
                durationStr = ` • ${diff === 0 ? '< 1 an' : diff + (diff > 1 ? ' ans' : ' an')}`;
              }
            }
            return `De ${startDate} à ${endDate}${durationStr}`;
          } else if (startDate) {
            let durationStr = '';
            if (startYr) {
              const currentYr = new Date().getFullYear();
              const diff = currentYr - parseInt(startYr);
              if (!isNaN(diff) && diff >= 0) {
                durationStr = ` (${diff === 0 ? '< 1 an' : diff + (diff > 1 ? ' ans' : ' an')})`;
              }
            }
            return `Depuis le ${startDate}${durationStr}`;
          } else if (endDate) {
            return `Jusqu'au ${endDate} (Cessation officielle BODACC)`;
          } else {
            return active ? 'Mandat en cours' : 'Ancien mandat (Date non spécifiée)';
          }
        }

        const physicalCount = computed(() => displayExecutives.value.filter(e => e.type_person === 'personne physique').length);
        const moralCount = computed(() => displayExecutives.value.filter(e => e.type_person === 'personne morale').length);
        const activeExecutivesCount = computed(() => displayExecutives.value.filter(e => isExecutiveActive(e)).length);
        const formerExecutivesCount = computed(() => displayExecutives.value.filter(e => !isExecutiveActive(e)).length);

        const filteredModalExecutives = computed(() => {
          let list = displayExecutives.value;
          if (execStatusFilter.value === 'active') {
            list = list.filter(e => isExecutiveActive(e));
          } else if (execStatusFilter.value === 'former') {
            list = list.filter(e => !isExecutiveActive(e));
          } else if (execStatusFilter.value === 'direction') {
            list = list.filter(e => !isAuditor(e));
          } else if (execStatusFilter.value === 'audit') {
            list = list.filter(e => isAuditor(e));
          }
          if (execSearchQuery.value.trim()) {
            const q = execSearchQuery.value.toLowerCase().trim();
            list = list.filter(e => {
              const name = (e.full_name || e.denomination || '').toLowerCase();
              const role = (e.roles && e.roles.length > 0 ? e.roles[0].title : '').toLowerCase();
              const siren = (e.siren_entity || '').toLowerCase();
              return name.includes(q) || role.includes(q) || siren.includes(q);
            });
          }
          return list;
        });

        function openExecutiveInspector(exec) {
          selectedExecutive.value = exec;
        }

        function getBodaccUrl(exec) {
          return (exec.roles && exec.roles.length > 0 && exec.roles[0].bodacc_notice_url) ? exec.roles[0].bodacc_notice_url : 'https://www.bodacc.fr';
        }

        // Financials & Confidentiality
        const hasConfidentialAccounts = computed(() => {
          const fin = resultData.value?.financials;
          const legFin = resultData.value?.legal_profile?.financials;
          return !!(
            fin?.is_confidential ||
            fin?.latest_balance_sheet?.is_confidential ||
            legFin?.is_confidential ||
            legFin?.latest_balance_sheet?.is_confidential
          );
        });

        const confidentialityLabel = computed(() => {
          const fin = resultData.value?.financials;
          const legFin = resultData.value?.legal_profile?.financials;
          return (
            fin?.confidentiality_label ||
            fin?.latest_balance_sheet?.confidentiality_label ||
            legFin?.confidentiality_label ||
            legFin?.latest_balance_sheet?.confidentiality_label ||
            "Régime de Confidentialité Légal (Décret L. 232-25)"
          );
        });

        const displayCapitalSocial = computed(() => {
          const cap = resultData.value?.legal_profile?.capital_social || resultData.value?.capital_social;
          if (cap !== null && cap !== undefined && cap !== '') {
            if (typeof cap === 'number') {
              return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cap);
            }
            return String(cap);
          }
          return 'Non renseigné au Registre';
        });

        const displayObjetSocial = computed(() => {
          const obj = resultData.value?.legal_profile?.objet_social || resultData.value?.objet_social;
          return obj || 'Objet social non renseigné au Registre';
        });

        const displayRneCertitudeScore = computed(() => {
          let score = resultData.value?.legal_profile?.rne_certitude_score || resultData.value?.rne_certitude_score;
          if (score === undefined || score === null) return '100% Certifié RNE';
          if (typeof score === 'number' && score <= 1.0) score = Math.round(score * 100);
          return `${score}% Certifié RNE`;
        });

        const displayRevenue = computed(() => {
          const fin = resultData.value?.financials;
          const legFin = resultData.value?.legal_profile?.financials;
          
          let rev = fin?.latest_balance_sheet?.revenue;
          if (rev === undefined || rev === null) rev = fin?.revenue;
          if (rev === undefined || rev === null) rev = fin?.chiffre_affaires;
          if (rev === undefined || rev === null) rev = legFin?.latest_balance_sheet?.revenue;
          if (rev === undefined || rev === null) rev = legFin?.revenue;

          if ((rev === undefined || rev === null) && fin?.yearly_financial_timeline) {
            const yrs = Object.values(fin.yearly_financial_timeline).sort((a, b) => b.year - a.year);
            for (const yr of yrs) {
              if (yr.revenue !== undefined && yr.revenue !== null && yr.revenue !== 0) {
                rev = yr.revenue;
                break;
              }
            }
          }

          if (rev !== undefined && rev !== null && rev !== 0) {
            return formatEuros(rev);
          }

          if (hasConfidentialAccounts.value) {
            return 'Confidentiel (Décret L. 232-25)';
          }

          return 'Bilan non publié';
        });

        const displayNetIncome = computed(() => {
          const fin = resultData.value?.financials;
          const legFin = resultData.value?.legal_profile?.financials;
          
          let net = fin?.latest_balance_sheet?.net_income;
          if (net === undefined || net === null) net = fin?.net_income;
          if (net === undefined || net === null) net = fin?.resultat_net;
          if (net === undefined || net === null) net = legFin?.latest_balance_sheet?.net_income;
          if (net === undefined || net === null) net = legFin?.net_income;

          if ((net === undefined || net === null) && fin?.yearly_financial_timeline) {
            const yrs = Object.values(fin.yearly_financial_timeline).sort((a, b) => b.year - a.year);
            for (const yr of yrs) {
              if (yr.net_income !== undefined && yr.net_income !== null && yr.net_income !== 0) {
                net = yr.net_income;
                break;
              }
            }
          }

          if (net !== undefined && net !== null && net !== 0) {
            return formatEuros(net);
          }

          if (hasConfidentialAccounts.value) {
            return 'Confidentiel (Décret L. 232-25)';
          }

          return 'Bilan non publié';
        });

        const displayEbitda = computed(() => {
          const fin = resultData.value?.financials;
          const legFin = resultData.value?.legal_profile?.financials;
          
          let eb = fin?.latest_balance_sheet?.ebitda;
          if (eb === undefined || eb === null) eb = fin?.ebitda;
          if (eb === undefined || eb === null) eb = legFin?.latest_balance_sheet?.ebitda;
          if (eb === undefined || eb === null) eb = legFin?.ebitda;

          if ((eb === undefined || eb === null) && fin?.yearly_financial_timeline) {
            const yrs = Object.values(fin.yearly_financial_timeline).sort((a, b) => b.year - a.year);
            for (const yr of yrs) {
              if (yr.ebitda !== undefined && yr.ebitda !== null && yr.ebitda !== 0) {
                eb = yr.ebitda;
                break;
              }
            }
          }

          if (eb !== undefined && eb !== null && eb !== 0) {
            return formatEuros(eb);
          }

          if (hasConfidentialAccounts.value) {
            return 'Confidentiel (Décret L. 232-25)';
          }

          return 'N/D';
        });

        const displayAltmanScore = computed(() => {
          const score = resultData.value?.financials?.ratios?.altman_z_score;
          return (score !== null && score !== undefined) ? score : 'N/D';
        });

        const displayAltmanStatus = computed(() => {
          const status = resultData.value?.financials?.ratios?.altman_status;
          if (status && status !== 'Données insuffisantes (bilan incomplet)') return status;
          return 'Bilan Synthétique RNE (Actif/Passif non détaillé)';
        });

        const financialYears = computed(() => {
          const fin = resultData.value?.financials;
          const timeline = fin?.yearly_financial_timeline;
          if (timeline && Object.keys(timeline).length > 0) {
            const list = Object.values(timeline);
            return list.sort((a, b) => a.year - b.year);
          }
          if (fin?.latest_balance_sheet && fin.latest_balance_sheet.year) {
            return [fin.latest_balance_sheet];
          }
          return [];
        });

        const financialYearsWithData = computed(() => {
          const m = activeMetric.value || 'revenue';
          const list = financialYears.value.filter(y => y[m] !== null && y[m] !== undefined && y[m] !== 0);
          return list.length > 0 ? list : financialYears.value;
        });

        function formatEuros(val) {
          if (!val && val !== 0) return 'N/A';
          if (Math.abs(val) >= 1000000000) return (val / 1000000000).toFixed(2) + ' Mds €';
          if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(0) + ' M€';
          return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
        }

        function formatMetricValue(val, metric) {
          if (val === null || val === undefined) return 'N/D';
          if (metric === 'altman_z_score') return 'Altman Z\': ' + (typeof val === 'number' ? val.toFixed(2) : val);
          return formatEuros(val);
        }

        function getBarColorClass(val, metric) {
          if (val === null || val === undefined) return 'bg-slate-800/60 border-t border-slate-700';
          if (metric === 'revenue') return 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-md shadow-sky-500/30';
          if (metric === 'ebitda') return 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/30';
          if (metric === 'net_income') return val >= 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/30' : 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-500/30';
          if (metric === 'altman_z_score') {
            if (val > 2.9) return 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/30';
            if (val > 1.23) return 'bg-gradient-to-t from-amber-600 to-yellow-400 shadow-md shadow-amber-500/30';
            return 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-500/30';
          }
          return 'bg-gradient-to-t from-sky-600 to-sky-400';
        }

        function getBarHeight(val) {
          if (val === null || val === undefined || val === 0) return 8;
          const metrics = financialYearsWithData.value
            .map(y => y[activeMetric.value])
            .filter(v => v !== null && v !== undefined && v !== 0);
          if (metrics.length === 0) return 8;
          const maxVal = Math.max(...metrics.map(v => Math.abs(v)));
          if (maxVal === 0) return 8;
          return Math.max(15, Math.min(100, Math.round((Math.abs(val) / maxVal) * 100)));
        }

        const activeMetricLabel = computed(() => {
          if (activeMetric.value === 'ebitda') return 'DE L\'EBITDA';
          if (activeMetric.value === 'net_income') return 'DU RÉSULTAT NET';
          if (activeMetric.value === 'altman_z_score') return 'DU SCORE ALTMAN Z\' SOLVABILITÉ';
          return 'DU CHIFFRE D\'AFFAIRES';
        });

        // Ariadne Nodes & Filtering
        const displayNodes = computed(() => {
          const nodes = resultData.value?.ownership_graph?.nodes;
          return (nodes && Array.isArray(nodes)) ? nodes : [];
        });

        const filteredNodes = computed(() => {
          let list = displayNodes.value;

          // Status Filter (Actifs / Clos / Tous)
          if (siteStatusFilter.value === 'active') {
            list = list.filter(n => n.etat_administratif === 'A');
          } else if (siteStatusFilter.value === 'closed') {
            list = list.filter(n => n.etat_administratif === 'F');
          }

          // Department Filter
          if (selectedDepartment.value) {
            list = list.filter(n => {
              const cp = n.details?.code_postal || '';
              return cp.startsWith(selectedDepartment.value);
            });
          } 
          // Region Filter (if department is not specifically selected)
          else if (selectedRegion.value) {
            list = list.filter(n => {
              const cp = n.details?.code_postal || '';
              if (!cp || cp.length < 2) return selectedRegion.value === 'Autres / Non spécifié';
              const deptCode = cp.substring(0, 2);
              return getRegionForDept(deptCode) === selectedRegion.value;
            });
          }

          // Node Selection
          if (selectedNode.value) {
            list = list.filter(n => (n.siren === selectedNode.value.siren || n.siret === selectedNode.value.siren));
          }

          return list;
        });

        const filteredModalEstablishments = computed(() => {
          let list = displayNodes.value;
          if (siteSearchQuery.value.trim()) {
            const q = siteSearchQuery.value.toLowerCase().trim();
            list = list.filter(n => {
              const name = (n.name || '').toLowerCase();
              const siret = (n.siren || n.siret || '').toLowerCase();
              const commune = (n.details?.commune || n.details?.code_postal || '').toLowerCase();
              const role = (n.role || '').toLowerCase();
              return name.includes(q) || siret.includes(q) || commune.includes(q) || role.includes(q);
            });
          }
          return list;
        });

        function openSiteInspector(node) {
          selectedSiteNode.value = node;
        }

        function centerMapOnSite(node) {
          selectedSiteNode.value = null;
          showEstablishmentsModal.value = false;
          toggleNodeSelection(node);
        }

        const totalEstablishments = computed(() => resultData.value?.ownership_graph?.total_nodes || displayNodes.value.length);
        const activeEstablishments = computed(() => resultData.value?.ownership_graph?.active_establishments_count !== undefined ? resultData.value.ownership_graph.active_establishments_count : displayNodes.value.filter(n => n.etat_administratif === 'A').length);
        const closedEstablishments = computed(() => resultData.value?.ownership_graph?.closed_establishments_count !== undefined ? resultData.value.ownership_graph.closed_establishments_count : displayNodes.value.filter(n => n.etat_administratif === 'F').length);

        const departmentList = computed(() => {
          const deptBreakdown = resultData.value?.ownership_graph?.department_breakdown;
          if (deptBreakdown && Object.keys(deptBreakdown).length > 0) {
            return Object.entries(deptBreakdown)
              .map(([code, info]) => {
                const total = typeof info === 'object' ? (info.total || 0) : Number(info || 0);
                const name = typeof info === 'object' ? (info.department_name || ('Dépt ' + code)) : ('Dépt ' + code);
                return { code, info: { department_name: name, total } };
              })
              .sort((a, b) => b.info.total - a.info.total);
          }
          const counts = {};
          displayNodes.value.forEach(node => {
            const cp = node.details?.code_postal || '';
            if (cp && cp.length >= 2) {
              const deptCode = cp.substring(0, 2);
              counts[deptCode] = (counts[deptCode] || 0) + 1;
            }
          });
          return Object.entries(counts)
            .map(([code, total]) => ({ code, info: { department_name: 'Dépt ' + code, total } }))
            .sort((a, b) => b.info.total - a.info.total);
        });

        const regionList = computed(() => {
          const map = {};
          displayNodes.value.forEach(node => {
            if (siteStatusFilter.value === 'active' && node.etat_administratif !== 'A') return;
            if (siteStatusFilter.value === 'closed' && node.etat_administratif !== 'F') return;

            const cp = node.details?.code_postal || '';
            if (cp && cp.length >= 2) {
              const deptCode = cp.substring(0, 2);
              const reg = getRegionForDept(deptCode);
              map[reg] = (map[reg] || 0) + 1;
            } else {
              map["Autres / Non spécifié"] = (map["Autres / Non spécifié"] || 0) + 1;
            }
          });
          return Object.entries(map)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);
        });

        const availableDepartmentsInSelectedRegion = computed(() => {
          if (!selectedRegion.value) return [];
          const map = {};
          displayNodes.value.forEach(node => {
            if (siteStatusFilter.value === 'active' && node.etat_administratif !== 'A') return;
            if (siteStatusFilter.value === 'closed' && node.etat_administratif !== 'F') return;

            const cp = node.details?.code_postal || '';
            if (cp && cp.length >= 2) {
              const deptCode = cp.substring(0, 2);
              const reg = getRegionForDept(deptCode);
              if (reg === selectedRegion.value) {
                map[deptCode] = (map[deptCode] || 0) + 1;
              }
            }
          });
          return Object.entries(map)
            .map(([code, total]) => {
              const deptInfo = departmentList.value.find(d => d.code === code);
              const name = deptInfo ? deptInfo.info.department_name : ('Dépt ' + code);
              return { code, name, total };
            })
            .sort((a, b) => b.total - a.total);
        });

        function setSiteStatusFilter(status) {
          siteStatusFilter.value = status;
          updateMapMarkers();
        }

        function toggleRegionFilter(regName) {
          if (selectedRegion.value === regName) {
            selectedRegion.value = null;
            selectedDepartment.value = null;
          } else {
            selectedRegion.value = regName;
            selectedDepartment.value = null;
          }
          selectedNode.value = null;
          updateMapMarkers();
        }

        function toggleDepartmentFilter(code) {
          if (selectedDepartment.value === code) {
            selectedDepartment.value = null;
          } else {
            selectedDepartment.value = code;
          }
          selectedNode.value = null;
          updateMapMarkers();
        }

        // Raven v2 Computed Timeline & Risk Filters
        const displayEvents = computed(() => {
          const ev = resultData.value?.legal_monitor_events;
          return (ev && Array.isArray(ev)) ? ev : [];
        });

        const categoryCounts = computed(() => {
          const counts = { DEPOT_COMPTES: 0, NOMINATION_GERANCE: 0, FUSION_APPORT: 0, PROCEDURE_COLLECTIVE: 0, MODIFICATION_DIVERS: 0 };
          displayEvents.value.forEach(ev => {
            const cat = ev.category || 'MODIFICATION_DIVERS';
            counts[cat] = (counts[cat] || 0) + 1;
          });
          return counts;
        });

        const totalRiskAlerts = computed(() => {
          return displayEvents.value.filter(ev => ev.is_risk_alert || ev.category === 'PROCEDURE_COLLECTIVE').length;
        });

        const ravenYears = computed(() => {
          const yrs = new Set(displayEvents.value.map(ev => ev.year).filter(Boolean));
          return Array.from(yrs).sort().reverse();
        });

        const filteredRavenEvents = computed(() => {
          let list = displayEvents.value;

          if (selectedRavenCategory.value) {
            list = list.filter(ev => ev.category === selectedRavenCategory.value);
          }

          if (selectedRavenYear.value) {
            list = list.filter(ev => String(ev.year) === String(selectedRavenYear.value));
          }

          if (ravenSearchText.value.trim()) {
            const q = ravenSearchText.value.toLowerCase().trim();
            list = list.filter(ev => {
              const text = (ev.detail_texte_brut || '') + ' ' + (ev.type || '') + ' ' + (ev.category_label || '');
              return text.toLowerCase().includes(q);
            });
          }

          return list;
        });

        function getCategoryBgClass(cat) {
          if (cat === 'DEPOT_COMPTES') return 'bg-emerald-400';
          if (cat === 'NOMINATION_GERANCE') return 'bg-sky-400';
          if (cat === 'FUSION_APPORT') return 'bg-indigo-400';
          if (cat === 'PROCEDURE_COLLECTIVE') return 'bg-rose-500';
          return 'bg-amber-400';
        }

        function getCategoryBorderClass(cat) {
          if (cat === 'DEPOT_COMPTES') return 'border-emerald-500';
          if (cat === 'NOMINATION_GERANCE') return 'border-sky-500';
          if (cat === 'FUSION_APPORT') return 'border-indigo-500';
          if (cat === 'PROCEDURE_COLLECTIVE') return 'border-rose-500';
          return 'border-amber-500';
        }

        function getCategoryTextClass(cat) {
          if (cat === 'DEPOT_COMPTES') return 'text-emerald-400 border-emerald-500/30';
          if (cat === 'NOMINATION_GERANCE') return 'text-sky-400 border-sky-500/30';
          if (cat === 'FUSION_APPORT') return 'text-indigo-400 border-indigo-500/30';
          if (cat === 'PROCEDURE_COLLECTIVE') return 'text-rose-400 border-rose-500/30';
          return 'text-amber-400 border-amber-500/30';
        }

        function getCategoryBadgeClass(cat) {
          if (cat === 'DEPOT_COMPTES') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          if (cat === 'NOMINATION_GERANCE') return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
          if (cat === 'FUSION_APPORT') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
          if (cat === 'PROCEDURE_COLLECTIVE') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        }

        function openNoticeInspector(ev) {
          selectedNoticeEvent.value = ev;
        }

        // Leaflet Map Initialization & Updates
        function initOrUpdateMap() {
          const container = document.getElementById('mapContainer');
          if (!container) return;

          if (!leafletMap) {
            leafletMap = L.map('mapContainer', {
              center: [46.603354, 1.888334],
              zoom: 6,
              zoomControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              className: 'dark-map-tiles',
              maxZoom: 19,
              attribution: 'CITADEL 360° OSINT'
            }).addTo(leafletMap);

            markersGroup = L.layerGroup().addTo(leafletMap);
          }

          setTimeout(() => {
            if (leafletMap) {
              leafletMap.invalidateSize();
              updateMapMarkers();
            }
          }, 150);
        }

        function getNodeCoords(node, index) {
          if (node.details && node.details.geoloc && Array.isArray(node.details.geoloc) && node.details.geoloc.length === 2) {
            return node.details.geoloc;
          }
          const cp = node.details?.code_postal || '';
          const dept = cp.substring(0, 2);
          if (DEPT_GPS[dept]) {
            const base = DEPT_GPS[dept];
            const offsetLat = (index % 5 - 2) * 0.035;
            const offsetLng = (Math.floor(index / 5) % 5 - 2) * 0.035;
            return [base[0] + offsetLat, base[1] + offsetLng];
          }
          const offsetLat = (index % 10 - 5) * 0.18;
          const offsetLng = (Math.floor(index / 10) % 10 - 5) * 0.18;
          return [46.603354 + offsetLat, 1.888334 + offsetLng];
        }

        function updateMapMarkers() {
          if (!leafletMap || !markersGroup) return;
          markersGroup.clearLayers();

          const nodesToMap = filteredNodes.value;
          if (nodesToMap.length === 0) return;

          const bounds = [];

          nodesToMap.forEach((node, idx) => {
            const coords = getNodeCoords(node, idx);
            bounds.push(coords);

            const isSelected = selectedNode.value && (selectedNode.value.siren === node.siren || selectedNode.value.siret === node.siren);
            const isActive = node.etat_administratif === 'A';
            const isSiege = (node.role && node.role.toLowerCase().includes('siège')) || node.is_siege || (node.details && node.details.is_siege);

            let markerRadius = 5;
            let markerWeight = 1;
            let markerColor = 'rgba(255, 255, 255, 0.7)';
            let markerFill = CITADEL_PALETTE.gold;
            let markerOpacity = 0.85;
            let markerFillOpacity = 0.85;

            if (isSelected) {
              markerRadius = 9;
              markerWeight = 2;
              markerColor = '#FFFFFF';
              markerFill = CITADEL_PALETTE.gold;
              markerOpacity = 1;
              markerFillOpacity = 1;
            } else if (isSiege) {
              markerRadius = 7;
              markerWeight = 2;
              markerColor = '#FFFFFF';
              markerFill = CITADEL_PALETTE.goldLight;
              markerOpacity = 1;
              markerFillOpacity = 1;
            } else if (!isActive) {
              markerRadius = 3.5;
              markerWeight = 1;
              markerColor = '#1E293B';
              markerFill = CITADEL_PALETTE.slate;
              markerOpacity = 0.4;
              markerFillOpacity = 0.4;
            }

            const circleMarker = L.circleMarker(coords, {
              radius: markerRadius,
              fillColor: markerFill,
              color: markerColor,
              weight: markerWeight,
              opacity: markerOpacity,
              fillOpacity: markerFillOpacity
            });

            const popupHtml = `
              <div style="font-family: 'IBM Plex Mono', monospace; background: #090D14; border: 1px solid #D99B43; border-radius: 6px; padding: 10px; min-width: 230px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.8);">
                <div style="color: #64748B; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">ÉTABLISSEMENT REGISTRÉ</div>
                <div style="color: #F1F5F9; font-weight: 700; font-size: 12px; margin-top: 3px;">${node.name}</div>
                <div style="color: #D99B43; font-size: 11px; margin-top: 3px; font-variant-numeric: tabular-nums;">SIRET : ${node.siren || node.siret}</div>
                <div style="color: #94A3B8; font-size: 10px; margin-top: 3px;">${node.details?.adresse || 'Adresse disponible'}</div>
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #1E293B; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 9px; color: #64748B;">STATUT RCS</span>
                  <span style="font-size: 10px; font-weight: 700; color: ${isActive ? '#D99B43' : '#64748B'};">
                    ${isActive ? '● EN ACTIVITÉ' : '○ FERMÉ DÉFINITIF'}
                  </span>
                </div>
              </div>
            `;

            circleMarker.bindPopup(popupHtml);

            circleMarker.on('click', () => {
              toggleNodeSelection(node);
            });

            markersGroup.addLayer(circleMarker);
          });

          if (bounds.length > 0) {
            if (nodesToMap.length === 1) {
              leafletMap.flyTo(bounds[0], 12, { duration: 0.8 });
            } else {
              leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
            }
          }
        }

        return {
          searchQuery, activeSiren, pendingQuery, isLoading, hasSearched, executionTime, performSearch: handleSearchSubmit, handleSearchSubmit, selectPreset, resetToLanding,
          showCacheNotice, cacheNoticeMessage, clearServerAndSessionCache,
          showDisambiguationModal, candidateList, confirmCandidateAndAnalyze,
          resultData, displayCompanyName, displaySiren, displaySiretSiege, displayCodeLei, displayTvaIntracomm, displayCategorieEntreprise, displayAddressSiege, displayConventionsCollectives, displaySynchroDates, displayEtatAdmin, displayFormeJuridique, displayCodeNaf, displayRegistrationDate,

          // Main Tabs & Analytics Studio State
          activeTab, analyticsSubTab, switchTab, switchAnalyticsSubTab,
          expansionStatusFilter, expansionTimeRange, renderNetworkCharts, renderBiStudioCharts, renderGovernanceCharts, renderBodaccCharts, renderFinancialCharts,
          biGeoGranularity, biSortKey, biSortAsc, regionalBIStats, departmentalBIStats, sortedBiGeoList, toggleBiSort, biTotalRelocations, biTotalFinalClosures, biTopRegionBySites, biAverageActivityRate,
          biTimelineRegionFilter, biTimelineDeptFilter, availableDepartmentsForTimelineRegionFilter, biTimelineData,
          benchmarkSearchQuery, benchmarkData, isBenchmarkLoading, showBenchmarkDisambiguationModal, benchmarkCandidateList, pendingBenchmarkQuery,
          handleBenchmarkSubmit, confirmBenchmarkCandidate, executeBenchmarkAnalysis, removeBenchmarkCompetitor,
          calculateMarginRate, calculateRealignmentIndex,
          benchmarkCompanyName, benchmarkSiren, benchmarkNodes, benchmarkExecutives, benchmarkPhysicalCount, benchmarkMoralCount, benchmarkDepartmentList, benchmarkActiveEstablishments, benchmarkTotalEstablishments, benchmarkRevenue, benchmarkNetIncome, benchmarkEvents,

          // Modals & Inspections
          showLegalProfileModal, showGovernanceModal, selectedExecutive, execSearchQuery, execStatusFilter, filteredModalExecutives, openExecutiveInspector,
          showFinancialsModal, activeMetric, activeMetricLabel, displayRevenue, displayNetIncome, displayEbitda, displayAltmanScore, displayAltmanStatus, financialYears, financialYearsWithData, formatEuros, formatMetricValue, getBarColorClass, getBarHeight,
          hasConfidentialAccounts, confidentialityLabel, displayCapitalSocial, displayObjetSocial, displayRneCertitudeScore,
          showEstablishmentsModal, siteSearchQuery, filteredModalEstablishments, selectedSiteNode, openSiteInspector, centerMapOnSite,
          showInterconnectionModal, analyzeInterconnectedEntity, loadingHoldingSiren,
          averageSiteLifespan, benchmarkAverageSiteLifespan,
          executiveTurnoverVelocity, benchmarkExecutiveTurnoverVelocity,
          legalFrictionIndex, benchmarkLegalFrictionIndex,

          // Governance & Audit
          displayExecutives, filteredHubExecutives, execSearchQueryHub, execFilterCategoryHub, physicalCount, moralCount, activeExecutivesCount, formerExecutivesCount, isExecutiveActive, getMandatePeriodLabel, getRoleTitle, getBodaccUrl,
          isAuditor, directionExecutives, auditExecutives, directionActiveCount, directionFormerCount, directionPhysicalCount, directionMoralCount, auditActiveCount, auditFormerCount, filteredDirectionExecutives, filteredAuditExecutives, auditFilterStatus,

          // Ariadne & Leaflet
          displayNodes, filteredNodes, totalEstablishments, activeEstablishments, closedEstablishments, departmentList,
          siteStatusFilter, selectedRegion, selectedDepartment, regionList, availableDepartmentsInSelectedRegion,
          setSiteStatusFilter, toggleRegionFilter, toggleDepartmentFilter, selectedNode, toggleNodeSelection,

          // Raven v2 Timeline
          displayEvents, categoryCounts, totalRiskAlerts, ravenYears, filteredRavenEvents, selectedRavenCategory, selectedRavenYear, ravenSearchText, selectedNoticeEvent,
          getCategoryBgClass, getCategoryBorderClass, getCategoryTextClass, getCategoryBadgeClass, openNoticeInspector
        };
      }
    }).mount('#app');
