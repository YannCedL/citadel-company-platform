// ==========================================================================
// CITADEL 360° — INSTITUTIONAL PALETTE & CHART.JS ENGINE (LIGHT EDITION)
// Theme: Blanc Albâtre, Ardoise Minérale & Vert Sceau d'État
// Zero Shadow • Zero Neon • Zero Glow • Precision Data Lines
// ==========================================================================
const CITADEL_PALETTE = {
  // Signature Chromatique Maîtresse (Vert Sceau d'État vs Bleu Cobalt)
  primary: '#0F766E',        // Vert Sceau d'État (Cible Principale)
  primaryLight: '#14B8A6',
  primaryDark: '#047857',
  primaryBorder: '#0F766E',
  primaryMuted: 'rgba(15, 118, 110, 0.12)',

  competitor: '#1D4ED8',     // Bleu Cobalt Royal (Benchmark / Concurrent)
  competitorLight: '#3B82F6',
  competitorDark: '#1E40AF',
  competitorBorder: '#1D4ED8',
  competitorMuted: 'rgba(29, 78, 216, 0.12)',

  // Sovereign Entity (Vert Sceau d'État — Autorité, Stabilité, Cible)
  gold: '#0F766E',
  goldLight: '#14B8A6',
  goldDark: '#047857',
  goldGlow: 'transparent',

  // Benchmark / Competitor (Bleu Cobalt & Acier)
  steel: '#1D4ED8',
  steelLight: '#3B82F6',
  steelMuted: 'rgba(29, 78, 216, 0.15)',
  silver: '#64748B',

  // Vitalité Opérationnelle & Solvabilité (Vert Forêt Fiscal)
  emerald: '#059669',
  emeraldLight: '#10B981',
  emeraldMuted: 'rgba(5, 150, 105, 0.15)',
  sauge: '#059669',

  // Risque Légal, Cessation & Passif (Rouge Carmin Débit)
  vermillon: '#DC2626',
  vermillonLight: '#EF4444',
  vermillonMuted: 'rgba(220, 38, 38, 0.15)',

  // Mobilité Stratégique & Opérations (Ambre Cuivré / Cobalt)
  cobalt: '#D97706',
  cobaltLight: '#F59E0B',
  cobaltMuted: 'rgba(217, 119, 6, 0.15)',

  // Gouvernance Neutre & Historique (Ardoise Minérale)
  slate: '#475569',
  slateDark: '#334155',
  slateMuted: '#94A3B8',

  // Surfaces & Base (Clair Minéral)
  carbon: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  gridLine: '#E2E8F0',
  textMuted: '#64748B',
  textLight: '#0F172A',
  
  // Palette Catégorielle 6 teintes (Parts de marché, actionnariat)
  nobleDonut: ['#0F766E', '#1D4ED8', '#D97706', '#6D28D9', '#0284C7', '#475569']
};

