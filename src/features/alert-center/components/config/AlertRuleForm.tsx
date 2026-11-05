import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Vehicle } from '@/types';
import type { AlertCategory, AlertType, NotificationChannel } from '@/types/alerts';
import { ALERT_CATEGORIES } from '@/design-system/alert-categories';
import { getAlertsByCategory } from '../../constants/alert-taxonomy';
import { createAlertRuleSchema, type CreateAlertRuleForm } from '../../schemas/alert-filters';
import { useSaveAlertRule } from '../../hooks/useAlertQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const NOTIFY_ROLES = [
  { id: 'admin', label: 'Administrateur' },
  { id: 'fleet_manager', label: 'Gestionnaire flotte' },
  { id: 'supervisor', label: 'Responsable' },
  { id: 'driver', label: 'Conducteur' },
];

const NOTIFY_CHANNELS = [
  { id: 'in_app', label: 'Notification plateforme' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'push', label: 'Push Mobile' },
];

interface AlertRuleFormProps {
  vehicles?: Vehicle[];
  onSuccess?: () => void;
  className?: string;
}

export function AlertRuleForm({ vehicles = [], onSuccess, className }: AlertRuleFormProps) {
  const saveRule = useSaveAlertRule();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAlertRuleForm>({
    resolver: zodResolver(createAlertRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
      vehicleScope: 'all',
      category: 'dashboard',
      alertType: 'fuel',
      severity: 'warning',
      activationType: 'permanent',
      notifyRoles: ['fleet_manager'],
      notifyChannels: ['in_app'],
    },
  });

  const category = watch('category') as AlertCategory;
  const vehicleScope = watch('vehicleScope');
  const alertTypes = getAlertsByCategory(category);
  const notifyRoles = watch('notifyRoles') ?? [];
  const notifyChannels = watch('notifyChannels') ?? [];

  const onSubmit = handleSubmit((data) => {
    saveRule.mutate(
      {
        name: data.name,
        description: data.description ?? '',
        active: data.active,
        vehicleScope: data.vehicleScope,
        vehicleGroupId: data.vehicleGroupId,
        vehicleId: data.vehicleId,
        category: data.category as AlertCategory,
        alertType: data.alertType as AlertType,
        severity: data.severity,
        conditionValue: data.conditionValue,
        conditionThreshold: data.conditionThreshold,
        conditionDuration: data.conditionDuration,
        activationType: data.activationType,
        activationStart: data.activationStart,
        activationEnd: data.activationEnd,
        notifyRoles: data.notifyRoles,
        notifyChannels: data.notifyChannels as NotificationChannel[],
      },
      { onSuccess: () => onSuccess?.() }
    );
  });

  const toggleArray = (field: 'notifyRoles' | 'notifyChannels', value: string) => {
    const current = watch(field) ?? [];
    setValue(
      field,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
  };

  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" {...register('name')} placeholder="Ex: Excès vitesse autoroute" />
          {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-2 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={watch('active')}
              onCheckedChange={(c) => setValue('active', Boolean(c))}
            />
            <span className="text-sm">Règle active</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} placeholder="Description de la règle" />
      </div>

      <Separator />

      <div>
        <Label className="mb-2 block">Sélection véhicules</Label>
        <div className="flex flex-wrap gap-3 mb-3">
          {(['all', 'group', 'vehicle'] as const).map((scope) => (
            <label key={scope} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={scope}
                {...register('vehicleScope')}
                className="accent-blue-600"
              />
              <span className="text-sm">
                {scope === 'all' ? 'Tous' : scope === 'group' ? 'Groupe' : 'Véhicule unique'}
              </span>
            </label>
          ))}
        </div>
        {vehicleScope === 'vehicle' && (
          <select
            {...register('vehicleId')}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Sélectionner un véhicule</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.driver}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <select
            {...register('category')}
            onChange={(e) => {
              setValue('category', e.target.value);
              const types = getAlertsByCategory(e.target.value as AlertCategory);
              if (types[0]) setValue('alertType', types[0].id);
            }}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {ALERT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Type d&apos;alerte</Label>
          <select
            {...register('alertType')}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {alertTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Gravité</Label>
        <div className="flex gap-4">
          {(['critical', 'warning', 'info'] as const).map((sev) => (
            <label key={sev} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={sev} {...register('severity')} className="accent-blue-600" />
              <span className="text-sm capitalize">
                {sev === 'critical' ? 'Critique' : sev === 'warning' ? 'Avertissement' : 'Information'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="conditionValue">Valeur</Label>
          <Input id="conditionValue" type="number" {...register('conditionValue')} placeholder="Ex: 90" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conditionThreshold">Seuil</Label>
          <Input id="conditionThreshold" type="number" {...register('conditionThreshold')} placeholder="Ex: 120" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conditionDuration">Durée (sec)</Label>
          <Input id="conditionDuration" type="number" {...register('conditionDuration')} placeholder="Ex: 30" />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Activation</Label>
        <div className="flex gap-4 mb-3">
          {(['permanent', 'temporary'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={type} {...register('activationType')} className="accent-blue-600" />
              <span className="text-sm">{type === 'permanent' ? 'Permanente' : 'Temporaire'}</span>
            </label>
          ))}
        </div>
        {watch('activationType') === 'temporary' && (
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" {...register('activationStart')} />
            <Input type="datetime-local" {...register('activationEnd')} />
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Qui notifier</Label>
        <div className="grid grid-cols-2 gap-2">
          {NOTIFY_ROLES.map((role) => (
            <label key={role.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={notifyRoles.includes(role.id)}
                onCheckedChange={() => toggleArray('notifyRoles', role.id)}
              />
              <span className="text-sm">{role.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Canaux</Label>
        <div className="grid grid-cols-2 gap-2">
          {NOTIFY_CHANNELS.map((ch) => (
            <label key={ch.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={notifyChannels.includes(ch.id)}
                onCheckedChange={() => toggleArray('notifyChannels', ch.id)}
              />
              <span className="text-sm">{ch.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={saveRule.isPending} className="w-full md:w-auto">
        {saveRule.isPending ? 'Enregistrement...' : 'Enregistrer la règle'}
      </Button>
    </form>
  );
}
