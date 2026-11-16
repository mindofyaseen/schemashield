import React from 'react';
import { AnalysisReport } from '../types';
import { BlastRadiusGraph } from '../components/BlastRadiusGraph';
import { SchemaDiffViewer } from '../components/SchemaDiffViewer';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  Activity,
  Layers,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface AnalysisPageProps {
  report: AnalysisReport;
  onBack: () => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ report, onBack }) => {
  const isBlocked = report.release_verdict === 'BLOCK RELEASE';
  const isReview = report.release_verdict === 'REVIEW REQUIRED';
  const isSafe = report.release_verdict === 'SAFE TO RELEASE';

  const getVerdictBadge = () => {
    if (isBlocked) {
      return {
        bg: 'bg-rose-600',
        text: 'text-white',
        border: 'border-rose-700',
        subBg: 'bg-rose-50 border-rose-200 text-rose-800',
        icon: ShieldAlert
      };
    }
    if (isReview) {
      return {
        bg: 'bg-amber-500',
        text: 'text-white',
        border: 'border-amber-600',
        subBg: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: AlertTriangle
      };
    }
    return {
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-700',
      subBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: ShieldCheck
    };
  };

  const badge = getVerdictBadge();
  const Icon = badge.icon;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Analysis Report: {report.contract_name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {report.analysis_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Completed at {new Date(report.completed_at || '').toLocaleString()} via AWS Step Functions
            </p>
          </div>
        </div>
      </div>

      {/* Main Banner: Overall Verdict & Risk Score Meter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Release Verdict Card */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Authoritative Release Verdict
            </span>
            <div className="flex items-center space-x-4 mb-3">
              <div className={`w-12 h-12 rounded-2xl ${badge.bg} flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {report.release_verdict}
                </h3>
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mt-1 ${badge.subBg}`}>
                  {report.risk_level}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {report.summary_explanation}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 block">Total Consumers</span>
              <span className="text-base font-bold text-slate-800">{report.total_consumers}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50">
              <span className="text-[11px] font-semibold text-rose-500 block">Breaking Consumers</span>
              <span className="text-base font-bold text-rose-700">{report.breaking_consumers}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <span className="text-[11px] font-semibold text-emerald-500 block">Compatible</span>
              <span className="text-base font-bold text-emerald-700">{report.compatible_consumers}</span>
            </div>
          </div>
        </div>

        {/* Risk Score Gauge Card */}
        <div className="md:col-span-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Explainable Risk Score
            </span>
            <div className="flex items-baseline space-x-2 my-2">
              <span className="text-5xl font-black text-white tracking-tight">{report.risk_score}</span>
              <span className="text-slate-400 font-semibold text-base">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden my-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  report.risk_score >= 80
                    ? 'bg-rose-500'
                    : report.risk_score >= 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${report.risk_score}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Blast Radius:</span>
              <span className="font-semibold text-white">{report.blast_radius_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Critical Findings:</span>
              <span className="font-semibold text-rose-400">{report.severity_distribution.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">High Findings:</span>
              <span className="font-semibold text-amber-400">{report.severity_distribution.high}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Downstream Blast Radius Graph Component */}
      <BlastRadiusGraph
        contractName={report.contract_name}
        consumerResults={report.consumer_results}
      />

      {/* Side-by-side Schema Diff Component */}
      <SchemaDiffViewer findings={report.schema_findings} />

      {/* Recommended Migration Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span>Recommended Engineering Actions</span>
        </h3>
        <ul className="space-y-2">
          {report.recommended_actions.map((action, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium flex items-start space-x-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
