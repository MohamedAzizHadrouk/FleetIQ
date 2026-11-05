import { useState, useEffect } from 'react';
import { SavedFilter, DurationUnit, DynamicDuration } from '../types';

export function useFilterManager(storageKey: string) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<string | null>(null);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const filters = JSON.parse(stored) as SavedFilter[];
        setSavedFilters(filters);
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    }
  }, [storageKey]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (savedFilters.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(savedFilters));
    }
  }, [savedFilters, storageKey]);

  // Calculate dates based on dynamic duration
  const calculateDates = (
  duration: DynamicDuration)
  : {dateDebut: string;dateFin: string;} => {
    const now = new Date();
    const dateFin = now.toLocaleDateString('fr-FR') + ' 23:59:59';

    if (duration.type === 'fixed') {
      return {
        dateDebut: duration.dateDebut || '',
        dateFin: duration.dateFin || ''
      };
    }

    // Calculate relative dates
    const startDate = new Date();
    const value = duration.value || 1;

    switch (duration.unit) {
      case 'days':
        startDate.setDate(startDate.getDate() - value);
        break;
      case 'weeks':
        startDate.setDate(startDate.getDate() - value * 7);
        break;
      case 'months':
        startDate.setMonth(startDate.getMonth() - value);
        break;
    }

    const dateDebut = startDate.toLocaleDateString('fr-FR') + ' 00:00:00';

    return { dateDebut, dateFin };
  };

  const saveFilter = (
  filterData: Omit<
    SavedFilter,
    'id' | 'createdAt' | 'isDefault' | 'duration'>,

  durationType: 'relative' | 'fixed',
  unit?: DurationUnit,
  value?: number,
  currentDateDebut?: string,
  currentDateFin?: string) =>
  {
    if (!filterName.trim()) return;

    const duration: DynamicDuration =
    durationType === 'relative' ?
    { type: 'relative', unit, value } :
    {
      type: 'fixed',
      dateDebut: currentDateDebut,
      dateFin: currentDateFin
    };

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      ...filterData,
      duration,
      isDefault: savedFilters.length === 0,
      createdAt: new Date().toISOString()
    };

    setSavedFilters((prev) => [...prev, newFilter]);
    setFilterName('');
    setShowSaveFilter(false);
  };

  const applyFilter = (
  filter: SavedFilter,
  callback: (
  filter: SavedFilter,
  dates: {dateDebut: string;dateFin: string;})
  => void) =>
  {
    const dates = calculateDates(filter.duration);
    callback(filter, dates);
    setShowFilterManager(false);
  };

  const setDefaultFilter = (filterId: string) => {
    setSavedFilters((prev) =>
    prev.map((f) => ({
      ...f,
      isDefault: f.id === filterId
    }))
    );
  };

  const deleteFilter = (filterId: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const updateFilterName = (filterId: string, newName: string) => {
    setSavedFilters((prev) =>
    prev.map((f) => f.id === filterId ? { ...f, name: newName } : f)
    );
    setEditingFilter(null);
  };

  const getDefaultFilter = () => {
    return savedFilters.find((f) => f.isDefault);
  };

  const getDurationLabel = (duration: DynamicDuration): string => {
    if (duration.type === 'fixed') {
      return `Dates fixes: ${duration.dateDebut} → ${duration.dateFin}`;
    }

    const value = duration.value || 1;
    const unitLabels = {
      days: value === 1 ? 'jour' : 'jours',
      weeks: value === 1 ? 'semaine' : 'semaines',
      months: value === 1 ? 'mois' : 'mois'
    };

    return `${value} ${unitLabels[duration.unit!]} précédent${value > 1 && duration.unit !== 'months' ? 's' : ''}`;
  };

  return {
    savedFilters,
    showFilterManager,
    setShowFilterManager,
    showSaveFilter,
    setShowSaveFilter,
    filterName,
    setFilterName,
    editingFilter,
    setEditingFilter,
    saveFilter,
    applyFilter,
    setDefaultFilter,
    deleteFilter,
    updateFilterName,
    getDefaultFilter,
    calculateDates,
    getDurationLabel
  };
}