import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Clock, Zap, Sparkles } from 'lucide-react';

export const RoiCalculatorPage: React.FC = () => {
  const [dailyEvents, setDailyEvents] = useState<number>(2000000); // 2M
  const [dependentServices, setDependentServices] = useState<number>(6);
  const [outageHours, setOutageHours] = useState<number>(2.5);
  const [revenueLossPerHour, setRevenueLossPerHour] = useState<number>(45000);

  // Calculations
  const totalFinancialRisk = Math.round(outageHours * revenueLossPerHour);
  const engineeringHoursSaved = Math.round(dependentServices * 4 * outageHours);
  const serverlessMonthlyCost = 0.85; // AWS Lambda + DynamoDB scale-to-zero estimate
  const roiPercentage = Math.round((totalFinancialRisk / (serverlessMonthlyCost * 12)) * 100);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Business Value & Downtime Prevention</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Data Downtime ROI & Incident Cost Calculator
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Quantify the tangible business impact of preventing breaking schema evolution in production before upstream deployments reach production consumers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Box */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Enterprise Organization Parameters</span>
            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Interactive
            </span>
          </h3>

          {/* Slider 1: Daily Events */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span>Daily Event Volume</span>
              <span className="text-sm font-bold text-blue-600 font-mono">
                {(dailyEvents / 1000000).toFixed(1)} Million events/day
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={100000}
              value={dailyEvents}
              onChange={e => setDailyEvents(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Dependent Microservices */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span>Downstream Dependent Services</span>
              <span className="text-sm font-bold text-indigo-600 font-mono">
                {dependentServices} Services
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={25}
              step={1}
              value={dependentServices}
              onChange={e => setDependentServices(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Slider 3: Outage Duration */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span>Average Outage MTTR Duration</span>
              <span className="text-sm font-bold text-amber-600 font-mono">
                {outageHours.toFixed(1)} Hours
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.5}
              value={outageHours}
              onChange={e => setOutageHours(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Slider 4: Revenue per Hour */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span>Revenue At Risk per Hour of Outage</span>
              <span className="text-sm font-bold text-rose-600 font-mono">
                ${revenueLossPerHour.toLocaleString()} / hr
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={150000}
              step={5000}
              value={revenueLossPerHour}
              onChange={e => setRevenueLossPerHour(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated ROI Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-7 shadow-2xl border border-slate-700 flex flex-col justify-between min-h-[420px]">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
              SchemaShield Financial Defense Impact
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-6">
              ${totalFinancialRisk.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 block mt-1">
                Direct Outage Costs Avoided per Incident
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 font-medium block">Triage Hours Saved</span>
                <span className="text-2xl font-bold text-emerald-400 mt-0.5 block">
                  {engineeringHoursSaved} Hours
                </span>
                <span className="text-[10px] text-slate-400">Cross-team on-call triage</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 font-medium block">Serverless Monthly Cost</span>
                <span className="text-2xl font-bold text-blue-400 mt-0.5 block">
                  ${serverlessMonthlyCost}
                </span>
                <span className="text-[10px] text-slate-400">AWS Lambda & DynamoDB</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Calculated Serverless ROI:</span>
            </div>
            <span className="font-mono font-black text-emerald-400 text-base">
              {roiPercentage.toLocaleString()}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
