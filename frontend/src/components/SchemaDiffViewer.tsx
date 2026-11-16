import React from 'react';
import { SchemaFinding } from '../types';
import { MinusCircle, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SchemaDiffViewerProps {
  findings: SchemaFinding[];
}

export const SchemaDiffViewer: React.FC<SchemaDiffViewerProps> = ({ findings }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Schema Change Diff & Contract Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic JSON Schema Draft 2020-12 change classification
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {findings.length} findings detected
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {findings.map(finding => {
          const isBreaking = finding.category === 'BREAKING';
          const isRisky = finding.category === 'RISKY';
          const isSafe = finding.category === 'SAFE';

          return (
            <div
              key={finding.id}
              className={`py-3.5 px-4 rounded-xl my-1.5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
                isBreaking
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : isRisky
                  ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {isBreaking && <MinusCircle className="w-5 h-5 text-rose-600" />}
                  {isRisky && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  {isSafe && <PlusCircle className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900">
                      {finding.path}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isBreaking
                          ? 'bg-rose-200 text-rose-900'
                          : isRisky
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {finding.change_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                      Severity: {finding.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
                    {finding.message}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    Action: {finding.suggested_action}
                  </p>
                </div>
              </div>

              {/* Old vs New Value pill */}
              <div className="flex items-center space-x-2 shrink-0 font-mono text-[11px] self-start md:self-center">
                {finding.old_value !== null && (
                  <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 line-through">
                    {typeof finding.old_value === 'object'
                      ? JSON.stringify(finding.old_value)
                      : String(finding.old_value)}
                  </span>
                )}
                {finding.old_value !== null && finding.new_value !== null && (
                  <span className="text-slate-400">→</span>
                )}
                {finding.new_value !== null && (
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {typeof finding.new_value === 'object'
                      ? JSON.stringify(finding.new_value)
                      : String(finding.new_value)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
