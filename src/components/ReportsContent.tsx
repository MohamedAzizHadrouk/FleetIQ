import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Fuel,
  AlertTriangle,
  FileText,
  Settings,
  Zap,
  MapPin,
  Thermometer,
  Users,
  Award,
  Hexagon,
  Lock,
  Weight,
  StopCircle,
  Save } from
'lucide-react';
interface ReportsContentProps {
  activeTab: string;
}
export function ReportsContent({ activeTab }: ReportsContentProps) {
  const [dateDebut, setDateDebut] = useState('01/01/2026');
  const [dateFin, setDateFin] = useState('31/01/2026');
  // Show overview when activeTab is 'rapports' (default)
  if (activeTab === 'rapports') {
    return <ReportsOverview />;
  }
  // Show specific report content based on activeTab
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{
          opacity: 0,
          x: 20
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        exit={{
          opacity: 0,
          x: -20
        }}
        transition={{
          duration: 0.3
        }}
        className="h-full">
        
        {/* Report header */}
        <div className="bg-white border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              {getReportTitle(activeTab)}
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                placeholder="Date début"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              
              <input
                type="text"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                placeholder="Date fin"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {renderReportContent(activeTab)}
      </motion.div>
    </AnimatePresence>);

}
function getReportTitle(activeTab: string): string {
  const titles: {
    [key: string]: string;
  } = {
    rapport_detaille: 'Rapport Détaillé',
    rapport_configurable: 'Rapport Configurable',
    rapport_statistique: 'Rapport Statistique',
    rapport_trajets: 'Rapport des Trajets',
    rapport_mensuel: 'Rapport Mensuel',
    rapport_vitesse: 'Rapport de Vitesse',
    rapport_exces_vitesse: 'Rapport des Excès de Vitesse',
    passage_emplacements: 'Passage par Emplacements',
    rapport_carburant: 'Rapport de Carburant',
    rapport_temperature: 'Rapport Capteur Température',
    rapport_moteur: 'Rapport de Moteur',
    missions_chauffeurs: 'Missions de Chauffeurs',
    qualite_conduite: 'Qualité de Conduite',
    stats_temps_travail: 'Statistiques Temps de Travail',
    rapport_geofences: 'Rapport des Géofences',
    rapport_smartlock: 'Rapport de Smartlock',
    indicateurs_dashboard: 'Indicateurs de Tableau de Bord',
    rapport_poids: 'Rapport de Poids'
  };
  return titles[activeTab] || 'Rapport';
}
function renderReportContent(activeTab: string) {
  switch (activeTab) {
    case 'rapport_detaille':
      return <RapportDetailleContent />;
    case 'rapport_configurable':
      return <RapportConfigurableContent />;
    case 'rapport_statistique':
      return <RapportStatistiqueContent />;
    case 'rapport_trajets':
      return <RapportTrajetsContent />;
    case 'rapport_mensuel':
      return <RapportMensuelContent />;
    case 'rapport_vitesse':
      return <RapportVitesseContent />;
    case 'rapport_exces_vitesse':
      return <RapportExcesVitesseContent />;
    case 'passage_emplacements':
      return <PassageEmplacementsContent />;
    case 'rapport_carburant':
      return <RapportCarburantContent />;
    case 'rapport_temperature':
      return <RapportTemperatureContent />;
    case 'rapport_moteur':
      return <RapportMoteurContent />;
    case 'missions_chauffeurs':
      return <MissionsChauffeursContent />;
    case 'qualite_conduite':
      return <QualiteConduiteContent />;
    case 'stats_temps_travail':
      return <StatsTempsContent />;
    case 'rapport_geofences':
      return <RapportGeofencesContent />;
    case 'rapport_smartlock':
      return <RapportSmartlockContent />;
    case 'indicateurs_dashboard':
      return <IndicateursDashboardContent />;
    case 'rapport_poids':
      return <RapportPoidsContent />;
    default:
      return <ReportsOverview />;
  }
}
// Overview when no specific report is selected
function ReportsOverview() {
  const reportExamples = [
  {
    id: 'detailed',
    title: 'Rapport Détaillé',
    description: 'Vue complète de toutes les activités des véhicules',
    icon: FileText,
    stats: [
    {
      label: 'Total trajets',
      value: '1,247',
      trend: '+12%'
    },
    {
      label: 'Distance totale',
      value: '45,892 km',
      trend: '+8%'
    },
    {
      label: 'Temps de conduite',
      value: '892h',
      trend: '+5%'
    },
    {
      label: 'Consommation',
      value: '6,234 L',
      trend: '-3%'
    }]

  },
  {
    id: 'speed',
    title: 'Rapport de Vitesse',
    description: 'Analyse des vitesses et excès de vitesse',
    icon: Zap,
    stats: [
    {
      label: 'Vitesse moyenne',
      value: '65 km/h',
      trend: '+2%'
    },
    {
      label: 'Excès détectés',
      value: '23',
      trend: '-15%'
    },
    {
      label: 'Vitesse max',
      value: '142 km/h',
      trend: '+5%'
    },
    {
      label: 'Conformité',
      value: '94%',
      trend: '+8%'
    }]

  },
  {
    id: 'fuel',
    title: 'Rapport de Carburant',
    description: 'Consommation et coûts de carburant',
    icon: Fuel,
    stats: [
    {
      label: 'Consommation totale',
      value: '6,234 L',
      trend: '-3%'
    },
    {
      label: 'Coût total',
      value: '9,845 €',
      trend: '+2%'
    },
    {
      label: 'Moyenne/100km',
      value: '8.2 L',
      trend: '-5%'
    },
    {
      label: 'Économies',
      value: '1,234 €',
      trend: '+18%'
    }]

  }];

  const recentReports = [
  {
    name: 'Rapport mensuel - Novembre 2024',
    date: '01/12/2024',
    type: 'Mensuel',
    size: '2.4 MB'
  },
  {
    name: 'Rapport de vitesse - Semaine 48',
    date: '28/11/2024',
    type: 'Vitesse',
    size: '856 KB'
  },
  {
    name: 'Rapport détaillé - Q4 2024',
    date: '25/11/2024',
    type: 'Détaillé',
    size: '4.1 MB'
  },
  {
    name: 'Rapport carburant - Novembre',
    date: '20/11/2024',
    type: 'Carburant',
    size: '1.2 MB'
  }];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Rapports et Analyses
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Consultez et générez des rapports détaillés
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span>Générer un rapport</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">1,247</p>
            <p className="text-xs text-slate-500 mt-1">Trajets ce mois</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">892h</p>
            <p className="text-xs text-slate-500 mt-1">Temps de conduite</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Fuel className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                -3%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">6,234 L</p>
            <p className="text-xs text-slate-500 mt-1">Consommation</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                -15%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">23</p>
            <p className="text-xs text-slate-500 mt-1">Excès de vitesse</p>
          </div>
        </div>

        {/* Report Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {reportExamples.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {report.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {report.description}
                    </p>
                  </div>
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>

                <div className="space-y-3">
                  {report.stats.map((stat, idx) =>
                  <div
                    key={idx}
                    className="flex items-center justify-between">
                    
                      <span className="text-sm text-slate-600">
                        {stat.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {stat.value}
                        </span>
                        <span
                        className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                        
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">
                  Voir le rapport
                </button>
              </div>);

          })}
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Rapports récents
              </h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                  <Calendar className="w-4 h-4" />
                  <span>Période</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filtrer</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nom du rapport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((report, idx) =>
                <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {report.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {report.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {report.size}
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>);

}
// Individual Report Content Components
function RapportDetailleContent() {
  const [showReport, setShowReport] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    dateDebut: '07/01/2026 00:00:00',
    dateFin: '07/01/2026 23:59:59',
    emplacement: 'Tout les emplacements (Général)',
    niveauCarburant: '0',
    vitesse: '70',
    rpm: '0',
    dureeStop: '0',
    choixRapport: 'Normale'
  });
  const handleGenerate = () => {
    setShowReport(true);
  };
  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  if (showReport) {
    const vehiclePositions = [
    {
      status: 'Stop',
      date: '07/01/2026 00:00:00',
      vitesse: 0,
      distance: 0,
      adresse: 'maison yassine'
    },
    {
      status: 'Run',
      date: '07/01/2026 02:16:43',
      vitesse: 0,
      distance: 0,
      adresse: 'maison yassine'
    },
    {
      status: 'Run',
      date: '07/01/2026 02:17:01',
      vitesse: 0,
      distance: 0,
      adresse: 'maison yassine'
    },
    {
      status: 'Run',
      date: '07/01/2026 06:15:59',
      vitesse: 0,
      distance: 0,
      adresse: 'maison yassine'
    },
    {
      status: 'Run',
      date: '07/01/2026 06:16:24',
      vitesse: 0,
      distance: 0,
      adresse: 'maison yassine'
    }];

    const stopCirculationData = [
    {
      status: 'Stop',
      date: '07/01/2026 00:00:00',
      adresse: 'maison yassine',
      duree: '07.02.51',
      vitesse: 0,
      distance: 0,
      latitude: 36.820629,
      longitude: 10.067949
    },
    {
      status: 'Circulation',
      date: '07/01/2026 07:02:51',
      adresse: 'maison yassine',
      duree: '00.21.55',
      vitesse: 4,
      distance: 0.002,
      latitude: 36.820643,
      longitude: 10.067929
    },
    {
      status: 'Stop',
      date: '07/01/2026 07:24:46',
      adresse: 'Arôme Resto Café Hraïria Tunis Tunisia',
      duree: '00.00.10',
      vitesse: 0,
      distance: 14.886,
      latitude: 36.812254,
      longitude: 10.106119
    },
    {
      status: 'Circulation',
      date: '07/01/2026 07:24:56',
      adresse: 'Arôme Resto Café Hraïria Tunis Tunisia',
      duree: '00.10.52',
      vitesse: 11,
      distance: 14.89,
      latitude: 36.812234,
      longitude: 10.106152
    },
    {
      status: 'Stop',
      date: '07/01/2026 07:35:48',
      adresse: '1095 Tunis, Tunisia',
      duree: '00.02.11',
      vitesse: 0,
      distance: 23.142,
      latitude: 36.78315,
      longitude: 10.101985
    }];

    const stopPositions = [
    {
      status: 'Stop',
      tempsDebut: '07/01/2026 00:00:00',
      tempsFin: '07/01/2026 07:02',
      vitesse: 0,
      duree: '07.02.51',
      distance: 0,
      adresse: 'maison yassine',
      latitude: 36.820629,
      longitude: 10.067949
    },
    {
      status: 'Stop',
      tempsDebut: '07/01/2026 07:24:46',
      tempsFin: '07/01/2026 07:24',
      vitesse: 0,
      duree: '00.00.10',
      distance: 14.886,
      adresse: 'Arôme Resto Café Hraïria Tunis Tunisia',
      latitude: 36.812254,
      longitude: 10.106119
    },
    {
      status: 'Stop',
      tempsDebut: '07/01/2026 07:35:48',
      tempsFin: '07/01/2026 07:37',
      vitesse: 0,
      duree: '00.02.11',
      distance: 23.142,
      adresse: '1095 Tunis, Tunisia',
      latitude: 36.78315,
      longitude: 10.101985
    },
    {
      status: 'Stop',
      tempsDebut: '07/01/2026 07:41:00',
      tempsFin: '07/01/2026 07:41',
      vitesse: 0,
      duree: '00.00.05',
      distance: 24.815,
      adresse: 'Ouredoo, الطريق الوطنية رقم 3 تونس بنزرت',
      latitude: 36.782275,
      longitude: 10.110433
    }];

    return (
      <div className="h-full overflow-y-auto bg-slate-50 p-4">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Rapport Détaillé Généré
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Période: {formData.dateDebut} - {formData.dateFin}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReport(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-white border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                
                Retour
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Exporter PDF
              </button>
            </div>
          </div>

          {/* Stats Cards with Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Vitesse moyenne */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-5xl font-bold text-slate-800 mb-2">40</div>
              <div className="text-sm text-slate-600 mb-4">Vitesse moyenne</div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: '65%'
                  }}>
                </div>
              </div>
              <div className="text-5xl font-bold text-slate-800 mt-6 mb-2">
                61
              </div>
              <div className="text-sm text-slate-600 mb-4">Vitesse maximal</div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: '100%'
                  }}>
                </div>
              </div>
            </div>

            {/* Distance parcourue */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-5xl font-bold text-slate-800 mb-2">
                50,423
              </div>
              <div className="text-sm text-slate-600 mb-4">
                Distance parcourus
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{
                    width: '80%'
                  }}>
                </div>
              </div>
              <div className="text-5xl font-bold text-slate-800 mt-6 mb-2">
                18
              </div>
              <div className="text-sm text-slate-600 mb-4">Nombre d'arrêts</div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{
                    width: '45%'
                  }}>
                </div>
              </div>
            </div>

            {/* Excès de vitesse */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-7xl font-bold text-slate-800 mb-2">0</div>
              <div className="text-sm text-slate-600 mb-4">
                Nbr alertes d'excès de vitesse
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-auto">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: '0%'
                  }}>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-semibold text-slate-800 mb-6">
                Graphe de stop circulation
              </h3>
              <div className="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12" />
                  
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="12"
                    strokeDasharray="188.4 62.8"
                    strokeLinecap="round" />
                  
                </svg>
                <div className="absolute top-1/2 right-0 transform translate-x-4 -translate-y-1/2 text-xs text-slate-600">
                  Run
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-xs text-slate-600">
                  Stop
                </div>
              </div>
            </div>
          </div>

          {/* Positions et informations des véhicules */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Positions et informations des véhicules
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Vitesse
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Distance parcourus
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Adresse proche
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehiclePositions.map((row, idx) =>
                  <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {row.status === 'Stop' ?
                      <span className="inline-flex px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded">
                            Stop
                          </span> :

                      <span className="inline-block w-3 h-3 bg-amber-500 rounded-sm"></span>
                      }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.vitesse}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.distance}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        {row.adresse}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select className="border border-slate-300 rounded px-2 py-1">
                  <option>5</option>
                  <option>10</option>
                  <option>20</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>1 - 5 of 318</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-slate-100 rounded">
                    &lt;
                  </button>
                  <button className="p-1 hover:bg-slate-100 rounded">
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Positions de stop/circulation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Positions de stop/circulation
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Adresse proche
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Vitesse
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Distance parcourus
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Latitude
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Longitude
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stopCirculationData.map((row, idx) =>
                  <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {row.status === 'Stop' ?
                      <span className="inline-flex px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded">
                            Stop
                          </span> :

                      <span className="inline-flex px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded">
                            Circulation
                          </span>
                      }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.adresse}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        {row.duree}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.vitesse}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.distance}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.latitude}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.longitude}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select className="border border-slate-300 rounded px-2 py-1">
                  <option>5</option>
                  <option>10</option>
                  <option>20</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>1 - 5 of 35</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-slate-100 rounded">
                    &lt;
                  </button>
                  <button className="p-1 hover:bg-slate-100 rounded">
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Positions de stop de la véhicule */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Positions de stop de la véhicule
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Temps de début
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Temps de fin
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Vitesse
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Distance parcourus
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Adresse proche
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Latitude
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Longitude
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stopPositions.map((row, idx) =>
                  <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded">
                          Stop
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.tempsDebut}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.tempsFin}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.vitesse}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.duree}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.distance}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.adresse}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.latitude}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.longitude}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>);

  }
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Rapport Détaillé
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Configurez les paramètres du rapport
              </p>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Véhicule */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Véhicule <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vehicle}
              onChange={(e) => updateFormField('vehicle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sélectionner un véhicule" />
            
          </div>

          {/* Date début */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date début <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.dateDebut}
              onChange={(e) => updateFormField('dateDebut', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>

          {/* Date fin */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date fin <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.dateFin}
              onChange={(e) => updateFormField('dateFin', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>

          {/* Visibilité Emplacement */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                Visibilité Emplacement
              </h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Visibilité Emplacement <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.emplacement}
              onChange={(e) => updateFormField('emplacement', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              
              <option>Tout les emplacements (Général)</option>
              <option>Emplacements spécifiques</option>
            </select>
          </div>

          {/* Consommation théorique du carburant */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Fuel className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                Consommation théorique du carburant
              </h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Niveau de carburant <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.niveauCarburant}
              onChange={(e) =>
              updateFormField('niveauCarburant', e.target.value)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>

          {/* Indiquer les excès de vitesse */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                Indiquer les excès de vitesse &gt;= à
              </h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Vitesse <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.vitesse}
              onChange={(e) => updateFormField('vitesse', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>

          {/* Indiquer les Rpm */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                Indiquer les Rpm &gt;=à
              </h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              RPM <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.rpm}
              onChange={(e) => updateFormField('rpm', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>

          {/* Afficher seulement les stops */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <StopCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-semibold text-slate-800">
                Afficher seulement les stops &gt;=
              </h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Durée de stop <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.dureeStop}
              onChange={(e) => updateFormField('dureeStop', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>

          {/* Choix de rapport */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                Choix de rapport
              </h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Choix de rapport
            </label>
            <select
              value={formData.choixRapport}
              onChange={(e) => updateFormField('choixRapport', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              
              <option>Normale</option>
              <option>Détaillé</option>
              <option>Simplifié</option>
            </select>
          </div>
        </div>

        {/* Générer Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleGenerate}
            className="px-8 py-3 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg text-base font-semibold transition-colors shadow-sm">
            
            Générer
          </button>
        </div>
      </div>
    </div>);

}
function RapportConfigurableContent() {
  return (
    <ReportTemplate
      title="Rapport Configurable"
      description="Créez des rapports personnalisés selon vos besoins"
      icon={Settings}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Configuration du rapport
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Période
            </label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option>Dernière semaine</option>
              <option>Dernier mois</option>
              <option>Dernier trimestre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Métriques à inclure
            </label>
            <div className="space-y-2">
              {[
              'Distance parcourue',
              'Temps de conduite',
              'Consommation carburant',
              'Vitesse moyenne'].
              map((metric) =>
              <label key={metric} className="flex items-center gap-2">
                  <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  defaultChecked />
                
                  <span className="text-sm text-slate-700">{metric}</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReportTemplate>);

}
function RapportStatistiqueContent() {
  return (
    <ReportTemplate
      title="Rapport Statistique"
      description="Analyses statistiques avancées de votre flotte"
      icon={BarChart3}>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Moyenne trajets/jour"
          value="42"
          trend="+8%"
          icon={Activity} />
        
        <StatCard
          label="Distance moyenne"
          value="156 km"
          trend="+5%"
          icon={MapPin} />
        
        <StatCard
          label="Efficacité carburant"
          value="92%"
          trend="+3%"
          icon={Fuel} />
        
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Tendances statistiques
        </h3>
        <p className="text-sm text-slate-500">
          Graphiques et analyses statistiques...
        </p>
      </div>
    </ReportTemplate>);

}
function RapportTrajetsContent() {
  return (
    <ReportTemplate
      title="Rapport des Trajets"
      description="Historique détaillé de tous les trajets effectués"
      icon={MapPin}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Liste des trajets
        </h3>
        <p className="text-sm text-slate-500">
          Tableau des trajets avec détails (départ, arrivée, distance, durée)...
        </p>
      </div>
    </ReportTemplate>);

}
function RapportMensuelContent() {
  return (
    <ReportTemplate
      title="Rapport Mensuel"
      description="Synthèse mensuelle des activités de la flotte"
      icon={Calendar}>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Trajets du mois"
          value="1,247"
          trend="+12%"
          icon={Activity} />
        
        <StatCard
          label="Distance du mois"
          value="45,892 km"
          trend="+8%"
          icon={MapPin} />
        
        <StatCard
          label="Heures de conduite"
          value="892h"
          trend="+5%"
          icon={Clock} />
        
        <StatCard
          label="Coût carburant"
          value="9,845 €"
          trend="+2%"
          icon={Fuel} />
        
      </div>
    </ReportTemplate>);

}
function RapportVitesseContent() {
  return (
    <ReportTemplate
      title="Rapport de Vitesse"
      description="Analyse des vitesses moyennes et maximales"
      icon={Zap}>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Vitesse moyenne"
          value="65 km/h"
          trend="+2%"
          icon={Zap} />
        
        <StatCard label="Vitesse max" value="142 km/h" trend="+5%" icon={Zap} />
        <StatCard label="Conformité" value="94%" trend="+8%" icon={Activity} />
        <StatCard
          label="Excès détectés"
          value="23"
          trend="-15%"
          icon={AlertTriangle}
          trendDown />
        
      </div>
    </ReportTemplate>);

}
function RapportExcesVitesseContent() {
  return (
    <ReportTemplate
      title="Rapport des Excès de Vitesse"
      description="Détail de tous les excès de vitesse détectés"
      icon={AlertTriangle}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Excès de vitesse détectés
        </h3>
        <p className="text-sm text-slate-500">
          Liste des infractions avec date, heure, véhicule et vitesse...
        </p>
      </div>
    </ReportTemplate>);

}
function PassageEmplacementsContent() {
  return (
    <ReportTemplate
      title="Passage par Emplacements"
      description="Suivi des passages par zones géographiques"
      icon={MapPin}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Emplacements visités
        </h3>
        <p className="text-sm text-slate-500">
          Carte et liste des emplacements avec fréquence de passage...
        </p>
      </div>
    </ReportTemplate>);

}
function RapportCarburantContent() {
  return (
    <ReportTemplate
      title="Rapport de Carburant"
      description="Consommation et coûts de carburant détaillés"
      icon={Fuel}>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Consommation totale"
          value="6,234 L"
          trend="-3%"
          icon={Fuel}
          trendDown />
        
        <StatCard label="Coût total" value="9,845 €" trend="+2%" icon={Fuel} />
        <StatCard
          label="Moyenne/100km"
          value="8.2 L"
          trend="-5%"
          icon={Fuel}
          trendDown />
        
        <StatCard
          label="Économies"
          value="1,234 €"
          trend="+18%"
          icon={TrendingDown} />
        
      </div>
    </ReportTemplate>);

}
function RapportTemperatureContent() {
  return (
    <ReportTemplate
      title="Rapport Capteur Température"
      description="Suivi des températures des véhicules"
      icon={Thermometer}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Températures enregistrées
        </h3>
        <p className="text-sm text-slate-500">
          Graphiques de température par véhicule...
        </p>
      </div>
    </ReportTemplate>);

}
function RapportMoteurContent() {
  return (
    <ReportTemplate
      title="Rapport de Moteur"
      description="État et performances des moteurs"
      icon={Settings}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          État des moteurs
        </h3>
        <p className="text-sm text-slate-500">
          Heures de fonctionnement, diagnostics, alertes...
        </p>
      </div>
    </ReportTemplate>);

}
function MissionsChauffeursContent() {
  return (
    <ReportTemplate
      title="Missions de Chauffeurs"
      description="Suivi des missions et performances des chauffeurs"
      icon={Users}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Missions en cours et terminées
        </h3>
        <p className="text-sm text-slate-500">
          Liste des missions par chauffeur...
        </p>
      </div>
    </ReportTemplate>);

}
function QualiteConduiteContent() {
  return (
    <ReportTemplate
      title="Qualité de Conduite"
      description="Évaluation du comportement de conduite"
      icon={Award}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Scores de conduite
        </h3>
        <p className="text-sm text-slate-500">
          Évaluation par chauffeur (accélération, freinage, virages)...
        </p>
      </div>
    </ReportTemplate>);

}
function StatsTempsContent() {
  return (
    <ReportTemplate
      title="Statistiques Temps de Travail"
      description="Analyse du temps de travail des chauffeurs"
      icon={Clock}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Temps de travail
        </h3>
        <p className="text-sm text-slate-500">
          Heures travaillées, pauses, conformité réglementaire...
        </p>
      </div>
    </ReportTemplate>);

}
function RapportGeofencesContent() {
  return (
    <ReportTemplate
      title="Rapport des Géofences"
      description="Suivi des entrées/sorties de zones"
      icon={Hexagon}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Activité géofences
        </h3>
        <p className="text-sm text-slate-500">
          Entrées et sorties des zones définies...
        </p>
      </div>
    </ReportTemplate>);

}
function RapportSmartlockContent() {
  return (
    <ReportTemplate
      title="Rapport de Smartlock"
      description="Historique des verrouillages/déverrouillages"
      icon={Lock}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Événements smartlock
        </h3>
        <p className="text-sm text-slate-500">
          Historique des actions de verrouillage...
        </p>
      </div>
    </ReportTemplate>);

}
function IndicateursDashboardContent() {
  return (
    <ReportTemplate
      title="Indicateurs de Tableau de Bord"
      description="KPIs et métriques clés"
      icon={Activity}>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Taux d'utilisation"
          value="87%"
          trend="+5%"
          icon={Activity} />
        
        <StatCard
          label="Disponibilité"
          value="94%"
          trend="+2%"
          icon={Activity} />
        
        <StatCard label="Efficacité" value="91%" trend="+3%" icon={Activity} />
        <StatCard
          label="Satisfaction"
          value="4.6/5"
          trend="+0.2"
          icon={Award} />
        
      </div>
    </ReportTemplate>);

}
function RapportPoidsContent() {
  return (
    <ReportTemplate
      title="Rapport de Poids"
      description="Suivi des charges et poids transportés"
      icon={Weight}>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Charges transportées
        </h3>
        <p className="text-sm text-slate-500">
          Historique des poids et conformité...
        </p>
      </div>
    </ReportTemplate>);

}
// Reusable Components
function ReportTemplate({ title, description, icon: Icon, children }: any) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-white border border-slate-200 rounded-lg text-sm font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>);

}
function StatCard({ label, value, trend, icon: Icon, trendDown = false }: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <span
          className={`text-xs font-medium flex items-center gap-1 ${trendDown ? 'text-emerald-600' : 'text-emerald-600'}`}>
          
          {trendDown ?
          <TrendingDown className="w-3 h-3" /> :

          <TrendingUp className="w-3 h-3" />
          }
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>);

}