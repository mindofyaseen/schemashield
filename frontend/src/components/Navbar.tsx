import React from 'react';
import { Cloud, CheckCircle2, Play, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onQuickDemo: () => void;
  onRunAnalysis: () => void;
  isDemoLoading: boolean;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onQuickDemo,
  onRunAnalysis,
  isDemoLoading,
  apiConnected
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Reliability Dashboard';
      case 'contracts':
        return 'Data Contract Registry';
      case 'consumers':
        return 'Downstream Consumer Registry';
      case 'history':
        return 'Analysis Execution History';
      case 'architecture':
        return 'AWS Serverless Architecture';
      case 'settings':
        return 'Settings & Health Checks';
      case 'analysis':
        return 'Contract Analysis & Blast Radius';
      default:
        return 'SchemaShield';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 left-64 right-0 z-20 px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Environment Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Cloud className="w-3.5 h-3.5 text-blue-500" />
          <span>AWS us-east-1</span>
        </div>

        {/* API Status */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{apiConnected ? 'API Connected' : 'Local Mode'}</span>
        </div>

        {/* Demo Button */}
        <button
          onClick={onQuickDemo}
          disabled={isDemoLoading}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isDemoLoading ? 'Seeding...' : 'Load Interactive Demo'}</span>
        </button>

        {/* Run Analysis Action */}
        <button
          onClick={onRunAnalysis}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm shadow-blue-600/20 transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Analysis</span>
        </button>
      </div>
    </header>
  );
};
