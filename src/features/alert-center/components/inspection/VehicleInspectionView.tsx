import { ArrowLeft } from 'lucide-react';

interface VehicleInspectionViewProps {
  plate: string;
  onBack: () => void;
}

export function VehicleInspectionView({ plate, onBack }: VehicleInspectionViewProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3.5 inline-flex items-center gap-2.5 text-[13px] font-semibold"
        style={{ color: '#2563EB' }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour au centre d&apos;alertes
      </button>
      <p className="mb-3 text-sm font-semibold" style={{ color: '#0F172A' }}>
        Inspection 3D — {plate}
      </p>
      <div
        className="overflow-hidden rounded-[14px] border bg-white"
        style={{ borderColor: '#E5E7EB' }}
      >
        <iframe
          title={`Inspection 3D — ${plate}`}
          src="/mockups/inspection3d/Inspection3D.dc.html"
          className="block h-[900px] w-full border-0"
        />
      </div>
    </div>
  );
}
