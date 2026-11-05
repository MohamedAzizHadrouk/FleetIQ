import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Image as ImageIcon } from 'lucide-react';
import { ModalHeader } from '@/components/ui/modal-header';
import {
  emptyFleetVehicle,
  getVehicleIconOption,
  VEHICLE_ICON_OPTIONS,
  type FleetVehicle,
  type VehicleIconType,
} from '@/features/parc/vehicle-types';
import { vehicleIcon3dMarkup } from '@/features/parc/vehicle-icons-3d';

export interface AddEditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FleetVehicle) => void;
  vehicle?: FleetVehicle | null;
  departments: { id: string; name: string }[];
  drivers: { id: string; name: string }[];
  specialities: string[];
}

const inputClass =
  'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 bg-white';

const labelClass = 'text-xs font-semibold text-slate-700 mb-1.5 block';

function IconGlyph({
  iconType,
  size = 20,
}: {
  iconType: VehicleIconType;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden"
      style={{
        width: size + 10,
        height: size + 10,
      }}
      dangerouslySetInnerHTML={{
        __html: vehicleIcon3dMarkup(iconType, size + 4),
      }}
    />
  );
}

export function AddEditVehicleModal({
  isOpen,
  onClose,
  onSave,
  vehicle,
  departments,
  drivers,
  specialities,
}: AddEditVehicleModalProps) {
  const [formData, setFormData] = useState<FleetVehicle>(emptyFleetVehicle());
  const [iconOpen, setIconOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vehicle) setFormData({ ...vehicle });
    else setFormData(emptyFleetVehicle());
    setIconOpen(false);
  }, [vehicle, isOpen]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setIconOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const set =
    (key: keyof FleetVehicle) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const raw = e.target.value;
      const numericKeys: (keyof FleetVehicle)[] = [
        'year',
        'seats',
        'fiscalPower',
        'realPower',
        'displacement',
        'tankCapacity',
        'fuelEstimate',
        'mileage',
      ];
      if (numericKeys.includes(key)) {
        setFormData((prev) => ({
          ...prev,
          [key]: raw === '' ? '' : Number(raw),
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, [key]: raw }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === formData.departmentId);
    const driver = drivers.find((d) => d.id === formData.driverId);
    onSave({
      ...formData,
      departmentName: dept?.name ?? formData.departmentName,
      driverName: driver?.name ?? formData.driverName,
    });
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  const onDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      registrationDocUrl: url,
      registrationDocName: file.name,
    }));
  };

  if (!isOpen) return null;

  const selectedIcon = getVehicleIconOption(formData.iconType);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <ModalHeader
            title={vehicle ? 'Modifier Véhicule' : 'Ajouter Véhicule'}
            onClose={onClose}
          />

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Matricule <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    className={inputClass}
                    value={formData.matricule}
                    onChange={set('matricule')}
                    placeholder="Ex: TN-SEED-CAR-1000"
                  />
                </div>
                <div>
                  <label className={labelClass}>Département</label>
                  <select
                    className={inputClass}
                    value={formData.departmentId}
                    onChange={set('departmentId')}
                  >
                    <option value="">Sélectionner...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {departments.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">
                      Aucun département disponible — créez-en un dans Gestion.
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Chauffeur</label>
                  <select
                    className={inputClass}
                    value={formData.driverId}
                    onChange={set('driverId')}
                  >
                    <option value="">Sélectionner...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Spécialité</label>
                  <select
                    className={inputClass}
                    value={formData.speciality}
                    onChange={set('speciality')}
                  >
                    <option value="">Sélectionner...</option>
                    {specialities.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Marque</label>
                  <input
                    className={inputClass}
                    value={formData.brand}
                    onChange={set('brand')}
                    placeholder="Marque"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Filtre rapide : sélectionnez la marque, puis le modèle (ou
                    saisissez librement).
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Modèle</label>
                  <input
                    className={inputClass}
                    value={formData.model}
                    onChange={set('model')}
                    placeholder="Modèle"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Marque et modèle vont ensemble, ou laissez les deux vides
                    pour ne pas lier de modèle catalogue.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Année</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.year}
                    onChange={set('year')}
                    placeholder="2021"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Date de mise en circulation
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.commissioningDate}
                    onChange={set('commissioningDate')}
                  />
                </div>

                <div>
                  <label className={labelClass}>Date de réforme</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.retirementDate}
                    onChange={set('retirementDate')}
                  />
                </div>
                <div>
                  <label className={labelClass}>N° châssis</label>
                  <input
                    className={inputClass}
                    value={formData.chassisNumber}
                    onChange={set('chassisNumber')}
                  />
                </div>

                <div>
                  <label className={labelClass}>Type de carburant</label>
                  <input
                    className={inputClass}
                    value={formData.fuelType}
                    onChange={set('fuelType')}
                    placeholder="Diesel"
                  />
                </div>
                <div>
                  <label className={labelClass}>Nombre de places</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.seats}
                    onChange={set('seats')}
                  />
                </div>

                <div>
                  <label className={labelClass}>Puissance fiscale (CV)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.fiscalPower}
                    onChange={set('fiscalPower')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Puissance réelle (ch)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.realPower}
                    onChange={set('realPower')}
                  />
                </div>

                <div>
                  <label className={labelClass}>Cylindrée (cm³)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.displacement}
                    onChange={set('displacement')}
                  />
                </div>
                <div>
                  <label className={labelClass}>Capacité réservoir (L)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.tankCapacity}
                    onChange={set('tankCapacity')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Estimation carburant</label>
                  <input
                    type="number"
                    step="0.1"
                    className={inputClass}
                    value={formData.fuelEstimate}
                    onChange={set('fuelEstimate')}
                  />
                </div>
              </div>

              {/* Icon card */}
              <div className="border border-slate-200 rounded-xl p-4 relative">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Icône GPS
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Type d&apos;icône utilisé pour représenter le véhicule.
                    </p>
                  </div>
                  <IconGlyph iconType={formData.iconType} size={28} />
                </div>
                <div className="relative" ref={iconRef}>
                  <button
                    type="button"
                    onClick={() => setIconOpen((o) => !o)}
                    className={`${inputClass} flex items-center gap-2 text-left`}
                  >
                    <IconGlyph iconType={formData.iconType} size={18} />
                    <span className="flex-1">{selectedIcon.label}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {iconOpen && (
                    <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase">
                        Sélectionner une icône...
                      </div>
                      {VEHICLE_ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              iconType: opt.id,
                            }));
                            setIconOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${
                            formData.iconType === opt.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-700'
                          }`}
                        >
                          <IconGlyph iconType={opt.id} size={18} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Photo card */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Photo du véhicule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  Ajoutez une photo pour améliorer l&apos;identification.
                </p>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoChange}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  Choisir une image
                </button>
                <div className="mt-3 h-28 border border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Aperçu véhicule"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Aucun aperçu</span>
                  )}
                </div>
              </div>

              {/* Carte grise */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Carte grise
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  Image ou PDF du document officiel du véhicule.
                </p>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={onDocChange}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="w-4 h-4" />
                  Choisir image ou PDF
                </button>
                <div className="mt-3 h-24 border border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50 px-3">
                  {formData.registrationDocUrl ? (
                    formData.registrationDocName?.toLowerCase().endsWith(
                      '.pdf'
                    ) ? (
                      <span className="text-xs text-slate-600 truncate">
                        {formData.registrationDocName}
                      </span>
                    ) : (
                      <img
                        src={formData.registrationDocUrl}
                        alt="Carte grise"
                        className="max-h-full object-contain"
                      />
                    )
                  ) : (
                    <span className="text-xs text-slate-400">
                      Aucun document
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-white">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {vehicle ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
