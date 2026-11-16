import React from 'react';
import { Network, Server, Database, Cloud, Zap, Workflow, ShieldCheck } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">AWS Serverless Architecture</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Weekend Challenge: No Pipeline, No Problem — Production-grade Serverless Contract Firewall
        </p>
      </div>

      {/* Architecture Visual Diagram */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">
          End-to-End System Topology
        </h3>
        <pre className="font-mono text-xs text-slate-300 leading-relaxed">
{`                        END USER / BROWSER
                                |
                                v
                     Amazon CloudFront (CDN)
                                |
                                v
                    Private S3 Frontend Bucket
                      (React + TypeScript)
                                |
                                v
                      Amazon API Gateway
                                |
                                v
                         API Lambda
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
       Amazon DynamoDB      Amazon S3       AWS Step Functions
     (Contracts/Analyses) (Schemas/Reports)   State Machine
                                                   |
                                                   v
                                          LoadAnalysisContext
                                                   |
                                                   v
                                             CompareSchemas
                                                   |
                                                   v
                                             FetchConsumers
                                                   |
                                                   v
                                         Parallel Map State
                                         (Bounded Concurrency)
                                                   |
                             +---------------------+---------------------+
                             |                     |                     |
                             v                     v                     v
                          Billing              Analytics            Notification
                          Checker               Checker               Checker
                             |                     |                     |
                             +---------------------+---------------------+
                                                   |
                                                   v
                                            AggregateResults
                                                   |
                                 +-----------------+-----------------+
                                 |                                   |
                                 v                                   v
                          Amazon DynamoDB                        Amazon S3
                           (Save Status)                       (Save Report)
                                 |                                   |
                                 +-----------------+-----------------+
                                                   |
                                                   v
                                          Frontend Dashboard`}
        </pre>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <Workflow className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">AWS Step Functions</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Orchestrates schema diff, consumer retrieval, and parallel Map state execution. Decouples API latency from deep compatibility verification.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Amazon DynamoDB</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            On-demand pay-per-request tables for contracts, consumers, and analysis history. Scales to zero with zero idle maintenance cost.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">AWS Lambda</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Modular Python 3.12 functions using a shared Core Engine layer to execute deterministic schema diff and compatibility analysis.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Cloud className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Amazon S3</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated private bucket with server-side encryption and public access blocking. Stores immutable schema versions and durable analysis reports.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Amazon API Gateway</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fully managed REST endpoint with CORS preflight, request validation, and least-privilege IAM proxy integration.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Amazon CloudFront + OAC</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Global edge CDN delivering the compiled React single-page application directly from a private S3 origin via Origin Access Control.
          </p>
        </div>
      </div>

      {/* No Pipeline, No Problem Philosophy */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h4 className="font-bold text-slate-900 text-sm mb-2">
          Challenge Theme: "No Pipeline, No Problem"
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          SchemaShield was designed specifically to be deployed without maintaining complex CI/CD infrastructure, runner clusters, or third-party workflow agents.
          Using standard AWS Serverless Application Model (SAM) and CloudFormation, the entire architecture (Lambda, S3, DynamoDB, Step Functions, API Gateway, CloudFront)
          builds and deploys reproducibly with a single command: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px]">./scripts/deploy.sh</code>.
        </p>
      </div>
    </div>
  );
};
