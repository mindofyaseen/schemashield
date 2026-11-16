import React from 'react';
import { DataContract, AnalysisRecord } from '../types';
import {
  FileCode2,
  Users2,
  Activity,
  AlertOctagon,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface OverviewPageProps {
  contracts: DataContract[];
  analyses: AnalysisRecord[];
  onNavigateTab: (tab: string) => void;
  onOpenContract: (contractId: string) => void;
  onOpenAnalysis: (analysisId: string) => void;
  onQuickDemo: () => void;
  isDemoLoading: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  contracts,
  analyses,
  onNavigateTab,
  onOpenContract,
  onOpenAnalysis,
  onQuickDemo,
  isDemoLoading
}) => {
  const totalConsumers = contracts.reduce((acc, c) => acc + (c.consumerCount || 0), 0);
  const totalAnalyses = analyses.length;
  const breakingAnalyses = analyses.filter(a => a.verdict === 'BLOCK RELEASE').length;

  return (
    <div className="space-y-8">
      {/* Hero / Quick Start Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-7 text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Serverless Data Contract Firewall</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">
            Catch breaking data contracts before they break production.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            SchemaShield analyzes proposed producer schema changes, discovers backward incompatibilities,
            evaluates downstream consumer contracts in parallel with AWS Step Functions, and renders real-time blast-radius topology.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={onQuickDemo}
            disabled={isDemoLoading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition text-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isDemoLoading ? 'Loading Demo...' : 'Load Interactive Demo'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Contracts</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{contracts.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Downstream Consumers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalConsumers}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Analyses</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalAnalyses}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Breaking Releases Blocked</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-0.5">{breakingAnalyses}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Contracts & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Contracts */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Data Contracts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Producer schemas monitored for breaking changes</p>
            </div>
            <button
              onClick={() => onNavigateTab('contracts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {contracts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileCode2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No contracts registered yet.</p>
              <button
                onClick={onQuickDemo}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                Click here to seed demo contract
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(contract => (
                <div
                  key={contract.contractId}
                  onClick={() => onOpenContract(contract.contractId)}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                        {contract.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {contract.domain}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500">
                        v{contract.currentVersion}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{contract.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-slate-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {contract.consumerCount || 0} Consumers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Contract Analyses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historical verification runs and release verdicts</p>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Full History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {analyses.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No analysis executions yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Run an analysis or load the demo to see Step Functions execution results.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 4).map(analysis => {
                const isBlocked = analysis.verdict === 'BLOCK RELEASE';
                const isReview = analysis.verdict === 'REVIEW REQUIRED';
                return (
                  <div
                    key={analysis.analysisId}
                    onClick={() => onOpenAnalysis(analysis.analysisId)}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="mt-0.5">
                        {isBlocked ? (
                          <ShieldAlert className="w-5 h-5 text-rose-600" />
                        ) : isReview ? (
                          <ShieldAlert className="w-5 h-5 text-amber-500" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {analysis.analysisId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isBlocked
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : isReview
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {analysis.verdict || 'COMPLETED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(analysis.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">
                        Score: {analysis.riskScore ?? 0}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
