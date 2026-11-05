import { useMemo, useState } from 'react';
import { Building2, Car, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVehicleTree } from './hooks';
import type { SelectedVehicle } from './types';

interface VehicleSidebarProps {
  selectedCarId: string | null;
  onSelect: (vehicle: SelectedVehicle) => void;
}

export function VehicleSidebar({ selectedCarId, onSelect }: VehicleSidebarProps) {
  const { data: departments = [], isLoading } = useVehicleTree();
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return departments;
    return departments
      .map((d) => ({
        ...d,
        cars: d.cars.filter((c) => c.name.toLowerCase().includes(q)),
      }))
      .filter((d) => d.cars.length > 0 || d.name.toLowerCase().includes(q));
  }, [departments, searchTerm]);

  const toggleDept = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Liste des véhicules
          </h2>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filtered.map((dept) => {
            const isOpen = expanded.has(dept.id);
            return (
              <div key={dept.id} className="border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleDept(dept.id)}
                  className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-slate-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    )}
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      {dept.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    {dept.cars.length}
                  </span>
                </button>
                {isOpen ? (
                  <div className="bg-slate-50">
                    {dept.cars.map((car) => {
                      const selected = selectedCarId === car.id;
                      return (
                        <button
                          key={car.id}
                          type="button"
                          onClick={() =>
                            onSelect({
                              carId: car.id,
                              carName: car.name,
                              departmentId: dept.id,
                              departmentName: dept.name,
                            })
                          }
                          className={cn(
                            'flex w-full items-center gap-3 border-l-4 py-3 pl-12 pr-4 text-left transition-all',
                            selected
                              ? 'border-l-blue-600 bg-blue-50'
                              : 'border-l-transparent hover:bg-slate-100'
                          )}
                        >
                          <Car
                            className={cn(
                              'h-4 w-4 shrink-0',
                              selected ? 'text-blue-600' : 'text-slate-400'
                            )}
                          />
                          <span
                            className={cn(
                              'truncate text-sm font-medium',
                              selected ? 'text-blue-900' : 'text-slate-800'
                            )}
                          >
                            {car.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Aucun véhicule trouvé
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}
