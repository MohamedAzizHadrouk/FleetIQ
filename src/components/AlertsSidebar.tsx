import React from 'react';
import { Bell, Settings, LayoutDashboard, Mail } from 'lucide-react';
interface AlertsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}
export function AlertsSidebar({
  activeSection,
  onSectionChange
}: AlertsSidebarProps) {
  const menuItems = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard
  },
  {
    id: 'alerts',
    label: 'Alertes',
    icon: Bell
  },
  {
    id: 'mail-sms',
    label: 'Envoi Mail/SMS',
    icon: Mail
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: Settings
  }];

  return (
    <div className="w-80 bg-slate-800 flex flex-col flex-shrink-0 text-slate-200 font-sans overflow-hidden">
      <div className="p-4 pt-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-300" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Types d'alertes
            </h2>
          </div>
          {onSectionChange &&
          <button
            onClick={() => onSectionChange('configuration')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
            title="Configuration des alertes">
            
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
            </button>
          }
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 transition-colors text-left group ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                
                <span
                  className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'group-hover:text-white'}`}>
                  
                  {item.label}
                </span>
              </div>
            </button>);

        })}
      </div>
    </div>);

}