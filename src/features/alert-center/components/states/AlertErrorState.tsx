import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function AlertErrorState({
  message = 'Impossible de charger les alertes.',
  onRetry,
}: AlertErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
      <p className="text-slate-500 mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
