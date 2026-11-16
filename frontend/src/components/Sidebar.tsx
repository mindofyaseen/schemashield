import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  FileCode2,
  Users2,
  History,
  Network,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onQuickDemo: () => void;
  isDemoLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onQuickDemo,
  isDemoLoading
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'contracts', label: 'Contracts Registry', icon: FileCode2 },
    { id: 'consumers', label: 'Consumer Registry', icon: Users2 },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'architecture', label: 'AWS Architecture', icon: Network },
    { id: 'settings', label: 'System & Health', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight leading-tight">SchemaShield</h1>
          <p className="text-xs text-blue-400 font-medium">Serverless Contract Firewall</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Challenge Demo Banner */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 text-xs">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AWS Builder Challenge</span>
          </div>
          <p className="text-slate-400 mb-3 text-[11px] leading-relaxed">
            "No Pipeline, No Problem" instant serverless data contract validation demo.
          </p>
          <button
            onClick={onQuickDemo}
            disabled={isDemoLoading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2 px-3 rounded-lg shadow-md transition disabled:opacity-50 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDemoLoading ? 'Loading Demo...' : 'Load Interactive Demo'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
