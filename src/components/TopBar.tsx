import React, { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  BarChart3,
  Shield,
  ChevronDown,
  BellOff,
  Bell,
  UserCircle,
  Users,
  Bell as BellIcon,
  Mail,
  AlertTriangle,
  Menu,
  X,
  Settings,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  locked?: boolean;
  hasDropdown?: boolean;
  dropdownItems?: { id: string; label: string; icon: LucideIcon }[];
}

interface TopBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  unreadAlertsCount?: number;
  hideBadges?: boolean;
  onToggleHideBadges?: () => void;
}
export function TopBar({
  activeSection,
  onSectionChange,
  unreadAlertsCount = 0,
  hideBadges = false,
  onToggleHideBadges
}: TopBarProps) {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLNavElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      adminMenuRef.current &&
      !adminMenuRef.current.contains(event.target as Node))
      {
        setShowAdminMenu(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node))
      {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const menuItems: NavMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      locked: true,
    },
    {
      id: 'suivie',
      label: 'Suivi',
      icon: MapPin,
    },
    {
      id: 'parc',
      label: 'Parc',
      icon: Truck,
    },
    {
      id: 'alertes',
      label: 'Alertes',
      icon: Shield,
      badge: unreadAlertsCount,
    },
    {
      id: 'rapports',
      label: 'Rapports',
      icon: BarChart3,
      locked: true,
    },
    {
      id: 'surveillance',
      label: 'Surveillance',
      icon: Shield,
      locked: true,
    },
  ];

  const adminMenuItems = [
  {
    icon: UserCircle,
    label: 'Gestion des comptes',
    action: 'accounts'
  },
  {
    icon: Users,
    label: 'Gestion des départements',
    action: 'departments'
  },
  {
    icon: Settings,
    label: 'Paramétrage des alertes',
    action: 'alert_configuration'
  },
  {
    icon: Mail,
    label: 'Envoi des alertes par Mail/SMS',
    action: 'notifications'
  }];

  const handleAdminMenuClick = (action: string) => {
    setShowAdminMenu(false);
    if (action === 'accounts') {
      onSectionChange('administration');
    } else if (action === 'departments') {
      onSectionChange('departments');
    } else if (action === 'alert_configuration') {
      onSectionChange('alert_configuration');
    } else if (action === 'notifications') {
      onSectionChange('notifications');
    }
  };
  const handleNavClick = (item: NavMenuItem) => {
    if (item.locked) return;
    if (item.hasDropdown) {
      setActiveDropdown(activeDropdown === item.id ? null : item.id);
    } else {
      onSectionChange(item.id);
      setActiveDropdown(null);
    }
  };
  const handleDropdownItemClick = (itemId: string) => {
    onSectionChange(itemId);
    setActiveDropdown(null);
  };
  const handleMobileNavClick = (item: NavMenuItem) => {
    if (item.locked) return;
    onSectionChange(item.id);
    setShowMobileMenu(false);
  };
  return (
    <header className="h-[72px] bg-gradient-to-r from-blue-800 to-blue-500 flex items-center justify-between px-4 shadow-md z-50 flex-shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 lg:gap-6">
        <div className="bg-white rounded-full px-3 lg:px-4 py-1.5 lg:py-2 flex items-center gap-2 shadow-sm">
          <img
            src="/tunav_logo.png"
            alt="Tunav"
            className="h-6 lg:h-8 w-auto object-contain" />
          
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-blue-700 font-bold text-sm">TUNAV</span>
            <span className="text-[8px] text-slate-500 font-medium">
              GPS trackers, IT experts
            </span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          
          {showMobileMenu ?
          <X className="w-5 h-5 text-white" /> :

          <Menu className="w-5 h-5 text-white" />
          }
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2" ref={navRef}>
          {menuItems.map((item) =>
          <div key={item.id} className="relative">
              <button
              type="button"
              onClick={() => handleNavClick(item)}
              disabled={item.locked}
              aria-disabled={item.locked}
              title={item.locked ? 'Bientôt disponible' : undefined}
              className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${item.locked
                    ? 'text-blue-200/50 opacity-60 cursor-not-allowed'
                    : activeSection === item.id || item.dropdownItems?.some((sub) => sub.id === activeSection)
                      ? 'bg-white/20 text-white shadow-sm border border-white/10'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'}
                `}>
              
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.locked && <Lock className="w-3 h-3 opacity-80" aria-hidden />}
                {item.hasDropdown &&
              <ChevronDown
                className={`w-3 h-3 opacity-70 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />

              }
                {item.badge !== undefined && item.badge > 0 && !hideBadges &&
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-blue-600">
                    {item.badge}
                  </span>
              }
              </button>

              {/* Dropdown Menu */}
              {item.hasDropdown && activeDropdown === item.id &&
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    {item.dropdownItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <button
                      key={subItem.id}
                      type="button"
                      onClick={() => handleDropdownItemClick(subItem.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left hover:bg-slate-50
                            ${activeSection === subItem.id ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-700'}
                          `}>
                      
                          <SubIcon className="w-4 h-4 opacity-70" />
                          {subItem.label}
                        </button>);

                })}
                  </div>
                </div>
            }
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {showMobileMenu &&
        <motion.div
          ref={mobileMenuRef}
          initial={{
            opacity: 0,
            y: -10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -10
          }}
          className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-[100]">
          
            <div className="py-2">
              {menuItems.map((item) =>
            <button
              key={item.id}
              type="button"
              onClick={() => handleMobileNavClick(item)}
              disabled={item.locked}
              aria-disabled={item.locked}
              title={item.locked ? 'Bientôt disponible' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                item.locked
                  ? 'text-slate-400 opacity-60 cursor-not-allowed'
                  : activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
              }`}>
              
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                  {item.locked && <Lock className="w-3.5 h-3.5 ml-auto text-slate-400" aria-hidden />}
                  {!item.locked &&
              item.badge !== undefined &&
              item.badge > 0 &&
              !hideBadges &&
              <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
              }
                </button>
            )}
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Right: Admin Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Toggle Badge Visibility Button */}
        {onToggleHideBadges &&
        <button
          onClick={onToggleHideBadges}
          className={`
              relative flex items-center justify-center w-9 lg:w-10 h-9 lg:h-10 rounded-lg transition-all
              ${hideBadges ? 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-400/30' : 'bg-blue-400/30 text-white hover:bg-blue-400/40 border border-white/10'}
            `}
          title={
          hideBadges ?
          "Afficher les badges d'alerte" :
          "Masquer les badges d'alerte"
          }>
          
            {hideBadges ?
          <BellOff className="w-4 lg:w-5 h-4 lg:h-5" /> :

          <Bell className="w-4 lg:w-5 h-4 lg:h-5" />
          }
            {!hideBadges && unreadAlertsCount > 0 &&
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadAlertsCount}
              </span>
          }
          </button>
        }

        <button className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-2 bg-blue-400/30 hover:bg-blue-400/40 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span className="hidden lg:inline">Admin</span>
        </button>

        {/* Administration Button with Dropdown */}
        <div className="relative" ref={adminMenuRef}>
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            className="flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 bg-blue-400 hover:bg-blue-300 text-white rounded-lg text-sm font-bold shadow-sm transition-colors uppercase tracking-wide">
            
            <Settings className="w-4 h-4 lg:hidden" />
            <span className="hidden lg:inline">Administration</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
            
          </button>

          {/* Administration Dropdown Menu */}
          {showAdminMenu &&
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-[100]">
              <div className="py-1">
                {adminMenuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAdminMenuClick(item.action)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group">
                    
                      <Icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">
                        {item.label}
                      </span>
                    </button>);

              })}
              </div>
            </div>
          }
        </div>
      </div>
    </header>);

}