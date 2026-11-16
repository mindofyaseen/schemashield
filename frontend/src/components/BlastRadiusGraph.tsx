import React, { useState } from 'react';
import { ConsumerResult } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Info, Wrench } from 'lucide-react';

interface BlastRadiusGraphProps {
  contractName: string;
  consumerResults: ConsumerResult[];
}

export const BlastRadiusGraph: React.FC<BlastRadiusGraphProps> = ({
  contractName,
  consumerResults
}) => {
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerResult | null>(
    consumerResults.length > 0 ? consumerResults[0] : null
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BREAKING':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          indicator: 'bg-rose-500',
          shadow: 'shadow-rose-100'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          indicator: 'bg-amber-500',
          shadow: 'shadow-amber-100'
        };
      case 'COMPATIBLE':
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          indicator: 'bg-emerald-500',
          shadow: 'shadow-emerald-100'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Downstream Blast Radius & Dependency Topology</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any downstream consumer node to inspect breaking changes, affected fields, and recommended fixes.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-600">Breaking</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-600">Warning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-600">Compatible</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Topology Visualizer */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 min-h-[380px] flex flex-col justify-center">
          {/* Producer Node */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center space-x-3 w-64 justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
                  Producer Contract
                </span>
                <span className="text-sm font-semibold">{contractName}</span>
              </div>
            </div>
          </div>

          {/* Connecting Branches (SVG) */}
          <div className="w-full flex justify-center mb-4">
            <svg width="100%" height="40" viewBox="0 0 500 40" preserveAspectRatio="none" className="overflow-visible">
              <path
                d="M 250 0 L 250 20 M 250 20 L 80 20 L 80 40 M 250 20 L 250 40 M 250 20 L 420 20 L 420 40"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4 2"
              />
            </svg>
          </div>

          {/* Consumer Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {consumerResults.map(consumer => {
              const colors = getStatusColor(consumer.status);
              const isSelected = selectedConsumer?.consumer_id === consumer.consumer_id;
              return (
                <button
                  key={consumer.consumer_id}
                  onClick={() => setSelectedConsumer(consumer)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 relative ${
                    isSelected
                      ? `${colors.border} ${colors.bg} ring-2 ring-offset-1 ring-blue-500 shadow-md`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {consumer.consumer_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}
                    >
                      {consumer.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {consumer.consumer_name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {consumer.issues.length === 0
                      ? 'No contract conflicts'
                      : `${consumer.issues.length} issue(s) detected`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Consumer Inspector Detail Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          {selectedConsumer ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Consumer Inspector
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{selectedConsumer.consumer_name}</h4>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    getStatusColor(selectedConsumer.status).badge
                  }`}
                >
                  {selectedConsumer.status}
                </span>
              </div>

              {/* Status Explanation */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Impact Assessment
                </label>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {selectedConsumer.explanation}
                </div>
              </div>

              {/* Affected Fields */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Affected Schema Paths
                </label>
                {selectedConsumer.affected_fields.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConsumer.affected_fields.map(field => (
                      <span
                        key={field}
                        className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs font-semibold"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>None. All expected fields are satisfied.</span>
                  </p>
                )}
              </div>

              {/* Issues List */}
              {selectedConsumer.issues.length > 0 && (
                <div className="mb-4">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Detailed Contract Issues ({selectedConsumer.issues.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedConsumer.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px] text-slate-800 font-bold">
                          <span>{issue.field_path}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] ${
                              issue.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Fix */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center space-x-1">
                  <Wrench className="w-3 h-3 text-blue-600" />
                  <span>Recommended Fix</span>
                </label>
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                  {selectedConsumer.recommended_fix}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a consumer to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
