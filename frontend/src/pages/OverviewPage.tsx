import React from 'react';
import { DataContract, AnalysisRecord } from '../types';
import { ThreeFirewallGlobe } from '../components/ThreeFirewallGlobe';
import { LiveEventStreamSimulator } from '../components/LiveEventStreamSimulator';
import {
  FileCode2,
  Users2,
  Activity,
  AlertOctagon,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlayCircle,
  Zap,
  TrendingUp,
  Cpu,
  Box,
  Wrench,
  Calculator,
  GitPullRequest
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 3D Cybernetic Command Hero */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text & CTA */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Enterprise Data Reliability & Automated Contract Boundary</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              The Serverless <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                Data Contract Firewall.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal max-w-2xl">
              Catch breaking data contracts before they break production.
              SchemaShield intercepts proposed upstream schema mutations, executes parallel downstream contract checks via <strong>AWS Step Functions</strong>, and visualizes the blast radius in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onQuickDemo}
                disabled={isDemoLoading}
                className="flex items-center justify-center space-x-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <PlayCircle className="w-5 h-5 fill-current" />
                <span>{isDemoLoading ? 'Executing Step Functions Map State...' : '🛡️ Run Production Drift Audit'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('studio')}
                className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-5 py-3.5 rounded-2xl border border-slate-700 transition"
              >
                <span>Manual Upload Lab</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('topology3d')}
                className="flex items-center justify-center space-x-2 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 font-semibold text-xs px-5 py-3.5 rounded-2xl border border-indigo-700/60 transition"
              >
                <Box className="w-4 h-4 text-indigo-400" />
                <span>3D Hologram</span>
              </button>
            </div>
          </div>

          {/* Right 3D WebGL Firewall Globe */}
          <div className="lg:col-span-5 bg-slate-900/60 rounded-3xl border border-slate-800/80 p-2 shadow-inner">
            <ThreeFirewallGlobe status="BLOCK RELEASE" />
          </div>
        </div>

        {/* Business Story Metrics */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-blue-400 font-bold block mb-1">1. The Drift</span>
            <span>Upstream Orders Service mutates schema: `customer_id` deleted, `total` converted to string.</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">2. Parallel Cloud Evaluation</span>
            <span>AWS Step Functions tests Billing, Analytics & Notification services concurrently in Lambda.</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">3. Autonomous Verdict</span>
            <span>Release safely BLOCKED. Billing & Analytics crash prevented; Notifications preserved green.</span>
          </div>
        </div>
      </div>

      {/* Enterprise Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Contracts</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{contracts.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Protected Consumers</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalConsumers}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Firewall Verifications</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalAnalyses}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outages Prevented</p>
            <h3 className="text-3xl font-black text-rose-600 mt-0.5">{breakingAnalyses}</h3>
          </div>
        </div>
      </div>

      {/* Live Event Stream Firehose Simulator */}
      <LiveEventStreamSimulator />

      {/* Main Grid: Contracts & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Contracts */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
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
                Click here to initialize production baseline contracts
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(contract => (
                <div
                  key={contract.contractId}
                  onClick={() => onOpenContract(contract.contractId)}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
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
                    <span className="text-xs font-semibold text-slate-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                      {contract.consumerCount || 0} Consumers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
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
                Click "Run Production Drift Audit" above to execute real-time cloud analysis.
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
                    className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
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

      {/* Enterprise Platform Capability Suite */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-8 border border-slate-800 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 mb-6 gap-3">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
              Enterprise Reliability Tooling
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Full-Stack Contract Protection Suite
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Seamlessly transition from autonomous schema inspection to migration code generation, incident cost savings, and 3D topology analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: 3D Hologram */}
          <div
            onClick={() => onNavigateTab('topology3d')}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500 hover:bg-slate-800 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Box className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                3D Hologram Topology
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Interactive WebGL 3D firewall core visualizing cloud packet blockage and consumer impact in real time.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Launch 3D Canvas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Migration Shims */}
          <div
            onClick={() => onNavigateTab('migrations')}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500 hover:bg-slate-800 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                Migration Shims
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Auto-generate backward-compatible shims in SQL/dbt, PySpark, TypeScript, and AWS Glue ETL scripts.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>View Generated Code</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Downtime ROI Calculator */}
          <div
            onClick={() => onNavigateTab('roi')}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500 hover:bg-slate-800 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition">
                Downtime ROI Calculator
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Interactive financial sliders quantifying production outage loss, MTTR reduction, and 12,000%+ serverless ROI.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Calculate Savings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: CI/CD & CLI Simulator */}
          <div
            onClick={() => onNavigateTab('pipeline')}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500 hover:bg-slate-800 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                Pre-Merge Firewall Gate
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Test CLI execution commands and simulate automated pull request blocking directly inside your terminal emulator.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <span>Simulate Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
