import React, { useState } from 'react';
import { Terminal, Play, GitPullRequest, ShieldAlert, CheckCircle2, Copy, Check } from 'lucide-react';

export const PipelineSimulationPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '# SchemaShield CLI & CI/CD Pipeline Simulator',
    '# Type or click "Simulate Pre-Merge PR Gate" below to see automated pipeline enforcement.'
  ]);

  const handleSimulatePipeline = () => {
    setTerminalRunning(true);
    setTerminalOutput(['$ schemashield verify --contract order-events --proposal ./proposed-schema.json --strict']);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '  [1/4] Authenticating with AWS us-east-1 and fetching baseline from S3...',
        '  [2/4] Executing deterministic schema diff (JSON Schema Draft 2020-12)...'
      ]);
    }, 700);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '  [3/4] Triggering AWS Step Functions Map State across 3 registered consumers...',
        '        -> Billing Service: BREAKING (Missing required field: $.customer_id)',
        '        -> Analytics Warehouse: BREAKING (Type mismatch: $.total expected number, got string)',
        '        -> Customer Notification Service: COMPATIBLE (order_id & email preserved)'
      ]);
    }, 1800);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '  [4/4] Final Release Verdict: BLOCK RELEASE (Risk Score: 100/100)',
        '--------------------------------------------------------------------------',
        '  [BLOCKED] CI/CD Pipeline Gate Triggered: Pull Request #142 cannot be merged.',
        '  Remediation: Maintain backward-compatible alias for buyer_id and keep total numeric.',
        '  Process exited with code 1.'
      ]);
      setTerminalRunning(false);
    }, 2800);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pipelineYaml = `# .github/workflows/data-contract-firewall.yml
# SchemaShield Enterprise Pre-Merge Contract Verification Gate
name: SchemaShield Pre-Merge Gate

on:
  pull_request:
    paths:
      - 'schemas/**'

jobs:
  verify-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify Contract Drift via AWS Step Functions
        run: |
          curl -X POST https://3r48tr3ynb.execute-api.us-east-1.amazonaws.com/prod/api/contracts/order-events/analyze \\
            -H "Content-Type: application/json" \\
            -d @schemas/proposed-order-events.json
`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Automated Pipeline & CLI Gatekeeper</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          CI/CD & Pre-Merge Pipeline Simulator
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          See how SchemaShield acts as an automated pull-request gate in real engineering teams.
          Whether run manually in the Studio or automatically inside a Git commit hook, the exact same AWS Serverless engine blocks breaking releases.
        </p>
      </div>

      {/* Interactive CLI Terminal Emulator */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-400 font-semibold text-xs ml-2">schemashield-cli v1.0.0 (AWS Serverless Engine)</span>
          </div>
          <button
            onClick={handleSimulatePipeline}
            disabled={terminalRunning}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{terminalRunning ? 'Simulating...' : 'Simulate Pre-Merge PR Gate'}</span>
          </button>
        </div>

        <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-1.5 leading-relaxed text-slate-300">
          {terminalOutput.map((line, idx) => (
            <div
              key={idx}
              className={`${
                line.includes('[FAIL]') || line.includes('[BLOCKED]') || line.includes('code 1')
                  ? 'text-rose-400 font-bold'
                  : line.includes('[PASS]')
                  ? 'text-emerald-400 font-bold'
                  : line.startsWith('$')
                  ? 'text-white font-bold'
                  : ''
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Integration Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">GitHub Actions / CI Pre-Merge Gate</h4>
              <button
                onClick={() => copyCode(pipelineYaml)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy YAML'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {pipelineYaml}
            </pre>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Blocks pull requests automatically if downstream consumers are incompatible.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Direct cURL API Endpoint (Serverless Call)</h4>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# Submit any schema for Step Functions analysis:
curl -X POST \\
  https://3r48tr3ynb.execute-api.us-east-1.amazonaws.com/prod/api/contracts/contract-order-events/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"proposed_schema": { ... }}'

# Response (202 Accepted):
# {"analysis_id": "analysis-6b53e995", "status": "RUNNING"}`}
            </pre>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Pure REST interface accessible by any backend microservice or script.
          </p>
        </div>
      </div>
    </div>
  );
};
