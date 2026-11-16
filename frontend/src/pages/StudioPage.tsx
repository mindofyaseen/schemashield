import React, { useState } from 'react';
import { Upload, FileCode2, Play, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Layers, Sliders } from 'lucide-react';
import { BeforeAfterDiff } from '../components/BeforeAfterDiff';
import { BlastRadiusGraph } from '../components/BlastRadiusGraph';
import { SchemaDiffViewer } from '../components/SchemaDiffViewer';
import { AnalysisReport } from '../types';

interface StudioPageProps {
  onRunCustomAnalysis: (baseline: any, proposed: any, consumers: any[]) => Promise<AnalysisReport>;
}

export const StudioPage: React.FC<StudioPageProps> = ({ onRunCustomAnalysis }) => {
  // Preset templates
  const defaultGoodSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      order_id: { type: "string" },
      customer_id: { type: "string" },
      total: { type: "number" },
      currency: { type: "string", enum: ["USD", "PKR"] },
      created_at: { type: "string", format: "date-time" },
      customer_email: { type: "string" }
    },
    required: ["order_id", "customer_id", "total", "currency", "created_at", "customer_email"],
    additionalProperties: false
  };

  const defaultBadSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      order_id: { type: "string" },
      buyer_id: { type: "string" }, // RENAMED customer_id -> buyer_id
      total: { type: "string" }, // MUTATED number -> string
      currency: { type: "string", enum: ["USD"] }, // NARROWED enum
      created_at: { type: "string", format: "date-time" },
      customer_email: { type: "string" },
      discount_code: { type: "string" } // OPTIONAL added
    },
    required: ["order_id", "buyer_id", "total", "currency", "created_at", "customer_email"],
    additionalProperties: false
  };

  const defaultSafeSchema = {
    ...defaultGoodSchema,
    properties: {
      ...defaultGoodSchema.properties,
      notes: { type: "string" }
    }
  };

  const defaultConsumers = [
    {
      consumer_id: "c-billing",
      consumer_name: "Billing Service",
      consumer_type: "payment_service",
      expected_schema: {
        type: "object",
        properties: {
          order_id: { type: "string" },
          customer_id: { type: "string" },
          total: { type: "number" },
          currency: { type: "string" }
        },
        required: ["order_id", "customer_id", "total", "currency"]
      }
    },
    {
      consumer_id: "c-analytics",
      consumer_name: "Analytics Warehouse",
      consumer_type: "warehouse",
      expected_schema: {
        type: "object",
        properties: {
          order_id: { type: "string" },
          customer_id: { type: "string" },
          total: { type: "number" },
          created_at: { type: "string" }
        },
        required: ["order_id", "customer_id", "total", "created_at"]
      }
    },
    {
      consumer_id: "c-notify",
      consumer_name: "Customer Notification Service",
      consumer_type: "notification_service",
      expected_schema: {
        type: "object",
        properties: {
          order_id: { type: "string" },
          customer_email: { type: "string" }
        },
        required: ["order_id", "customer_email"]
      }
    }
  ];

  const [goodText, setGoodText] = useState(JSON.stringify(defaultGoodSchema, null, 2));
  const [badText, setBadText] = useState(JSON.stringify(defaultBadSchema, null, 2));
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // File Upload Handlers
  const handleUploadGood = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setGoodText(JSON.stringify(json, null, 2));
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleUploadBad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setBadText(JSON.stringify(json, null, 2));
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecute = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const goodParsed = JSON.parse(goodText);
      const badParsed = JSON.parse(badText);
      const res = await onRunCustomAnalysis(goodParsed, badParsed, defaultConsumers);
      setReport(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>Interactive Manual Testing Lab</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Schema Verification Studio & Manual Upload Lab
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Upload or paste any baseline schema (sahi wala) and proposed candidate schema (bad wala).
          Inspect exact before-and-after differences, evaluate downstream blast radius, and test changes before pushing to your pipeline.
        </p>
      </div>

      {/* Side-by-Side Upload Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Baseline / Good Schema */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 1: Baseline Contract
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Original / Working Schema (Sahi Wala)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json</span>
                  <input type="file" accept=".json" onChange={handleUploadGood} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setGoodText(JSON.stringify(defaultGoodSchema, null, 2))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Reset
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={goodText}
              onChange={e => setGoodText(e.target.value)}
              className="w-full font-mono text-xs p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Currently active schema guaranteed in production.
          </p>
        </div>

        {/* Box 2: Proposed / Bad Schema */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Step 2: Candidate Mutation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Proposed Schema Change (Bad / Changed Wala)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json</span>
                  <input type="file" accept=".json" onChange={handleUploadBad} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setBadText(JSON.stringify(defaultBadSchema, null, 2))}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition border border-rose-200"
                >
                  Load Candidate Drift (v1.1.0-rc)
                </button>
                <button
                  type="button"
                  onClick={() => setBadText(JSON.stringify(defaultSafeSchema, null, 2))}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition border border-emerald-200"
                >
                  Load Compatible Release (v1.0.1)
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={badText}
              onChange={e => setBadText(e.target.value)}
              className="w-full font-mono text-xs p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Proposed modifications being evaluated prior to release.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold">Ready to analyze contract compatibility?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Triggers deterministic schema diff & parallel validation against all 3 registered downstream consumers.
          </p>
        </div>
        <button
          onClick={handleExecute}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg transition disabled:opacity-50 shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{loading ? 'Evaluating Contract...' : '⚡ Run Data Contract Firewall Analysis'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
          Error: {errorMessage}
        </div>
      )}

      {/* Results Section */}
      {report && (
        <div className="space-y-8 pt-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Studio Analysis Result
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Release Verdict: {report.release_verdict}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-slate-900">{report.risk_score}</span>
                <span className="text-slate-400 font-bold text-sm"> / 100 Risk</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3 font-medium leading-relaxed">
              {report.summary_explanation}
            </p>
          </div>

          {/* True Before vs After Diff Component */}
          <BeforeAfterDiff
            baselineSchema={JSON.parse(goodText)}
            proposedSchema={JSON.parse(badText)}
            findings={report.schema_findings}
          />

          {/* Blast Radius Graph */}
          <BlastRadiusGraph
            contractName="Custom Schema Studio"
            consumerResults={report.consumer_results}
          />
        </div>
      )}
    </div>
  );
};
