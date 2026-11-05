import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  MapPin,
  Clock,
  Eye,
  X } from
'lucide-react';
import { Alert, AlertSeverity } from '../types/alerts';
interface RecentAlertsProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}
export function RecentAlerts({
  alerts,
  onMarkAsRead,
  onDismiss
}: RecentAlertsProps) {
  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          iconColor: 'text-rose-600',
          badgeColor: 'bg-rose-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          badgeColor: 'bg-amber-600'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-600'
        };
    }
  };
  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle
              className="w-12 h-12 text-slate-400"
              strokeWidth={1.5} />
            
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">
            Aucune alerte
          </h2>
          <p className="text-slate-500">Toutes vos alertes apparaîtront ici</p>
        </div>
      </div>);

  }
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Alertes récentes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {alerts.filter((a) => !a.isRead).length} alerte(s) non lue(s)
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
            Tout marquer comme lu
          </button>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: index * 0.05
                }}
                className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 ${!alert.isRead ? 'shadow-sm' : 'opacity-75'}`}>
                
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 ${config.badgeColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-slate-800">
                            {alert.vehicleName}
                          </h3>
                          {!alert.isRead &&
                          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          }
                        </div>
                        <p className="text-sm text-slate-700 mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{alert.timestamp}</span>
                          </div>
                          {alert.location &&
                          <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">
                                {alert.location}
                              </span>
                            </div>
                          }
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.isRead &&
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                          title="Marquer comme lu">
                          
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        }
                        <button
                          onClick={() => onDismiss(alert.id)}
                          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                          title="Supprimer">
                          
                          <X className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {alert.details && Object.keys(alert.details).length > 0 &&
                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(alert.details).map(([key, value]) =>
                        <div key={key}>
                              <span className="text-slate-500">{key}: </span>
                              <span className="text-slate-700 font-medium">
                                {String(value)}
                              </span>
                            </div>
                        )}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </motion.div>);

          })}
        </div>
      </div>
    </div>);

}