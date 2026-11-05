import React, { Children } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Activity,
  AlertCircle,
  Wrench,
  Gauge,
  Route,
  Fuel,
  FileText,
  TrendingUp,
  TrendingDown } from
'lucide-react';
import { Vehicle } from '../types';
interface GlobalStatisticsSectionProps {
  vehicles: Vehicle[];
  alertsCount: number;
  criticalAlertsCount: number;
  documentsCount: number;
  urgentDocumentsCount: number;
}
export function GlobalStatisticsSection({
  vehicles,
  alertsCount,
  criticalAlertsCount,
  documentsCount,
  urgentDocumentsCount
}: GlobalStatisticsSectionProps) {
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const idleVehicles = vehicles.filter((v) => v.status === 'idle').length;
  const offlineVehicles = vehicles.filter((v) => v.status === 'offline').length;
  const utilizationRate =
  totalVehicles > 0 ? Math.round(activeVehicles / totalVehicles * 100) : 0;
  const activeSpeeds = vehicles.
  filter((v) => v.status === 'active').
  map((v) => v.speed);
  const avgSpeed =
  activeSpeeds.length > 0 ?
  Math.round(
    activeSpeeds.reduce((a, b) => a + b, 0) / activeSpeeds.length
  ) :
  0;
  const stats = [
  {
    title: 'Total Flotte',
    value: totalVehicles.toString(),
    subtext: `${activeVehicles} actifs • ${idleVehicles} inactifs • ${offlineVehicles} hors ligne`,
    icon: Truck,
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  {
    title: "Taux d'Utilisation",
    value: `${utilizationRate}%`,
    subtext:
    utilizationRate > 50 ?
    'Performance optimale' :
    'Sous-utilisation détectée',
    icon: Activity,
    color:
    utilizationRate > 50 ?
    'from-emerald-500 to-emerald-600' :
    'from-amber-500 to-amber-600',
    iconColor: utilizationRate > 50 ? 'text-emerald-500' : 'text-amber-500',
    bgColor: utilizationRate > 50 ? 'bg-emerald-50' : 'bg-amber-50',
    trend: utilizationRate > 50 ? '+5.2%' : '-2.1%',
    trendUp: utilizationRate > 50
  },
  {
    title: 'Alertes Actives',
    value: alertsCount.toString(),
    subtext: `${criticalAlertsCount} critique(s) nécessitant attention`,
    icon: AlertCircle,
    color:
    criticalAlertsCount > 0 ?
    'from-rose-500 to-rose-600' :
    'from-emerald-500 to-emerald-600',
    iconColor: criticalAlertsCount > 0 ? 'text-rose-500' : 'text-emerald-500',
    bgColor: criticalAlertsCount > 0 ? 'bg-rose-50' : 'bg-emerald-50',
    trend: '+2',
    trendUp: false
  },
  {
    title: 'Vitesse Moyenne',
    value: `${avgSpeed} km/h`,
    subtext: 'Sur les véhicules en mouvement',
    icon: Gauge,
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    trend: '-1.5 km/h',
    trendUp: true
  },
  {
    title: 'Distance Parcourue',
    value: '1 245 km',
    subtext: "Aujourd'hui",
    icon: Route,
    color: 'from-cyan-500 to-cyan-600',
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    trend: '+12%',
    trendUp: true
  },
  {
    title: 'Consommation Moy.',
    value: '12.5 L/100',
    subtext: 'Moyenne de la flotte',
    icon: Fuel,
    color: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    trend: '-0.3 L',
    trendUp: true
  },
  {
    title: 'Maintenance',
    value: Math.ceil(totalVehicles * 0.1).toString(),
    subtext: 'Véhicules nécessitant une révision',
    icon: Wrench,
    color: 'from-amber-500 to-amber-600',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  {
    title: 'Documents',
    value: documentsCount.toString(),
    subtext: `${urgentDocumentsCount} urgent(s) à traiter`,
    icon: FileText,
    color:
    urgentDocumentsCount > 0 ?
    'from-rose-500 to-rose-600' :
    'from-blue-500 to-blue-600',
    iconColor: urgentDocumentsCount > 0 ? 'text-rose-500' : 'text-blue-500',
    bgColor: urgentDocumentsCount > 0 ? 'bg-rose-50' : 'bg-blue-50'
  }];

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          Vue d'ensemble de la flotte
        </h2>
        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
          Mise à jour à l'instant
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {stats.map((stat, index) =>
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group">
          
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                {stat.trend &&
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                
                    {stat.trendUp ?
                <TrendingUp className="w-3 h-3" /> :

                <TrendingDown className="w-3 h-3" />
                }
                    {stat.trend}
                  </div>
              }
              </div>

              <div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-xs text-slate-500">{stat.subtext}</p>
              </div>
            </div>
            <div
            className={`h-1 w-full bg-gradient-to-r ${stat.color} opacity-75 group-hover:opacity-100 transition-opacity`} />
          
          </motion.div>
        )}
      </motion.div>
    </div>);

}