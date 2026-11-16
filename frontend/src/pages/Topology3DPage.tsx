import React from 'react';
import { ThreeCloudTopology } from '../components/ThreeCloudTopology';
import { ShieldAlert, Zap, Cpu, Server, Network, Sparkles, CheckCircle2, PlayCircle } from 'lucide-react';

interface Topology3DPageProps {
  onQuickDemo: () => void;
  isDemoLoading: boolean;
}

export const Topology3DPage: React.FC<Topology3DPageProps> = ({ onQuickDemo, isDemoLoading }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>WebGL 3D Cybernetic Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            3D Holographic Blast Radius & Serverless Topology
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Real-time interactive 3D WebGL visualization of the data contract boundary. Inspect upstream candidate schemas, Step Functions Map state orchestration, and downstream consumer blast radius impact in a live 3D cybernetic space.
          </p>
        </div>

        <button
          onClick={onQuickDemo}
          disabled={isDemoLoading}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
        >
          <PlayCircle className="w-4 h-4 fill-current" />
          <span>{isDemoLoading ? 'Analyzing Blast Radius in AWS...' : '🛡️ Run Blast Radius Audit'}</span>
        </button>
      </div>

      {/* Main 3D Canvas */}
      <ThreeCloudTopology />

      {/* Cloud Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Deterministic JSON Schema Engine</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Draft 2020-12 mathematical validation. Evaluates type narrowing, enum truncation, and required field guarantees with 0% AI hallucination risk and sub-10ms execution.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
            <Network className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Bounded Step Functions Map State</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fan-out consumer analysis scales across hundreds of microservices concurrently. Prevents 29s API Gateway timeouts and isolates failing consumer evaluations.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">100% Serverless Scale-to-Zero</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero idle containers, zero persistent compute. DynamoDB on-demand, private S3 Origin Access Control, and Amazon CloudFront CDN cost $0.00 when not in use.
          </p>
        </div>
      </div>
    </div>
  );
};
