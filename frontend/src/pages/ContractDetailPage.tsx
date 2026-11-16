import React, { useState } from 'react';
import { DataContract, DownstreamConsumer } from '../types';
import {
  ArrowLeft,
  Play,
  Sparkles,
  Users2,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Code2
} from 'lucide-react';

interface ContractDetailPageProps {
  contract: DataContract;
  consumers: DownstreamConsumer[];
  onBack: () => void;
  onRunAnalysis: (proposedSchema: any) => void;
  isAnalyzing: boolean;
}

export const ContractDetailPage: React.FC<ContractDetailPageProps> = ({
  contract,
  consumers,
  onBack,
  onRunAnalysis,
  isAnalyzing
}) => {
  const currentSchemaString = JSON.stringify(contract.schema || {}, null, 2);

  // Breaking Schema Sample per Section 8 Demonstration Scenario
  const sampleBreakingSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      order_id: { type: 'string' },
      buyer_id: { type: 'string' }, // renamed customer_id -> buyer_id
      total: { type: 'string' }, // changed number -> string
      currency: { type: 'string', enum: ['USD'] }, // narrowed enum: PKR removed
      created_at: { type: 'string', format: 'date-time' },
      customer_email: { type: 'string' },
      discount_code: { type: 'string' } // optional added
    },
    required: ['order_id', 'buyer_id', 'total', 'currency', 'created_at', 'customer_email'],
    additionalProperties: false
  };

  const [proposedSchemaText, setProposedSchemaText] = useState(
    JSON.stringify(sampleBreakingSchema, null, 2)
  );

  const handleSimulateBreaking = () => {
    setProposedSchemaText(JSON.stringify(sampleBreakingSchema, null, 2));
  };

  const handleSimulateSafe = () => {
    const safeSchema = JSON.parse(JSON.stringify(contract.schema || {}));
    if (safeSchema.properties) {
      safeSchema.properties.promo_notes = { type: 'string' };
    }
    setProposedSchemaText(JSON.stringify(safeSchema, null, 2));
  };

  const handleSubmitAnalysis = () => {
    try {
      const parsed = JSON.parse(proposedSchemaText);
      onRunAnalysis(parsed);
    } catch (e: any) {
      alert('Invalid JSON Schema format: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{contract.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {contract.domain}
              </span>
              <span className="text-xs font-mono text-slate-500">v{contract.currentVersion}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{contract.description}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Schemas & Consumers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registered Consumers */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Users2 className="w-4 h-4 text-indigo-600" />
              <span>Registered Downstream Consumers ({consumers.length})</span>
            </h3>
            <div className="space-y-3">
              {consumers.map(consumer => (
                <div
                  key={consumer.consumerId}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">{consumer.name}</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {consumer.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Required fields:{' '}
                    <span className="font-semibold text-slate-700">
                      {consumer.expected_schema?.required?.join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baseline Production Schema Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-emerald-600" />
                <span>Active Production Schema</span>
              </h3>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Live in S3
              </span>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-80">
              {currentSchemaString}
            </pre>
          </div>
        </div>

        {/* Right Column: Proposed Schema Analyzer */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <span>Proposed Schema Change (Draft)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate schema evolution to evaluate blast radius before live release.
                </p>
              </div>

              {/* Pre-packaged Scenario Actions */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSimulateBreaking}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Load Breaking Scenario</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateSafe}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Load Safe Scenario</span>
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="mb-4">
              <textarea
                rows={16}
                value={proposedSchemaText}
                onChange={e => setProposedSchemaText(e.target.value)}
                className="w-full font-mono text-xs p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Orchestrates Step Functions Map state to validate consumers in parallel.
            </p>
            <button
              onClick={handleSubmitAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAnalyzing ? 'Executing Step Functions...' : 'Run Contract Firewall Analysis'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
