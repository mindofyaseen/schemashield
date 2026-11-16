import React, { useState } from 'react';
import { SchemaFinding } from '../types';
import { CheckCircle2, AlertOctagon, ArrowRight, FileCode, Minus, Plus, AlertTriangle } from 'lucide-react';

interface BeforeAfterDiffProps {
  baselineSchema: Record<string, any>;
  proposedSchema: Record<string, any>;
  findings: SchemaFinding[];
}

export const BeforeAfterDiff: React.FC<BeforeAfterDiffProps> = ({
  baselineSchema,
  proposedSchema,
  findings
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  const baselineProps = baselineSchema?.properties || {};
  const proposedProps = proposedSchema?.properties || {};

  const allKeys = Array.from(new Set([...Object.keys(baselineProps), ...Object.keys(proposedProps)])).sort();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-xs uppercase tracking-wider font-bold text-blue-400">
              Interactive Schema Diff Inspector
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight mt-1">
            Before (Production Baseline) vs After (Proposed Candidate)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact field-level contract drift analysis showing breaking mutations and additions
          </p>
        </div>

        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'visual' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Matrix
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'json' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw JSON Side-by-Side
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold bg-slate-50">
                <th className="py-3.5 px-4 w-48">Property Name</th>
                <th className="py-3.5 px-4 bg-slate-100/60 w-1/3">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span>BEFORE: Active Contract (v1.0)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 bg-blue-50/40 w-1/3">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>AFTER: Proposed Candidate</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Contract Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allKeys.map(key => {
                const before = baselineProps[key];
                const after = proposedProps[key];

                const isRemoved = before && !after;
                const isAdded = !before && after;
                const isTypeChanged = before && after && before.type !== after.type;
                const isEnumChanged = before?.enum && after?.enum && JSON.stringify(before.enum) !== JSON.stringify(after.enum);

                const finding = findings.find(f => f.path.includes(key));
                const isBreaking = isRemoved || isTypeChanged || (finding && finding.category === 'BREAKING');

                return (
                  <tr
                    key={key}
                    className={`hover:bg-slate-50/80 transition ${
                      isBreaking
                        ? 'bg-rose-50/30'
                        : isAdded
                        ? 'bg-emerald-50/20'
                        : ''
                    }`}
                  >
                    {/* Key Name */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                        {key}
                      </span>
                    </td>

                    {/* Before Column */}
                    <td className="py-4 px-4 bg-slate-50/50">
                      {before ? (
                        <div className="space-y-1 font-mono text-[11px]">
                          <div>
                            Type: <span className="font-semibold text-slate-800">{before.type}</span>
                          </div>
                          {before.enum && (
                            <div className="text-slate-500">
                              Enum: <span className="text-indigo-600 font-semibold">[{before.enum.join(', ')}]</span>
                            </div>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            baselineSchema.required?.includes(key) ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {baselineSchema.required?.includes(key) ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Non-existent</span>
                      )}
                    </td>

                    {/* After Column */}
                    <td className="py-4 px-4 bg-blue-50/20">
                      {after ? (
                        <div className="space-y-1 font-mono text-[11px]">
                          <div>
                            Type:{' '}
                            <span
                              className={`font-semibold ${
                                isTypeChanged ? 'text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded' : 'text-slate-800'
                              }`}
                            >
                              {after.type}
                            </span>
                          </div>
                          {after.enum && (
                            <div className="text-slate-500">
                              Enum:{' '}
                              <span
                                className={`font-semibold ${
                                  isEnumChanged ? 'text-rose-600 bg-rose-50 px-1.5 rounded' : 'text-indigo-600'
                                }`}
                              >
                                [{after.enum.join(', ')}]
                              </span>
                            </div>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            proposedSchema.required?.includes(key) ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {proposedSchema.required?.includes(key) ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs bg-rose-100 px-2 py-1 rounded inline-flex items-center space-x-1">
                          <Minus className="w-3.5 h-3.5" />
                          <span>DELETED / MISSING</span>
                        </span>
                      )}
                    </td>

                    {/* Verdict */}
                    <td className="py-4 px-4 text-right">
                      {isBreaking ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                          <AlertOctagon className="w-3 h-3" />
                          <span>BREAKING CHANGE</span>
                        </span>
                      ) : isAdded ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          <Plus className="w-3 h-3" />
                          <span>SAFE ADDITION</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>IDENTICAL</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs">
          <div className="p-4">
            <div className="text-slate-400 font-bold pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
              <span>BEFORE: Production Schema</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Active in S3
              </span>
            </div>
            <pre className="overflow-x-auto max-h-[450px] leading-relaxed text-slate-300">
              {JSON.stringify(baselineSchema, null, 2)}
            </pre>
          </div>

          <div className="p-4">
            <div className="text-slate-400 font-bold pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
              <span>AFTER: Proposed Candidate</span>
              <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                Evaluated by Step Functions
              </span>
            </div>
            <pre className="overflow-x-auto max-h-[450px] leading-relaxed text-slate-300">
              {JSON.stringify(proposedSchema, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