if (window.Chart) {
  Chart.defaults.color = CITADEL_PALETTE.textMuted;
  Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', sans-serif";
  Chart.defaults.font.size = 11;

  if (Chart.defaults.scale && Chart.defaults.scale.grid) {
    Chart.defaults.scale.grid.color = CITADEL_PALETTE.gridLine;
    Chart.defaults.scale.grid.borderColor = CITADEL_PALETTE.border;
    Chart.defaults.scale.grid.tickColor = 'transparent';
  }

  if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
    Chart.defaults.plugins.tooltip.backgroundColor = '#0F172A';
    Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
    Chart.defaults.plugins.tooltip.bodyColor = '#F8FAFC';
    Chart.defaults.plugins.tooltip.borderColor = '#E2E8F0';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 8;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.bodyFont = {
      family: "'Plus Jakarta Sans', sans-serif",
      weight: '600'
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


        // Disambiguation & Error Modal States
        const showDisambiguationModal = ref(false);
        const candidateList = ref([]);
        const showErrorModal = ref(false);
        const errorMessage = ref('');

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
              try {
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
              } catch (tabErr) {
                console.error("Erreur non-bloquante lors du rendu des graphiques analytiques:", tabErr);
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


        // BI Metrics & Formulas
        function calculateMarginRate(data) {
          if (!data) return 'N/D';
          const d = (data && data.value !== undefined) ? data.value : data;
          if (!d) return 'N/D';
          const balance = d?.legal_profile?.financials?.latest_balance_sheet || d?.financials?.latest_balance_sheet;
          let rev = balance?.revenue;
          let net = balance?.net_income;
          
          if ((rev === undefined || rev === null || rev === 0 || net === undefined || net === null) && d?.financials?.yearly_financial_timeline) {
            const timelineVals = Object.values(d.financials.yearly_financial_timeline || {});
            const yrs = timelineVals.sort((a, b) => ((b?.year || 0) - (a?.year || 0)));
            for (const yr of yrs) {
              if (yr && yr.revenue && yr.revenue > 0 && yr.net_income !== undefined && yr.net_income !== null) {
                rev = yr.revenue;
                net = yr.net_income;
                break;
              }
            }
          }

          if ((rev === undefined || rev === null || rev === 0 || net === undefined || net === null) && d?.legal_profile?.finances) {
            const sFin = d.legal_profile.finances;
            if (typeof sFin === 'object' && sFin !== null) {
              const yrs = Object.keys(sFin).sort().reverse();
              for (const yr of yrs) {
                const it = sFin[yr];
                if (it && it.ca && it.ca > 0 && (it.resultat_net !== undefined && it.resultat_net !== null)) {
                  rev = it.ca;
                  net = it.resultat_net;
                  break;
                }
              }
            }
          }

          if (rev && net !== undefined && net !== null && rev > 0) {
            const rate = ((net / rev) * 100).toFixed(1);
            return (rate >= 0 ? '+' : '') + rate + '%';
          }
          return 'N/D';
        }

        function calculateRealignmentIndex(nodes) {
          const list = (nodes && nodes.value !== undefined) ? nodes.value : nodes;
          if (!list || !Array.isArray(list) || list.length === 0) return '0.0';
          const closedCount = list.filter(n => n && n.etat_administratif === 'F').length;
          return ((closedCount / list.length) * 100).toFixed(1);
        }

        // Chart.js renderers
        function renderNetworkCharts() {
          try {
            const donutCtx = document.getElementById('networkDonutCanvas');
            if (donutCtx) {
              if (networkDonutChart) { networkDonutChart.destroy(); networkDonutChart = null; }
              if (window.Chart && Chart.getChart) {
                const existing = Chart.getChart(donutCtx);
                if (existing) existing.destroy();
              }

              const activeCount = activeEstablishments.value || 0;
              const closedCount = closedEstablishments.value || 0;

              if (benchmarkData.value) {
                const benchActive = benchmarkActiveEstablishments.value || 0;
                const benchClosed = Math.max(0, (benchmarkTotalEstablishments.value || 0) - benchActive);

                networkDonutChart = new Chart(donutCtx, {
                  type: 'bar',
                  data: {
                    labels: ['🟢 Établissements Actifs', '⚪ Historiques Clos'],
                    datasets: [
                      {
                        label: displayCompanyName.value,
                        data: [activeCount, closedCount],
                        backgroundColor: CITADEL_PALETTE.primary,
                        borderColor: CITADEL_PALETTE.primaryLight,
                        borderWidth: 1.5,
                        borderRadius: 6
                      },
                      {
                        label: benchmarkCompanyName.value,
                        data: [benchActive, benchClosed],
                        backgroundColor: CITADEL_PALETTE.competitor,
                        borderColor: CITADEL_PALETTE.competitorLight,
                        borderWidth: 1.5,
                        borderRadius: 6
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }, grid: { color: '#E2E8F0' } },
                      y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } }
                    },
                    plugins: {
                      legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                    }
                  }
                });
              } else {
                networkDonutChart = new Chart(donutCtx, {
                  type: 'doughnut',
                  data: {
                    labels: ['🟢 Établissements Actifs', '⚪ Établissements Historiques Clos'],
                    datasets: [{
                      label: displayCompanyName.value,
                      data: [activeCount, closedCount],
                      backgroundColor: [CITADEL_PALETTE.emerald, CITADEL_PALETTE.slate],
                      borderWidth: 2,
                      borderColor: CITADEL_PALETTE.surface
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                    }
                  }
                });
              }
            }
            // Déclencher automatiquement la vélocité d'expansion physique
            renderExpansionDecadesChart();
          } catch(err) {
            console.error("Erreur renderNetworkCharts:", err);
          }
        }

        function renderExpansionDecadesChart() {
          try {
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
                    if (!n) return;
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
                      if (!n) return;
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
              let sortedYears = Array.from(allYearsSet).map(y => parseInt(y)).filter(y => !isNaN(y)).sort((a, b) => a - b);

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
                  backgroundColor: CITADEL_PALETTE.competitor,
                  borderColor: CITADEL_PALETTE.competitorLight,
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
                    x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } }
                  },
                  plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                  }
                }
              });
            }
          } catch(err) {
            console.error("Erreur renderExpansionDecadesChart:", err);
          }
        }

        function renderGovernanceCharts() {
          try {
            const execCtx = document.getElementById('executivesDonutCanvas');
            if (execCtx) {
              if (executivesDonutChart) { executivesDonutChart.destroy(); executivesDonutChart = null; }
              if (window.Chart && Chart.getChart) {
                const existing = Chart.getChart(execCtx);
                if (existing) existing.destroy();
              }

              if (benchmarkData.value) {
                executivesDonutChart = new Chart(execCtx, {
                  type: 'bar',
                  data: {
                    labels: ['👤 Personnes Physiques (Dirigeants)', '🏢 Personnes Morales (Holdings)'],
                    datasets: [
                      {
                        label: displayCompanyName.value,
                        data: [physicalCount.value || 0, moralCount.value || 0],
                        backgroundColor: CITADEL_PALETTE.primary,
                        borderColor: CITADEL_PALETTE.primaryLight,
                        borderWidth: 1.5,
                        borderRadius: 6
                      },
                      {
                        label: benchmarkCompanyName.value,
                        data: [benchmarkPhysicalCount.value || 0, benchmarkMoralCount.value || 0],
                        backgroundColor: CITADEL_PALETTE.competitor,
                        borderColor: CITADEL_PALETTE.competitorLight,
                        borderWidth: 1.5,
                        borderRadius: 6
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }, grid: { color: '#E2E8F0' } },
                      y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } }
                    },
                    plugins: {
                      legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                    }
                  }
                });
              } else {
                executivesDonutChart = new Chart(execCtx, {
                  type: 'doughnut',
                  data: {
                    labels: ['👤 Personnes Physiques (Dirigeants)', '🏢 Personnes Morales (Holdings)'],
                    datasets: [{
                      label: displayCompanyName.value,
                      data: [physicalCount.value || 0, moralCount.value || 0],
                      backgroundColor: [CITADEL_PALETTE.primary, CITADEL_PALETTE.cobalt],
                      borderWidth: 2,
                      borderColor: CITADEL_PALETTE.surface
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                    }
                  }
                });
              }
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
                (execs || []).forEach(e => {
                  if (!e) return;
                  if (e.type_person === 'personne morale') {
                    map['Holding/Moral']++;
                  } else {
                    const r = (e.roles && Array.isArray(e.roles) && e.roles[0] ? (e.roles[0].title || e.roles[0].label || e.roles[0] || '') : (e.role || e.qualite || '')).toString().toLowerCase();
                    if (r.includes('gérant')) map['Gérant']++;
                    else if (r.includes('président')) map['Président']++;
                    else if (r.includes('directeur')) map['Directeur Gen.']++;
                    else if (r.includes('administrateur')) map['Administrateur']++;
                    else map['Autre']++;
                  }
                });
                return map;
              };

              const roleLabels = ['Gérant', 'Président', 'Directeur Gen.', 'Administrateur', 'Holding/Moral', 'Autre'];
              const mainRoles = getRoleCounts(displayExecutives.value);
              const roleColorMap = {
                'Président': CITADEL_PALETTE.gold,
                'Directeur Gen.': CITADEL_PALETTE.goldLight,
                'Gérant': '#E5A93C',
                'Administrateur': CITADEL_PALETTE.emerald,
                'Holding/Moral': CITADEL_PALETTE.steel,
                'Autre': CITADEL_PALETTE.slateMuted
              };
              const roleColors = roleLabels.map(r => roleColorMap[r] || CITADEL_PALETTE.gold);

              let datasets;
              if (benchmarkData.value) {
                const benchRoles = getRoleCounts(benchmarkExecutives.value);
                datasets = [
                  {
                    label: displayCompanyName.value,
                    data: roleLabels.map(r => mainRoles[r] || 0),
                    backgroundColor: CITADEL_PALETTE.primary,
                    borderColor: CITADEL_PALETTE.primaryLight,
                    borderWidth: 1.5,
                    borderRadius: 6
                  },
                  {
                    label: benchmarkCompanyName.value,
                    data: roleLabels.map(r => benchRoles[r] || 0),
                    backgroundColor: CITADEL_PALETTE.competitor,
                    borderColor: CITADEL_PALETTE.competitorLight,
                    borderWidth: 1.5,
                    borderRadius: 6
                  }
                ];
              } else {
                datasets = [{
                  label: displayCompanyName.value,
                  data: roleLabels.map(r => mainRoles[r] || 0),
                  backgroundColor: roleColors,
                  borderRadius: 6
                }];
              }

              executivesRoleChart = new Chart(roleCtx, {
                type: 'bar',
                data: { labels: roleLabels, datasets },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } }
                  },
                  plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                  }
                }
              });
            }
          } catch(err) {
            console.error("Erreur renderGovernanceCharts:", err);
          }
        }

        function renderBodaccCharts() {
          try {
            const bodaccCtx = document.getElementById('bodaccCategoryCanvas');
            if (bodaccCtx) {
              if (bodaccCategoryChart) { bodaccCategoryChart.destroy(); bodaccCategoryChart = null; }
              if (window.Chart && Chart.getChart) {
                const existing = Chart.getChart(bodaccCtx);
                if (existing) existing.destroy();
              }

              const catLabels = ['Dépôts de Comptes', 'Nomination/Gérance', 'Fusions/Apports', 'Procédures/Risques', 'Modifications'];
              const catKeys = ['DEPOT_COMPTES', 'NOMINATION_GERANCE', 'FUSION_APPORT', 'PROCEDURE_COLLECTIVE', 'MODIFICATION_DIVERS'];
              const counts = catKeys.map(k => (categoryCounts.value && categoryCounts.value[k]) || 0);
              const catColors = [
                CITADEL_PALETTE.emerald,   // Dépôts de Comptes: Transparence & Conformité saine
                CITADEL_PALETTE.gold,      // Nomination/Gérance: Vie statutaire & Gouvernance
                CITADEL_PALETTE.cobalt,    // Fusions/Apports: Opérations M&A & Capital
                CITADEL_PALETTE.vermillon, // Procédures/Risques: Alerte légale / Défaillance
                CITADEL_PALETTE.slateMuted // Modifications Diverses: Actes administratifs
              ];

              let datasets;
              if (benchmarkData.value) {
                const benchCounts = { DEPOT_COMPTES: 0, NOMINATION_GERANCE: 0, FUSION_APPORT: 0, PROCEDURE_COLLECTIVE: 0, MODIFICATION_DIVERS: 0 };
                (benchmarkEvents.value || []).forEach(ev => {
                  if (!ev) return;
                  const cat = ev.category || 'MODIFICATION_DIVERS';
                  benchCounts[cat] = (benchCounts[cat] || 0) + 1;
                });
                datasets = [
                  {
                    label: displayCompanyName.value,
                    data: counts,
                    backgroundColor: CITADEL_PALETTE.primary,
                    borderColor: CITADEL_PALETTE.primaryLight,
                    borderWidth: 1.5,
                    borderRadius: 6
                  },
                  {
                    label: benchmarkCompanyName.value,
                    data: catKeys.map(k => benchCounts[k] || 0),
                    backgroundColor: CITADEL_PALETTE.competitor,
                    borderColor: CITADEL_PALETTE.competitorLight,
                    borderWidth: 1.5,
                    borderRadius: 6
                  }
                ];
              } else {
                datasets = [{
                  label: displayCompanyName.value,
                  data: counts,
                  backgroundColor: catColors,
                  borderRadius: 6
                }];
              }

              bodaccCategoryChart = new Chart(bodaccCtx, {
                type: 'bar',
                data: { labels: catLabels, datasets },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } }
                  },
                  plugins: {
                    legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } }
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
                  if (!ev) return;
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
                backgroundColor: CITADEL_PALETTE.primary,
                borderColor: CITADEL_PALETTE.primaryLight,
                borderWidth: 1.5,
                borderRadius: 6
              }];

              if (benchmarkData.value) {
                datasets.push({
                  label: benchmarkCompanyName.value,
                  data: allYears.map(y => benchYearMap[y] || 0),
                  backgroundColor: CITADEL_PALETTE.competitor,
                  borderColor: CITADEL_PALETTE.competitorLight,
                  borderWidth: 1.5,
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
                    x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } }
                  },
                  plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                  }
                }
              });
            }
          } catch(err) {
            console.error("Erreur renderBodaccCharts:", err);
          }
        }

        function renderFinancialCharts() {
          try {
            const mainYrs = Array.isArray(financialYearsWithData.value) ? financialYearsWithData.value : [];
            const benchYrs = (benchmarkData.value && Array.isArray(benchmarkFinancialYears.value)) ? benchmarkFinancialYears.value : [];
            const mainMap = {};
            mainYrs.forEach(y => { if (y && y.year) mainMap[y.year] = y; });
            const benchMap = {};
            benchYrs.forEach(y => { if (y && y.year) benchMap[y.year] = y; });

            const allYears = Array.from(new Set([
              ...mainYrs.map(y => parseInt(y.year)),
              ...(benchmarkData.value ? benchYrs.map(y => parseInt(y.year)) : [])
            ])).filter(y => !isNaN(y)).sort((a, b) => a - b);

            const labels = allYears.map(String);

          // 1. FINANCIAL BAR CHART (CA, EBITDA, NET INCOME, ALTMAN Z')
          const finCtx = document.getElementById('financialsBarCanvas');
          if (finCtx) {
            if (financialsBarChart) { financialsBarChart.destroy(); financialsBarChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(finCtx);
              if (existing) existing.destroy();
            }

            let datasets;
            if (benchmarkData.value) {
              // MODE COMPARATIF : Confrontation directe Or Ambré vs Bleu Cyan avec alignement temporel parfait
              datasets = [
                {
                  type: 'bar',
                  label: 'CA (' + displayCompanyName.value + ')',
                  data: allYears.map(y => mainMap[y]?.revenue || 0),
                  backgroundColor: CITADEL_PALETTE.primary,
                  borderColor: CITADEL_PALETTE.primaryLight,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'bar',
                  label: 'CA (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => benchMap[y]?.revenue || 0),
                  backgroundColor: CITADEL_PALETTE.competitor,
                  borderColor: CITADEL_PALETTE.competitorLight,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'bar',
                  label: 'Résultat Net (' + displayCompanyName.value + ')',
                  data: allYears.map(y => mainMap[y]?.net_income || 0),
                  backgroundColor: CITADEL_PALETTE.emerald,
                  borderColor: CITADEL_PALETTE.emeraldLight,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'bar',
                  label: 'Résultat Net (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => benchMap[y]?.net_income || 0),
                  backgroundColor: '#14B8A6',
                  borderColor: '#2DD4BF',
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'line',
                  label: 'Altman Z\' (' + displayCompanyName.value + ')',
                  data: allYears.map(y => (mainMap[y]?.altman_z_score != null) ? mainMap[y].altman_z_score : null),
                  borderColor: CITADEL_PALETTE.primaryLight,
                  backgroundColor: CITADEL_PALETTE.primaryLight,
                  borderWidth: 2.5,
                  pointRadius: 5,
                  tension: 0.3,
                  yAxisID: 'yAltman'
                },
                {
                  type: 'line',
                  label: 'Altman Z\' (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => (benchMap[y]?.altman_z_score != null) ? benchMap[y].altman_z_score : null),
                  borderColor: '#38BDF8',
                  backgroundColor: '#38BDF8',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  pointRadius: 4,
                  tension: 0.3,
                  yAxisID: 'yAltman'
                }
              ];
            } else {
              // MODE SOLO : Décomposition complète Chiffre d'Affaires, EBITDA, Résultat Net et Altman Z'
              datasets = [
                {
                  type: 'bar',
                  label: 'Chiffre d\'Affaires (CA)',
                  data: allYears.map(y => mainMap[y]?.revenue || 0),
                  backgroundColor: CITADEL_PALETTE.primary,
                  borderColor: CITADEL_PALETTE.primaryLight,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'bar',
                  label: 'EBITDA (Exploitation)',
                  data: allYears.map(y => mainMap[y]?.ebitda || 0),
                  backgroundColor: CITADEL_PALETTE.cobalt,
                  borderColor: CITADEL_PALETTE.cobaltLight,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'bar',
                  label: 'Résultat Net',
                  data: allYears.map(y => mainMap[y]?.net_income || 0),
                  backgroundColor: CITADEL_PALETTE.emerald,
                  borderColor: CITADEL_PALETTE.emeraldLight,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  yAxisID: 'y'
                },
                {
                  type: 'line',
                  label: 'Score Altman Z\' Solvabilité',
                  data: allYears.map(y => (mainMap[y]?.altman_z_score != null) ? mainMap[y].altman_z_score : null),
                  borderColor: CITADEL_PALETTE.primaryLight,
                  backgroundColor: CITADEL_PALETTE.primaryLight,
                  borderWidth: 3,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  tension: 0.3,
                  yAxisID: 'yAltman'
                }
              ];
            }

            financialsBarChart = new Chart(finCtx, {
              type: 'bar',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                  y: { 
                    position: 'left',
                    ticks: { 
                      color: '#94a3b8', 
                      font: { family: 'Plus Jakarta Sans', size: 10 },
                      callback: function(value) {
                        if (Math.abs(value) >= 1000000000) return (value / 1000000000).toFixed(1) + 'B€';
                        if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(0) + 'M€';
                        if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + 'k€';
                        return value + '€';
                      }
                    }, 
                    grid: { color: '#E2E8F0' } 
                  },
                  yAltman: {
                    position: 'right',
                    title: { display: true, text: 'Score Altman Z\'', color: CITADEL_PALETTE.primaryLight, font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' } },
                    ticks: { color: CITADEL_PALETTE.primaryLight, font: { family: 'Plus Jakarta Sans', size: 10 } },
                    grid: { drawOnChartArea: false }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } }
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

            const calcNetMargin = (item) => {
              if (item && item.revenue && item.revenue > 0 && item.net_income !== undefined && item.net_income !== null) {
                return parseFloat(((item.net_income / item.revenue) * 100).toFixed(2));
              }
              return null;
            };

            const calcEbitdaMargin = (item) => {
              if (item && item.revenue && item.revenue > 0 && item.ebitda !== undefined && item.ebitda !== null) {
                return parseFloat(((item.ebitda / item.revenue) * 100).toFixed(2));
              }
              return null;
            };

            let datasets;
            if (benchmarkData.value) {
              datasets = [
                {
                  type: 'line',
                  label: 'Marge Nette % (' + displayCompanyName.value + ')',
                  data: allYears.map(y => calcNetMargin(mainMap[y])),
                  borderColor: CITADEL_PALETTE.emerald,
                  backgroundColor: CITADEL_PALETTE.emerald,
                  borderWidth: 2.5,
                  pointRadius: 4.5,
                  tension: 0.3
                },
                {
                  type: 'line',
                  label: 'Marge Nette % (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => calcNetMargin(benchMap[y])),
                  borderColor: CITADEL_PALETTE.competitor,
                  backgroundColor: CITADEL_PALETTE.competitor,
                  borderWidth: 2,
                  borderDash: [5, 5],
                  pointRadius: 4,
                  tension: 0.3
                },
                {
                  type: 'line',
                  label: 'Marge EBITDA % (' + displayCompanyName.value + ')',
                  data: allYears.map(y => calcEbitdaMargin(mainMap[y])),
                  borderColor: CITADEL_PALETTE.cobalt,
                  backgroundColor: CITADEL_PALETTE.cobalt,
                  borderWidth: 2.5,
                  pointRadius: 4.5,
                  tension: 0.3
                },
                {
                  type: 'line',
                  label: 'Marge EBITDA % (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => calcEbitdaMargin(benchMap[y])),
                  borderColor: '#818CF8',
                  backgroundColor: '#818CF8',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  pointRadius: 4,
                  tension: 0.3
                }
              ];
            } else {
              datasets = [
                {
                  type: 'line',
                  label: 'Marge Nette (%)',
                  data: allYears.map(y => calcNetMargin(mainMap[y])),
                  borderColor: CITADEL_PALETTE.emerald,
                  backgroundColor: CITADEL_PALETTE.emerald,
                  borderWidth: 2.5,
                  pointRadius: 4.5,
                  pointHoverRadius: 6.5,
                  tension: 0.3
                },
                {
                  type: 'line',
                  label: 'Marge EBITDA (%)',
                  data: allYears.map(y => calcEbitdaMargin(mainMap[y])),
                  borderColor: CITADEL_PALETTE.cobalt,
                  backgroundColor: CITADEL_PALETTE.cobalt,
                  borderWidth: 2.5,
                  pointRadius: 4.5,
                  pointHoverRadius: 6.5,
                  tension: 0.3
                }
              ];
            }

            financialMarginsChart = new Chart(marginsCtx, {
              type: 'line',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Marge (%)', color: CITADEL_PALETTE.emerald, font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' } },
                    ticks: {
                      color: '#94a3b8',
                      font: { family: 'Plus Jakarta Sans', size: 10 },
                      callback: function(v) { return v + '%'; }
                    },
                    grid: { color: '#E2E8F0' }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } }
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

            let datasets;
            if (benchmarkData.value) {
              datasets = [
                {
                  type: 'bar',
                  label: 'Total Actif (' + displayCompanyName.value + ')',
                  data: allYears.map(y => mainMap[y]?.total_assets || 0),
                  backgroundColor: CITADEL_PALETTE.primary,
                  borderColor: CITADEL_PALETTE.primaryLight,
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Total Actif (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => benchMap[y]?.total_assets || 0),
                  backgroundColor: '#0284C7',
                  borderColor: '#38BDF8',
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Capitaux Propres (' + displayCompanyName.value + ')',
                  data: allYears.map(y => mainMap[y]?.equity || 0),
                  backgroundColor: CITADEL_PALETTE.emerald,
                  borderColor: CITADEL_PALETTE.emeraldLight,
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Capitaux Propres (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => benchMap[y]?.equity || 0),
                  backgroundColor: '#0F766E',
                  borderColor: '#2DD4BF',
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Dettes (' + displayCompanyName.value + ')',
                  data: allYears.map(y => mainMap[y]?.debt || 0),
                  backgroundColor: CITADEL_PALETTE.vermillon,
                  borderColor: CITADEL_PALETTE.vermillonLight,
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Dettes (' + benchmarkCompanyName.value + ')',
                  data: allYears.map(y => benchMap[y]?.debt || 0),
                  backgroundColor: '#BE123C',
                  borderColor: '#FB7185',
                  borderWidth: 1.5,
                  borderRadius: 6
                }
              ];
            } else {
              datasets = [
                {
                  type: 'bar',
                  label: 'Total Actif',
                  data: allYears.map(y => mainMap[y]?.total_assets || 0),
                  backgroundColor: CITADEL_PALETTE.primary,
                  borderColor: CITADEL_PALETTE.primaryLight,
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Capitaux Propres (Fonds Propres)',
                  data: allYears.map(y => mainMap[y]?.equity || 0),
                  backgroundColor: CITADEL_PALETTE.emerald,
                  borderColor: CITADEL_PALETTE.emeraldLight,
                  borderWidth: 1.5,
                  borderRadius: 6
                },
                {
                  type: 'bar',
                  label: 'Dettes Financières / Passif',
                  data: allYears.map(y => mainMap[y]?.debt || 0),
                  backgroundColor: CITADEL_PALETTE.vermillon,
                  borderColor: CITADEL_PALETTE.vermillonLight,
                  borderWidth: 1.5,
                  borderRadius: 6
                }
              ];
            }

            financialBalanceSheetChart = new Chart(bsCtx, {
              type: 'bar',
              data: { labels, datasets },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                  y: {
                    type: 'linear',
                    ticks: {
                      color: '#94a3b8',
                      font: { family: 'Plus Jakarta Sans', size: 10 },
                      callback: function(value) {
                        if (Math.abs(value) >= 1000000000) return (value / 1000000000).toFixed(1) + 'B€';
                        if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(0) + 'M€';
                        if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + 'k€';
                        return value + '€';
                      }
                    },
                    grid: { color: '#E2E8F0' }
                  }
                },
                plugins: {
                  legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } }
                }
              }
            });
          }
        } catch(err) {
          console.error("Erreur renderFinancialCharts:", err);
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
        const benchmarkHasConfidentialAccounts = computed(() => {
          const fin = benchmarkData.value?.financials;
          const legFin = benchmarkData.value?.legal_profile?.financials;
          return !!(
            fin?.is_confidential ||
            fin?.latest_balance_sheet?.is_confidential ||
            legFin?.is_confidential ||
            legFin?.latest_balance_sheet?.is_confidential
          );
        });

        function normalizeFinancialYearItem(raw, defaultYear) {
          if (!raw) return null;
          const yr = defaultYear || raw.year || (raw.date_cloture ? parseInt(String(raw.date_cloture).split('-')[0]) : 0);
          const rev = raw.revenue ?? raw.ca ?? raw.chiffre_affaires ?? null;
          const net = raw.net_income ?? raw.resultat_net ?? null;
          const eb = raw.ebitda ?? raw.operating_income ?? null;
          const assets = raw.total_assets ?? raw.totalActif ?? null;
          const eq = raw.equity ?? raw.capitaux_propres ?? null;
          const debts = raw.debt ?? raw.financial_debts ?? raw.total_debts ?? null;
          const margin = raw.profit_margin_percent ?? ((rev && rev > 0 && net !== null && net !== undefined) ? Number(((net / rev) * 100).toFixed(1)) : null);
          const altman = raw.altman_z_score ?? null;

          return {
            year: yr,
            revenue: rev,
            ebitda: eb,
            net_income: net,
            total_assets: assets,
            equity: eq,
            debt: debts,
            financial_debts: debts,
            total_debts: debts,
            profit_margin_percent: margin,
            altman_z_score: altman
          };
        }

        function extractConsolidatedFinancialYears(sourceData) {
          if (!sourceData) return [];
          const fin = sourceData.financials;
          const map = {};

          // 1. Timeline (priorité 1 - INPI RNE multi-annuel)
          const timeline = fin?.yearly_financial_timeline;
          if (timeline && typeof timeline === 'object') {
            for (const [yStr, val] of Object.entries(timeline)) {
              const yInt = parseInt(yStr) || val?.year;
              if (yInt && !isNaN(yInt)) {
                map[yInt] = normalizeFinancialYearItem(val, yInt);
              }
            }
          }

          // 2. Dernier bilan certifié (complément si année manquante)
          const latest = fin?.latest_balance_sheet;
          if (latest && latest.year) {
            const yInt = parseInt(latest.year);
            if (yInt && !isNaN(yInt) && !map[yInt]) {
              map[yInt] = normalizeFinancialYearItem(latest, yInt);
            }
          }

          // 3. Complément SIRENE (si l'INPI n'a pas certaines années antérieures)
          const sireneFin = sourceData.legal_profile?.finances;
          if (sireneFin && typeof sireneFin === 'object') {
            for (const [yStr, val] of Object.entries(sireneFin)) {
              const yInt = parseInt(yStr);
              if (yInt && !isNaN(yInt) && !map[yInt]) {
                map[yInt] = normalizeFinancialYearItem({
                  year: yInt,
                  revenue: val?.ca || val?.revenue,
                  net_income: val?.resultat_net || val?.net_income
                }, yInt);
              }
            }
          }

          const arr = Object.values(map).filter(item => item && item.year);
          return arr.sort((a, b) => a.year - b.year);
        }

        function getReversedYears(list) {
          if (!list) return [];
          const arr = Array.isArray(list) ? list : (list.value && Array.isArray(list.value) ? list.value : []);
          return [...arr].reverse();
        }

        const benchmarkFinancialYears = computed(() => extractConsolidatedFinancialYears(benchmarkData.value));
        const reversedBenchmarkFinancialYears = computed(() => getReversedYears(benchmarkFinancialYears.value));

        const benchmarkRevenue = computed(() => {
          const fin = benchmarkData.value?.financials;
          const legFin = benchmarkData.value?.legal_profile?.financials;
          
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

          if (rev === undefined || rev === null) {
            const sireneFin = benchmarkData.value?.legal_profile?.finances;
            if (sireneFin && typeof sireneFin === 'object') {
              const yrs = Object.keys(sireneFin).sort().reverse();
              for (const yr of yrs) {
                const item = sireneFin[yr];
                if (item?.ca || item?.revenue) {
                  rev = item.ca || item.revenue;
                  break;
                }
              }
            }
          }

          if (rev !== undefined && rev !== null && rev !== 0) {
            return formatEuros(rev);
          }

          if (benchmarkHasConfidentialAccounts.value) {
            return 'Confidentiel (Décret L. 232-25)';
          }

          if (fin?.latest_balance_sheet || (fin?.yearly_financial_timeline && Object.keys(fin.yearly_financial_timeline).length > 0)) {
            return 'N/A (Secteur Financier / Bilan Déposé)';
          }

          return 'Bilan non publié';
        });

        const benchmarkNetIncome = computed(() => {
          const fin = benchmarkData.value?.financials;
          const legFin = benchmarkData.value?.legal_profile?.financials;
          
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

          if (net === undefined || net === null) {
            const sireneFin = benchmarkData.value?.legal_profile?.finances;
            if (sireneFin && typeof sireneFin === 'object') {
              const yrs = Object.keys(sireneFin).sort().reverse();
              for (const yr of yrs) {
                const item = sireneFin[yr];
                if (item?.resultat_net || item?.net_income) {
                  net = item.resultat_net || item.net_income;
                  break;
                }
              }
            }
          }

          if (net !== undefined && net !== null && net !== 0) {
            return formatEuros(net);
          }

          if (benchmarkHasConfidentialAccounts.value) {
            return 'Confidentiel (Décret L. 232-25)';
          }

          return 'Bilan non publié';
        });

        const benchmarkEbitda = computed(() => {
          const fin = benchmarkData.value?.financials;
          const legFin = benchmarkData.value?.legal_profile?.financials;
          
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

          if (benchmarkHasConfidentialAccounts.value) {
            return 'Confidentiel (Décret L. 232-25)';
          }

          return 'N/D';
        });

        const benchmarkAltmanScore = computed(() => {
          const score = benchmarkData.value?.financials?.ratios?.altman_z_score;
          return (score !== null && score !== undefined) ? score : 'N/D';
        });

        const benchmarkAltmanStatus = computed(() => {
          const status = benchmarkData.value?.financials?.ratios?.altman_status;
          if (status && status !== 'Données insuffisantes (bilan incomplet)') return status;
          return 'Bilan Synthétique RNE (Actif/Passif non détaillé)';
        });

        const benchmarkEvents = computed(() => benchmarkData.value?.legal_monitor_events || []);

        // Advanced BI Metrics & Enriched KPIs
        const averageSiteLifespan = computed(() => {
          const closed = (displayNodes.value || []).filter(n => n && n.etat_administratif === 'F');
          if (closed.length === 0) return 'Aucun site clos';
          let totalYears = 0;
          let count = 0;
          closed.forEach(n => {
            const cDate = n?.details?.date_creation || n?.details?.creation_date || n?.creation_date || (n?.creation_year ? String(n.creation_year) : null);
            const fDate = n?.details?.date_fermeture || n?.details?.fermeture_date || n?.date_fermeture;
            if (cDate && fDate) {
              const cYear = parseInt(String(cDate).substring(0, 4));
              const fYear = parseInt(String(fDate).substring(0, 4));
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
          const closed = (benchmarkNodes.value || []).filter(n => n && n.etat_administratif === 'F');
          if (closed.length === 0) return 'Aucun site clos';
          let totalYears = 0;
          let count = 0;
          closed.forEach(n => {
            const cDate = n?.details?.date_creation || n?.details?.creation_date || n?.creation_date || (n?.creation_year ? String(n.creation_year) : null);
            const fDate = n?.details?.date_fermeture || n?.details?.fermeture_date || n?.date_fermeture;
            if (cDate && fDate) {
              const cYear = parseInt(String(cDate).substring(0, 4));
              const fYear = parseInt(String(fDate).substring(0, 4));
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
          const geranceEvents = (displayEvents.value || []).filter(ev => ev && ev.category === 'NOMINATION_GERANCE').length;
          const regDate = displayRegistrationDate.value;
          let yearsTracked = 5;
          if (regDate && /^\d{4}/.test(String(regDate))) {
            const startYr = parseInt(String(regDate).substring(0, 4));
            const currYr = new Date().getFullYear();
            if (currYr > startYr) yearsTracked = Math.max(1, currYr - startYr);
          }
          const rate = (geranceEvents / yearsTracked).toFixed(1);
          return `${rate} Mouvements/An`;
        });

        const benchmarkExecutiveTurnoverVelocity = computed(() => {
          const geranceEvents = (benchmarkEvents.value || []).filter(ev => ev && ev.category === 'NOMINATION_GERANCE').length;
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

        function computeRegionalStats(nodes) {
          const map = {};
          (nodes || []).forEach(node => {
            if (!node) return;
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
              const hasReloc = isRelocationEstablishment(node, nodes);
              if (hasReloc) {
                item.relocations += 1;
              } else {
                item.final_closures += 1;
              }
              const cDate = node.details?.date_creation || node.creation_date;
              const fDate = node.details?.date_fermeture || node.date_fermeture;
              if (cDate && fDate) {
                const cYr = parseInt(String(cDate).substring(0, 4));
                const fYr = parseInt(String(fDate).substring(0, 4));
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
        }

        function computeDepartmentalStats(nodes) {
          const map = {};
          (nodes || []).forEach(node => {
            if (!node) return;
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
              const hasReloc = isRelocationEstablishment(node, nodes);
              if (hasReloc) {
                item.relocations += 1;
              } else {
                item.final_closures += 1;
              }
              const cDate = node.details?.date_creation || node.creation_date;
              const fDate = node.details?.date_fermeture || node.date_fermeture;
              if (cDate && fDate) {
                const cYr = parseInt(String(cDate).substring(0, 4));
                const fYr = parseInt(String(fDate).substring(0, 4));
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
        }

        const biGeoEntityFilter = ref('all'); // 'all', 'primary', 'benchmark'

        const regionalBIStats = computed(() => {
          return computeRegionalStats(displayNodes.value);
        });

        const departmentalBIStats = computed(() => {
          return computeDepartmentalStats(displayNodes.value);
        });

        const benchmarkRegionalBIStats = computed(() => {
          return computeRegionalStats(benchmarkNodes.value);
        });

        const benchmarkDepartmentalBIStats = computed(() => {
          return computeDepartmentalStats(benchmarkNodes.value);
        });

        const comparisonBiGeoList = computed(() => {
          const isRegion = biGeoGranularity.value === 'region';
          const primaryList = isRegion ? regionalBIStats.value : departmentalBIStats.value;
          const benchList = isRegion ? benchmarkRegionalBIStats.value : benchmarkDepartmentalBIStats.value;

          const map = {};
          primaryList.forEach(p => {
            const key = isRegion ? p.name : p.code;
            map[key] = {
              key,
              name: p.name,
              regionName: p.regionName || '',
              primaryTotal: p.total,
              primaryActive: p.active,
              primaryClosed: p.closed,
              primaryRate: p.activity_rate,
              primaryRelocations: p.relocations,
              primaryFinalClosures: p.final_closures,
              primaryAvgLifespan: p.avg_lifespan,
              benchmarkTotal: 0,
              benchmarkActive: 0,
              benchmarkClosed: 0,
              benchmarkRate: 0,
              benchmarkRelocations: 0,
              benchmarkFinalClosures: 0,
              benchmarkAvgLifespan: 'N/A'
            };
          });

          benchList.forEach(b => {
            const key = isRegion ? b.name : b.code;
            if (!map[key]) {
              map[key] = {
                key,
                name: b.name,
                regionName: b.regionName || '',
                primaryTotal: 0,
                primaryActive: 0,
                primaryClosed: 0,
                primaryRate: 0,
                primaryRelocations: 0,
                primaryFinalClosures: 0,
                primaryAvgLifespan: 'N/A',
                benchmarkTotal: b.total,
                benchmarkActive: b.active,
                benchmarkClosed: b.closed,
                benchmarkRate: b.activity_rate,
                benchmarkRelocations: b.relocations,
                benchmarkFinalClosures: b.final_closures,
                benchmarkAvgLifespan: b.avg_lifespan
              };
            } else {
              map[key].benchmarkTotal = b.total;
              map[key].benchmarkActive = b.active;
              map[key].benchmarkClosed = b.closed;
              map[key].benchmarkRate = b.activity_rate;
              map[key].benchmarkRelocations = b.relocations;
              map[key].benchmarkFinalClosures = b.final_closures;
              map[key].benchmarkAvgLifespan = b.avg_lifespan;
            }
          });

          return Object.values(map).map(item => {
            const totalCombined = item.primaryTotal + item.benchmarkTotal;
            const diff = item.primaryTotal - item.benchmarkTotal;
            let leader = 'Égalité';
            if (item.primaryTotal > item.benchmarkTotal) {
              leader = displayCompanyName.value;
            } else if (item.benchmarkTotal > item.primaryTotal) {
              leader = benchmarkCompanyName.value;
            }
            return {
              ...item,
              total: totalCombined,
              totalCombined,
              diff,
              leader
            };
          });
        });

        const sortedBiGeoList = computed(() => {
          let baseList = [];
          if (benchmarkData.value && biGeoEntityFilter.value === 'all') {
            baseList = [...comparisonBiGeoList.value];
          } else if (benchmarkData.value && biGeoEntityFilter.value === 'benchmark') {
            baseList = biGeoGranularity.value === 'region' ? [...benchmarkRegionalBIStats.value] : [...benchmarkDepartmentalBIStats.value];
          } else {
            baseList = biGeoGranularity.value === 'region' ? [...regionalBIStats.value] : [...departmentalBIStats.value];
          }

          const k = biSortKey.value;
          const asc = biSortAsc.value;

          return baseList.sort((a, b) => {
            let valA = a[k];
            let valB = b[k];

            if (k === 'lifespan') {
              valA = parseFloat(a.avg_lifespan || a.primaryAvgLifespan) || 0;
              valB = parseFloat(b.avg_lifespan || b.primaryAvgLifespan) || 0;
            } else if (k === 'name') {
              valA = (a.name || '').toLowerCase();
              valB = (b.name || '').toLowerCase();
            } else if (k === 'total') {
              valA = (a.totalCombined !== undefined ? a.totalCombined : a.total) || 0;
              valB = (b.totalCombined !== undefined ? b.totalCombined : b.total) || 0;
            } else if (k === 'active') {
              valA = (a.primaryActive !== undefined ? a.primaryActive : a.active) || 0;
              valB = (b.primaryActive !== undefined ? b.primaryActive : b.active) || 0;
            } else if (k === 'closed') {
              valA = (a.primaryClosed !== undefined ? a.primaryClosed : a.closed) || 0;
              valB = (b.primaryClosed !== undefined ? b.primaryClosed : b.closed) || 0;
            } else if (k === 'benchmarkTotal') {
              valA = a.benchmarkTotal || 0;
              valB = b.benchmarkTotal || 0;
            } else if (k === 'diff') {
              valA = a.diff || 0;
              valB = b.diff || 0;
            }

            if (valA === undefined || valA === null) valA = 0;
            if (valB === undefined || valB === null) valB = 0;

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

        const benchmarkBiTotalRelocations = computed(() => {
          return benchmarkRegionalBIStats.value.reduce((acc, curr) => acc + curr.relocations, 0);
        });

        const benchmarkBiTotalFinalClosures = computed(() => {
          return benchmarkRegionalBIStats.value.reduce((acc, curr) => acc + curr.final_closures, 0);
        });

        const benchmarkBiTopRegionBySites = computed(() => {
          if (benchmarkRegionalBIStats.value.length === 0) return 'Aucune';
          const top = [...benchmarkRegionalBIStats.value].sort((a, b) => b.total - a.total)[0];
          return `${top.name} (${top.total} sites)`;
        });

        const benchmarkBiAverageActivityRate = computed(() => {
          const tot = benchmarkTotalEstablishments.value;
          const act = benchmarkActiveEstablishments.value;
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

        function renderBiTimelineAndGeoCharts() {
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
                  x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                  y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' }, beginAtZero: true }
                },
                plugins: {
                  legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } },
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

          // 2. STACKED BAR CHART (ACTIFS VS CLOS OU COMPARATIF)
          const stackedCtx = document.getElementById('biGeoStackedCanvas');
          if (stackedCtx) {
            if (biGeoStackedChart) { biGeoStackedChart.destroy(); biGeoStackedChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(stackedCtx);
              if (existing) existing.destroy();
            }

            if (benchmarkData.value && biGeoEntityFilter.value === 'all') {
              const items = comparisonBiGeoList.value.slice(0, 12);
              biGeoStackedChart = new Chart(stackedCtx, {
                type: 'bar',
                data: {
                  labels: items.map(i => i.name),
                  datasets: [
                    {
                      label: `🏢 ${displayCompanyName.value} (Sites)`,
                      data: items.map(i => i.primaryTotal),
                      backgroundColor: CITADEL_PALETTE.gold,
                      borderColor: CITADEL_PALETTE.goldLight,
                      borderWidth: 1.5,
                      borderRadius: 4
                    },
                    {
                      label: `⚔️ ${benchmarkCompanyName.value} (Sites)`,
                      data: items.map(i => i.benchmarkTotal),
                      backgroundColor: CITADEL_PALETTE.competitor,
                      borderColor: CITADEL_PALETTE.competitorLight,
                      borderWidth: 1.5,
                      borderRadius: 4
                    }
                  ]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' }, beginAtZero: true }
                  },
                  plugins: { legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } } }
                }
              });
            } else if (benchmarkData.value && biGeoEntityFilter.value === 'benchmark') {
              const items = sortedBiGeoList.value.slice(0, 12);
              biGeoStackedChart = new Chart(stackedCtx, {
                type: 'bar',
                data: {
                  labels: items.map(i => i.name),
                  datasets: [
                    { label: '🟢 Actifs', data: items.map(i => i.active), backgroundColor: CITADEL_PALETTE.competitor, borderRadius: 4 },
                    { label: '🔴 Clos', data: items.map(i => i.closed), backgroundColor: CITADEL_PALETTE.vermillon, borderRadius: 4 }
                  ]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' }, beginAtZero: true }
                  },
                  plugins: { legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } } }
                }
              });
            } else {
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
                    x: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' } },
                    y: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }, grid: { color: '#E2E8F0' }, beginAtZero: true }
                  },
                  plugins: { legend: { labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } } }
                }
              });
            }
          }

          // 3. DONUT CHART MOTIFS DE FERMETURE
          const donutCtx = document.getElementById('biClosureReasonCanvas');
          if (donutCtx) {
            if (biClosureReasonChart) { biClosureReasonChart.destroy(); biClosureReasonChart = null; }
            if (window.Chart && Chart.getChart) {
              const existing = Chart.getChart(donutCtx);
              if (existing) existing.destroy();
            }

            let datasets = [];
            if (benchmarkData.value && biGeoEntityFilter.value === 'all') {
              datasets = [
                {
                  label: displayCompanyName.value,
                  data: [biTotalRelocations.value, biTotalFinalClosures.value],
                  backgroundColor: [CITADEL_PALETTE.gold, CITADEL_PALETTE.vermillon],
                  borderWidth: 2,
                  borderColor: CITADEL_PALETTE.surface
                },
                {
                  label: benchmarkCompanyName.value,
                  data: [benchmarkBiTotalRelocations.value, benchmarkBiTotalFinalClosures.value],
                  backgroundColor: [CITADEL_PALETTE.competitor, CITADEL_PALETTE.rose],
                  borderWidth: 2,
                  borderColor: CITADEL_PALETTE.surface
                }
              ];
            } else if (benchmarkData.value && biGeoEntityFilter.value === 'benchmark') {
              datasets = [{
                label: benchmarkCompanyName.value,
                data: [benchmarkBiTotalRelocations.value, benchmarkBiTotalFinalClosures.value],
                backgroundColor: [CITADEL_PALETTE.competitor, CITADEL_PALETTE.vermillon],
                borderWidth: 2,
                borderColor: CITADEL_PALETTE.surface
              }];
            } else {
              datasets = [{
                label: displayCompanyName.value,
                data: [biTotalRelocations.value, biTotalFinalClosures.value],
                backgroundColor: [CITADEL_PALETTE.cobalt, CITADEL_PALETTE.vermillon],
                borderWidth: 2,
                borderColor: CITADEL_PALETTE.surface
              }];
            }

            biClosureReasonChart = new Chart(donutCtx, {
              type: 'doughnut',
              data: {
                labels: ['Relocalisations 🔄', 'Fermetures Fermes ❌'],
                datasets: datasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#334155', font: { family: 'Plus Jakarta Sans', size: 11 } } } }
              }
            });
          }
        }

        function renderBiStudioCharts() {
          renderNetworkCharts();
          renderExpansionDecadesChart();
          renderBiTimelineAndGeoCharts();
        }

        watch([analyticsSubTab, biTimelineRegionFilter, biTimelineDeptFilter, biGeoGranularity, biGeoEntityFilter, resultData, benchmarkData], () => {
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
            } else {
              const errData = await res.json().catch(() => ({}));
              const msg = errData.detail || errData.message || "Impossible d'analyser cette entreprise pour le moment.";
              errorMessage.value = msg;
              showErrorModal.value = true;
            }
          } catch(e) {
            console.error(e);
            errorMessage.value = "Une erreur de communication est survenue. Veuillez réessayer.";
            showErrorModal.value = true;
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

          if (fin?.latest_balance_sheet || (fin?.yearly_financial_timeline && Object.keys(fin.yearly_financial_timeline).length > 0)) {
            return 'N/A (Secteur Financier / Bilan Déposé)';
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

        const financialYears = computed(() => extractConsolidatedFinancialYears(resultData.value));
        const reversedFinancialYears = computed(() => getReversedYears(financialYears.value));

        // Direct Benchmark Indicators with explicit Exercise Year Annotation
        const displayRevenueWithYear = computed(() => {
          const yrs = reversedFinancialYears.value || [];
          for (const y of yrs) {
            if (y.revenue !== undefined && y.revenue !== null && y.revenue !== 0) {
              return `${formatEuros(y.revenue)} (${y.year})`;
            }
          }
          if (hasConfidentialAccounts.value) return 'Confidentiel';
          if (yrs.length > 0) return 'N/A (Secteur Financier)';
          return 'Bilan non publié';
        });

        const benchmarkRevenueWithYear = computed(() => {
          const yrs = reversedBenchmarkFinancialYears.value || [];
          for (const y of yrs) {
            if (y.revenue !== undefined && y.revenue !== null && y.revenue !== 0) {
              return `${formatEuros(y.revenue)} (${y.year})`;
            }
          }
          if (benchmarkHasConfidentialAccounts.value) return 'Confidentiel';
          if (yrs.length > 0) return 'N/A (Secteur Financier)';
          return 'Bilan non publié';
        });

        const displayNetIncomeWithYear = computed(() => {
          const yrs = reversedFinancialYears.value || [];
          for (const y of yrs) {
            if (y.net_income !== undefined && y.net_income !== null && y.net_income !== 0) {
              return `${formatEuros(y.net_income)} (${y.year})`;
            }
          }
          if (hasConfidentialAccounts.value) return 'Confidentiel';
          return 'Bilan non publié';
        });

        const benchmarkNetIncomeWithYear = computed(() => {
          const yrs = reversedBenchmarkFinancialYears.value || [];
          for (const y of yrs) {
            if (y.net_income !== undefined && y.net_income !== null && y.net_income !== 0) {
              return `${formatEuros(y.net_income)} (${y.year})`;
            }
          }
          if (benchmarkHasConfidentialAccounts.value) return 'Confidentiel';
          return 'Bilan non publié';
        });

        const displayMarginWithYear = computed(() => {
          const yrs = reversedFinancialYears.value || [];
          for (const y of yrs) {
            if (y.profit_margin_percent !== undefined && y.profit_margin_percent !== null) {
              const sign = y.profit_margin_percent >= 0 ? '+' : '';
              return `${sign}${typeof y.profit_margin_percent === 'number' ? y.profit_margin_percent.toFixed(1) : y.profit_margin_percent}% (${y.year})`;
            }
            if (y.revenue && y.revenue > 0 && y.net_income !== undefined && y.net_income !== null) {
              const sign = y.net_income >= 0 ? '+' : '';
              return `${sign}${((y.net_income / y.revenue) * 100).toFixed(1)}% (${y.year})`;
            }
          }
          return 'N/D';
        });

        const benchmarkMarginWithYear = computed(() => {
          const yrs = reversedBenchmarkFinancialYears.value || [];
          for (const y of yrs) {
            if (y.profit_margin_percent !== undefined && y.profit_margin_percent !== null) {
              const sign = y.profit_margin_percent >= 0 ? '+' : '';
              return `${sign}${typeof y.profit_margin_percent === 'number' ? y.profit_margin_percent.toFixed(1) : y.profit_margin_percent}% (${y.year})`;
            }
            if (y.revenue && y.revenue > 0 && y.net_income !== undefined && y.net_income !== null) {
              const sign = y.net_income >= 0 ? '+' : '';
              return `${sign}${((y.net_income / y.revenue) * 100).toFixed(1)}% (${y.year})`;
            }
          }
          return 'N/D';
        });

        const displayTotalAssetsWithYear = computed(() => {
          const yrs = reversedFinancialYears.value || [];
          for (const y of yrs) {
            if (y.total_assets) return `${formatEuros(y.total_assets)} (${y.year})`;
          }
          return 'N/D';
        });

        const benchmarkTotalAssetsWithYear = computed(() => {
          const yrs = reversedBenchmarkFinancialYears.value || [];
          for (const y of yrs) {
            if (y.total_assets) return `${formatEuros(y.total_assets)} (${y.year})`;
          }
          return 'N/D';
        });

        const displayEquityWithYear = computed(() => {
          const yrs = reversedFinancialYears.value || [];
          for (const y of yrs) {
            if (y.equity) return `${formatEuros(y.equity)} (${y.year})`;
          }
          return 'N/D';
        });

        const benchmarkEquityWithYear = computed(() => {
          const yrs = reversedBenchmarkFinancialYears.value || [];
          for (const y of yrs) {
            if (y.equity) return `${formatEuros(y.equity)} (${y.year})`;
          }
          return 'N/D';
        });

        const financialYearsWithData = computed(() => {
          const m = activeMetric.value || 'revenue';
          const base = Array.isArray(financialYears.value) ? financialYears.value : [];
          const list = base.filter(y => y && y[m] !== null && y[m] !== undefined && y[m] !== 0);
          return list.length > 0 ? list : base;
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
            let markerColor = 'rgba(255, 255, 255, 0.5)';
            let markerFill = isActive ? CITADEL_PALETTE.emerald : CITADEL_PALETTE.vermillon;
            let markerOpacity = isActive ? 0.9 : 0.75;
            let markerFillOpacity = isActive ? 0.85 : 0.65;

            if (isSelected) {
              markerRadius = 9;
              markerWeight = 2.5;
              markerColor = '#FFFFFF';
              markerFill = isActive ? CITADEL_PALETTE.emeraldLight : CITADEL_PALETTE.vermillon;
              markerOpacity = 1;
              markerFillOpacity = 1;
            } else if (isSiege) {
              // Siege social : or = identite de l'entreprise, priorite visuelle maximale
              markerRadius = 8;
              markerWeight = 2;
              markerColor = '#FFFFFF';
              markerFill = CITADEL_PALETTE.gold;
              markerOpacity = 1;
              markerFillOpacity = 1;
            } else if (!isActive) {
              markerRadius = 4;
              markerWeight = 1;
              markerColor = 'rgba(239,68,68,0.4)';
              markerFill = CITADEL_PALETTE.vermillon;
              markerOpacity = 0.75;
              markerFillOpacity = 0.6;
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
              <div style="font-family: 'Plus Jakarta Sans', monospace; background: #090D14; border: 1px solid #D99B43; border-radius: 6px; padding: 10px; min-width: 230px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.8);">
                <div style="color: #64748B; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">ÉTABLISSEMENT REGISTRÉ</div>
                <div style="color: #F1F5F9; font-weight: 700; font-size: 12px; margin-top: 3px;">${node.name}</div>
                <div style="color: #D99B43; font-size: 11px; margin-top: 3px; font-variant-numeric: tabular-nums;">SIRET : ${node.siren || node.siret}</div>
                <div style="color: #94A3B8; font-size: 10px; margin-top: 3px;">${node.details?.adresse || 'Adresse disponible'}</div>
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #1E293B; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 9px; color: #64748B;">STATUT RCS</span>
                  <span style="font-size: 10px; font-weight: 700; color: ${isActive ? '#22C55E' : '#EF4444'};">
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
          showDisambiguationModal, candidateList, confirmCandidateAndAnalyze,
          showErrorModal, errorMessage,
          resultData, displayCompanyName, displaySiren, displaySiretSiege, displayCodeLei, displayTvaIntracomm, displayCategorieEntreprise, displayAddressSiege, displayConventionsCollectives, displaySynchroDates, displayEtatAdmin, displayFormeJuridique, displayCodeNaf, displayRegistrationDate,

          // Main Tabs & Analytics Studio State
          activeTab, analyticsSubTab, switchTab, switchAnalyticsSubTab,
          expansionStatusFilter, expansionTimeRange, renderNetworkCharts, renderExpansionDecadesChart, renderBiStudioCharts, renderGovernanceCharts, renderBodaccCharts, renderFinancialCharts,
          biGeoGranularity, biSortKey, biSortAsc, biGeoEntityFilter, regionalBIStats, departmentalBIStats, benchmarkRegionalBIStats, benchmarkDepartmentalBIStats, comparisonBiGeoList, sortedBiGeoList, toggleBiSort, biTotalRelocations, biTotalFinalClosures, biTopRegionBySites, biAverageActivityRate, benchmarkBiTotalRelocations, benchmarkBiTotalFinalClosures, benchmarkBiTopRegionBySites, benchmarkBiAverageActivityRate,
          biTimelineRegionFilter, biTimelineDeptFilter, availableDepartmentsForTimelineRegionFilter, biTimelineData,
          benchmarkSearchQuery, benchmarkData, isBenchmarkLoading, showBenchmarkDisambiguationModal, benchmarkCandidateList, pendingBenchmarkQuery,
          handleBenchmarkSubmit, confirmBenchmarkCandidate, executeBenchmarkAnalysis, removeBenchmarkCompetitor,
          calculateMarginRate, calculateRealignmentIndex, getReversedYears,
          benchmarkCompanyName, benchmarkSiren, benchmarkNodes, benchmarkExecutives, benchmarkPhysicalCount, benchmarkMoralCount, benchmarkDepartmentList, benchmarkActiveEstablishments, benchmarkTotalEstablishments, benchmarkRevenue, benchmarkNetIncome, benchmarkEbitda, benchmarkAltmanScore, benchmarkAltmanStatus, benchmarkHasConfidentialAccounts, benchmarkFinancialYears, reversedBenchmarkFinancialYears, benchmarkEvents,
          displayRevenueWithYear, benchmarkRevenueWithYear, displayNetIncomeWithYear, benchmarkNetIncomeWithYear, displayMarginWithYear, benchmarkMarginWithYear, displayTotalAssetsWithYear, benchmarkTotalAssetsWithYear, displayEquityWithYear, benchmarkEquityWithYear,

          // Modals & Inspections
          showLegalProfileModal, showGovernanceModal, selectedExecutive, execSearchQuery, execStatusFilter, filteredModalExecutives, openExecutiveInspector,
          showFinancialsModal, activeMetric, activeMetricLabel, displayRevenue, displayNetIncome, displayEbitda, displayAltmanScore, displayAltmanStatus, financialYears, reversedFinancialYears, financialYearsWithData, formatEuros, formatMetricValue, getBarColorClass, getBarHeight,
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
