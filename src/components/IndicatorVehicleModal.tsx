import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Search, ChevronRight } from 'lucide-react';
import { Vehicle } from '../types';
import { ModalHeader } from '@/components/ui/modal-header';
interface IndicatorVehicle {
  vehicleId: string;
  vehicleName: string;
  driver: string;
  location: string;
  coordinates: [number, number];
  value?: string | number;
  details?: string;
}
interface IndicatorVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  vehicles: IndicatorVehicle[];
  onNavigateToMap: (vehicle: IndicatorVehicle) => void;
  valueLabel?: string;
}
export function IndicatorVehicleModal({
  isOpen,
  onClose,
  title,
  description,
  vehicles,
  onNavigateToMap,
  valueLabel = 'Valeur'
}: IndicatorVehicleModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredVehicles = vehicles.filter(
    (v) =>
    v.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        exit={{
          opacity: 0
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.9,
            y: 20
          }}
          animate={{
            scale: 1,
            y: 0
          }}
          exit={{
            scale: 0.9,
            y: 20
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          
          <ModalHeader title={title} subtitle={description} onClose={onClose}>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full text-primary-foreground">
                {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}
              </span>
              {valueLabel && (
                <span className="text-xs text-primary-foreground/80">
                  Cliquez sur un véhicule pour voir sa position
                </span>
              )}
            </div>
          </ModalHeader>

          {/* Search Bar */}
          <div className="py-4 px-6 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un véhicule, conducteur ou lieu..."
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            {filteredVehicles.length === 0 ?
            <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">
                  Aucun véhicule trouvé
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Essayez de modifier votre recherche
                </p>
              </div> :

            <div className="grid grid-cols-1 gap-3">
                {filteredVehicles.map((vehicle, index) =>
              <motion.button
                key={vehicle.vehicleId}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: index * 0.03
                }}
                onClick={() => onNavigateToMap(vehicle)}
                className="group flex items-center justify-between p-4 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-xl transition-all cursor-pointer">
                
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Vehicle Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Navigation className="w-6 h-6 text-white" />
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {vehicle.vehicleName}
                          </h3>
                          {vehicle.value &&
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                              {vehicle.value}
                            </span>
                      }
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">Conducteur:</span>{' '}
                          {vehicle.driver}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{vehicle.location}</span>
                        </div>
                        {vehicle.details &&
                    <p className="text-xs text-slate-500 mt-1 italic">
                            {vehicle.details}
                          </p>
                    }
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600">
                        Voir sur carte
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
              )}
              </div>
            }
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {filteredVehicles.length} résultat
                {filteredVehicles.length > 1 ? 's' : ''} affiché
                {filteredVehicles.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}