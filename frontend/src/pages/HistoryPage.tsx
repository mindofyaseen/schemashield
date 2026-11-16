import React from 'react';
import { AnalysisRecord } from '../types';
import { History, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface HistoryPageProps {
  analyses: AnalysisRecord[];
  onOpenAnalysis: (analysisId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ analyses, onOpenAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Analysis Execution History</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit trail of schema compatibility runs executed via AWS Step Functions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {analyses.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No previous analysis executions recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-5">Analysis ID</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Risk Score</th>
                  <th className="py-3 px-5">Verdict</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map(a => {
                  const isBlocked = a.verdict === 'BLOCK RELEASE';
                  const isReview = a.verdict === 'REVIEW REQUIRED';
                  return (
                    <tr
                      key={a.analysisId}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => onOpenAnalysis(a.analysisId)}
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {a.analysisId}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-emerald-600 uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {a.riskScore ?? 0} / 100
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isReview
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {a.verdict || 'SAFE TO RELEASE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onOpenAnalysis(a.analysisId);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition inline-flex items-center space-x-1 font-semibold"
                        >
                          <span>Inspect Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
