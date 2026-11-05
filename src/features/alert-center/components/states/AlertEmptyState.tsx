import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertEmptyStateProps {
  title?: string;
  description?: string;
  onCreateRule?: () => void;
}

export function AlertEmptyState({
  title = 'Aucune alerte correspondante',
  description = "Ajustez vos filtres ou créez une nouvelle règle d'alerte pour surveiller votre flotte.",
  onCreateRule,
}: AlertEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        <Bell className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6">{description}</p>
      {onCreateRule && (
        <Button onClick={onCreateRule}>Créer une règle d'alerte</Button>
      )}
    </div>
  );
}
