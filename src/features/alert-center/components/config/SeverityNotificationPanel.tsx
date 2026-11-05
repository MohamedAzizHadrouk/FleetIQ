import { useEffect, useMemo, useState } from 'react';
import type {
  BuiltinSeverityOverride,
  CustomSeverityLevel,
  SeverityLevelId,
  SeverityNotificationPolicy,
} from '@/types/alert-config';
import {
  useNamedUsers,
  useSaveBuiltinSeverityOverrides,
  useSaveCustomSeverities,
  useSaveSeverityPolicies,
  useSeverityPolicies,
  useBuiltinSeverityOverrides,
  useCustomSeverities,
} from '../../hooks/useAlertQueries';
import { buildSeverityOptionsFromLocal } from '../../hooks/useSeverityOptions';
import { SeverityLevelsManager } from './SeverityLevelsManager';
import type { SeverityLevelSavePayload } from './SeverityLevelEditorDialog';
import type { AlertSeverity } from '@/types/alerts';
import { SEVERITY_CONFIG } from '@/design-system/severity';

const BUILTIN_IDS: AlertSeverity[] = ['critical', 'warning', 'info'];

function isBuiltinSeverity(id: string): id is AlertSeverity {
  return BUILTIN_IDS.includes(id as AlertSeverity);
}

export function SeverityNotificationPanel() {
  const { data: policies = [], isLoading: policiesLoading } = useSeverityPolicies();
  const { data: overrides = [], isLoading: overridesLoading } = useBuiltinSeverityOverrides();
  const { data: customLevels = [], isLoading: customLoading } = useCustomSeverities();
  const { data: namedUsers = [] } = useNamedUsers();
  const savePolicies = useSaveSeverityPolicies();
  const saveOverrides = useSaveBuiltinSeverityOverrides();
  const saveCustom = useSaveCustomSeverities();

  const [localPolicies, setLocalPolicies] = useState<SeverityNotificationPolicy[]>([]);
  const [localOverrides, setLocalOverrides] = useState<BuiltinSeverityOverride[]>([]);
  const [localCustomLevels, setLocalCustomLevels] = useState<CustomSeverityLevel[]>([]);

  useEffect(() => {
    if (policies.length) setLocalPolicies(policies);
  }, [policies]);

  useEffect(() => {
    setLocalOverrides(overrides);
  }, [overrides]);

  useEffect(() => {
    setLocalCustomLevels(customLevels);
  }, [customLevels]);

  const displayOptions = useMemo(
    () => buildSeverityOptionsFromLocal(localOverrides, localCustomLevels),
    [localOverrides, localCustomLevels]
  );

  const getPolicy = (severity: SeverityLevelId) =>
    localPolicies.find((p) => p.severity === severity) ?? {
      severity,
      roles: [],
      userIds: [],
      channels: [],
    };

  const persistAll = async (
    nextOverrides: BuiltinSeverityOverride[],
    nextCustom: CustomSeverityLevel[],
    nextPolicies: SeverityNotificationPolicy[]
  ) => {
    const allLevelIds = [
      ...BUILTIN_IDS,
      ...nextCustom.map((c) => c.id),
    ];
    const policiesToSave = allLevelIds.map((id) => {
      const found = nextPolicies.find((p) => p.severity === id);
      return found ?? { severity: id, roles: [], userIds: [], channels: [] };
    });

    await Promise.all([
      saveOverrides.mutateAsync(nextOverrides),
      saveCustom.mutateAsync(nextCustom),
      savePolicies.mutateAsync(policiesToSave),
    ]);
  };

  const handleSaveLevel = async (
    levelId: SeverityLevelId | null,
    isCustom: boolean,
    isCreate: boolean,
    payload: SeverityLevelSavePayload
  ) => {
    let nextOverrides = [...localOverrides];
    let nextCustom = [...localCustomLevels];
    let nextPolicies = [...localPolicies];
    let targetId = levelId;

    if (isCreate) {
      const id = `custom-${Date.now()}`;
      targetId = id;
      nextCustom = [
        ...nextCustom,
        {
          id,
          label: payload.label,
          color: payload.color,
          order: nextCustom.length + 1,
        },
      ];
    } else if (targetId) {
      if (isCustom) {
        nextCustom = nextCustom.map((l) =>
          l.id === targetId ? { ...l, label: payload.label, color: payload.color } : l
        );
      } else if (isBuiltinSeverity(targetId)) {
        const defaultLabel = SEVERITY_CONFIG[targetId].label;
        const overridePatch: BuiltinSeverityOverride = {
          severity: targetId,
          label: payload.label === defaultLabel ? undefined : payload.label,
          color: payload.color,
        };
        const existing = nextOverrides.find((o) => o.severity === targetId);
        nextOverrides = existing
          ? nextOverrides.map((o) => (o.severity === targetId ? { ...o, ...overridePatch } : o))
          : [...nextOverrides, overridePatch];
      }
    }

    if (targetId) {
      const policyPatch = {
        severity: targetId,
        roles: payload.roles,
        userIds: payload.userIds,
        channels: payload.channels,
      };
      const existingPolicy = nextPolicies.find((p) => p.severity === targetId);
      nextPolicies = existingPolicy
        ? nextPolicies.map((p) => (p.severity === targetId ? { ...p, ...policyPatch } : p))
        : [...nextPolicies, policyPatch];
    }

    setLocalOverrides(nextOverrides);
    setLocalCustomLevels(nextCustom);
    setLocalPolicies(nextPolicies);

    await persistAll(nextOverrides, nextCustom, nextPolicies);
  };

  const handleDeleteLevel = async (levelId: SeverityLevelId) => {
    const nextCustom = localCustomLevels
      .filter((l) => l.id !== levelId)
      .map((l, i) => ({ ...l, order: i + 1 }));
    const nextPolicies = localPolicies.filter((p) => p.severity !== levelId);

    setLocalCustomLevels(nextCustom);
    setLocalPolicies(nextPolicies);

    await persistAll(localOverrides, nextCustom, nextPolicies);
  };

  const isSaving =
    savePolicies.isPending || saveOverrides.isPending || saveCustom.isPending;

  if (policiesLoading || overridesLoading || customLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des niveaux d&apos;alerte...</p>;
  }

  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
      <SeverityLevelsManager
        options={displayOptions}
        getPolicy={getPolicy}
        namedUsers={namedUsers}
        isSaving={isSaving}
        onSaveLevel={handleSaveLevel}
        onDeleteLevel={handleDeleteLevel}
      />
    </div>
  );
}
