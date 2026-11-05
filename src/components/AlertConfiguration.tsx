import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';
import { AlertType, VehicleAlertConfig } from '../types/alerts';
import { Search, Save, Settings, Bell, Mail, MessageSquare } from 'lucide-react';
interface AlertConfigurationProps {
  vehicles: Vehicle[];
  alertConfigs: Map<string, VehicleAlertConfig>;
  onSaveConfig: (vehicleId: string, config: VehicleAlertConfig) => void;
}
export function AlertConfiguration({
  vehicles,
  alertConfigs,
  onSaveConfig
}: AlertConfigurationProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    vehicles[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const alertTypes: Array<{
    id: AlertType;
    label: string;
  }> = [
  {
    id: 'speeding',
    label: 'Dépassement de vitesse'
  },
  {
    id: 'geofence',
    label: 'Tous les geofences'
  },
  {
    id: 'country_border',
    label: 'Sortie/entrée du pays'
  },
  {
    id: 'route',
    label: "Entrée/Sortie de l'itinéraire"
  },
  {
    id: 'towing',
    label: 'Remorquage'
  },
  {
    id: 'battery_disconnected',
    label: 'Batterie débranchée'
  },
  {
    id: 'message_received',
    label: 'Message reçue'
  },
  {
    id: 'temperature',
    label: 'Alerte de température'
  },
  {
    id: 'fuel',
    label: 'Alerte de carburant'
  },
  {
    id: 'aggressive_driving',
    label: 'Conduite agressive'
  },
  {
    id: 'sos',
    label: 'SOS'
  },
  {
    id: 'taxi_status',
    label: 'Taxi libre/occupé'
  },
  {
    id: 'ignition',
    label: 'Contact On/Off'
  },
  {
    id: 'trunk',
    label: 'Malle ouverte/fermée'
  },
  {
    id: 'hood',
    label: 'Capot ouvert/fermé'
  },
  {
    id: 'door',
    label: 'Porte ouverte/fermée'
  },
  {
    id: 'maintenance',
    label: 'Alerte de maintenance'
  },
  {
    id: 'stop',
    label: 'Stop'
  },
  {
    id: 'gps_signal',
    label: 'Signal GPS détecté/perdu'
  },
  {
    id: 'long_stop',
    label: 'Stop de longue durée'
  },
  {
    id: 'driving_time_exceeded',
    label: 'Dépassement temps de conduite'
  },
  {
    id: 'driver_identification',
    label: 'Identification du conducteur'
  },
  {
    id: 'fleet_alert',
    label: 'Alerte de parc'
  },
  {
    id: 'photo_received',
    label: 'Photo reçue'
  },
  {
    id: 'removal',
    label: 'Enlèvement'
  },
  {
    id: 'unknown',
    label: 'Inconnu'
  }];

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const currentConfig = selectedVehicleId ?
  alertConfigs.get(selectedVehicleId) :
  null;
  const [localConfig, setLocalConfig] = useState<VehicleAlertConfig>(
    currentConfig || {
      vehicleId: selectedVehicleId || '',
      enabledAlerts: new Set(),
      alertSettings: {}
    }
  );
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const config = alertConfigs.get(vehicleId);
    setLocalConfig(
      config || {
        vehicleId,
        enabledAlerts: new Set(),
        alertSettings: {}
      }
    );
    setHasChanges(false);
  };
  const toggleAlert = (alertType: AlertType) => {
    const newEnabledAlerts = new Set(localConfig.enabledAlerts);
    if (newEnabledAlerts.has(alertType)) {
      newEnabledAlerts.delete(alertType);
    } else {
      newEnabledAlerts.add(alertType);
    }
    setLocalConfig({
      ...localConfig,
      enabledAlerts: newEnabledAlerts,
      alertSettings: {
        ...localConfig.alertSettings,
        [alertType]: {
          ...localConfig.alertSettings[alertType],
          enabled: newEnabledAlerts.has(alertType)
        }
      }
    });
    setHasChanges(true);
  };
  const toggleNotification = (
  alertType: AlertType,
  notificationType: 'email' | 'sms') =>
  {
    const field = notificationType === 'email' ? 'notifyEmail' : 'notifySMS';
    setLocalConfig({
      ...localConfig,
      alertSettings: {
        ...localConfig.alertSettings,
        [alertType]: {
          ...localConfig.alertSettings[alertType],
          enabled: localConfig.enabledAlerts.has(alertType),
          [field]: !localConfig.alertSettings[alertType]?.[field]
        }
      }
    });
    setHasChanges(true);
  };
  const handleSave = () => {
    if (selectedVehicleId) {
      onSaveConfig(selectedVehicleId, localConfig);
      setHasChanges(false);
    }
  };
  const filteredVehicles = vehicles.filter((v) =>
  v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="h-full flex">
      {/* Vehicle List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Sélectionner un véhicule
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredVehicles.map((vehicle) => {
            const config = alertConfigs.get(vehicle.id);
            const enabledCount = config?.enabledAlerts.size || 0;
            return (
              <button
                key={vehicle.id}
                onClick={() => handleVehicleSelect(vehicle.id)}
                className={`w-full px-4 py-3 border-b border-slate-100 text-left transition-colors ${selectedVehicleId === vehicle.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'}`}>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {vehicle.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {vehicle.driver}
                    </p>
                  </div>
                  {enabledCount > 0 &&
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {enabledCount}
                    </span>
                  }
                </div>
              </button>);

          })}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedVehicle ?
        <>
            <div className="bg-white border-b border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Configuration des alertes
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedVehicle.name} - {selectedVehicle.driver}
                  </p>
                </div>
                {hasChanges &&
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
              }
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="w-full space-y-3">
                {alertTypes.map((alertType, index) => {
                const isEnabled = localConfig.enabledAlerts.has(alertType.id);
                const settings = localConfig.alertSettings[alertType.id];
                return (
                  <motion.div
                    key={alertType.id}
                    initial={{
                      opacity: 0,
                      y: 20
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: index * 0.02
                    }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                          onClick={() => toggleAlert(alertType.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          
                            <motion.div
                            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                            animate={{
                              x: isEnabled ? 24 : 0
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30
                            }} />
                          
                          </button>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {alertType.label}
                            </p>
                          </div>
                        </div>

                        {isEnabled &&
                      <div className="flex items-center gap-2">
                            <button
                          onClick={() =>
                          toggleNotification(alertType.id, 'email')
                          }
                          className={`p-2 rounded-lg transition-colors ${settings?.notifyEmail ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          title="Notification par email">
                          
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                          onClick={() =>
                          toggleNotification(alertType.id, 'sms')
                          }
                          className={`p-2 rounded-lg transition-colors ${settings?.notifySMS ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          title="Notification par SMS">
                          
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                      }
                      </div>
                    </motion.div>);

              })}
              </div>
            </div>
          </> :

        <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Settings
                className="w-12 h-12 text-slate-400"
                strokeWidth={1.5} />
              
              </div>
              <h2 className="text-2xl font-semibold text-slate-700 mb-2">
                Sélectionnez un véhicule
              </h2>
              <p className="text-slate-500">
                Choisissez un véhicule pour configurer ses alertes
              </p>
            </div>
          </div>
        }
      </div>
    </div>);

}