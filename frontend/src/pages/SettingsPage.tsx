import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Shield, Activity, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<{ status: string; service: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    const res = await api.getHealth();
    setHealth(res);
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Health Status</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify runtime connectivity with AWS Serverless API and DynamoDB tables.
        </p>
      </div>

      {/* Health Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">API Health Status</h3>
              <p className="text-xs text-slate-500">Live heartbeat from /api/health endpoint</p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Now</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700 space-y-1">
          <div>Status: <span className="font-bold text-emerald-600">{health?.status || 'Unknown'}</span></div>
          <div>Service: <span className="font-semibold text-slate-900">{health?.service || 'SchemaShield'}</span></div>
          <div>Region: <span className="text-slate-600">us-east-1</span></div>
          <div>Runtime: <span className="text-slate-600">AWS Lambda (Python 3.12)</span></div>
        </div>
      </div>

      {/* Configuration Defaults */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Security & Reliability Configuration</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-semibold text-slate-900 block mb-1">Least-Privilege IAM</span>
            <p className="text-slate-500">Functions are scoped strictly to individual S3 keys and DynamoDB table ARNs.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-semibold text-slate-900 block mb-1">Encrypted S3 Storage</span>
            <p className="text-slate-500">AES-256 server-side encryption enabled with Public Access Block active.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-semibold text-slate-900 block mb-1">Step Functions Map Concurrency</span>
            <p className="text-slate-500">Bounded parallelism (MaxConcurrency: 5) prevents downstream throttling.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="font-semibold text-slate-900 block mb-1">Deterministic Verification</span>
            <p className="text-slate-500">JSON Schema Draft 2020-12 rules evaluated with 100% testable logic.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
