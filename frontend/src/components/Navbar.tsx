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
        return 'Enterprise Data Reliability Hub';
      case 'studio':
        return 'Schema Verification Studio (Upload & Test)';
      case 'pipeline':
        return 'CI/CD & CLI Simulator (Pre-Merge Firewall)';
      case 'topology3d':
        return '3D Holographic Blast Radius & Serverless Topology';
      case 'migrations':
        return 'Automated Migration Shims Generator (SQL / PySpark / Glue)';
      case 'roi':
        return 'Downtime ROI & Incident Cost Calculator';
      case 'contracts':
        return 'Data Contract Registry';
      case 'consumers':
        return 'Downstream Consumer Registry';
      case 'history':
        return 'Analysis Execution History';
      case 'architecture':
        return 'AWS Serverless Architecture';
      case 'settings':
        return 'System & Health Checks';
      case 'analysis':
        return 'Contract Analysis & Blast Radius Topology';
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
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
          <Cloud className="w-3.5 h-3.5 text-blue-500" />
          <span>AWS us-east-1</span>
        </div>

        {/* API Status */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{apiConnected ? 'AWS Connected' : 'Local Mode'}</span>
        </div>

        {/* Production Audit Button */}
        <button
          onClick={onQuickDemo}
          disabled={isDemoLoading}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isDemoLoading ? 'Analyzing Contract Drift...' : '🛡️ Run Drift Audit'}</span>
        </button>
      </div>
    </header>
  );
};
