import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, ShieldAlert, CheckCircle2, Flame, ArrowUpRight } from 'lucide-react';

interface StreamEvent {
  id: string;
  order_id: string;
  consumer: string;
  status: 'BLOCKED' | 'PASSED';
  reason: string;
  timestamp: string;
}

export const LiveEventStreamSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [stats, setStats] = useState({ total: 0, blocked: 0, passed: 0 });

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        const id = Math.random().toString(36).substring(2, 8);
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const consumers = [
          { name: 'Billing Service', breaking: true, reason: 'Field customer_id missing' },
          { name: 'Analytics Warehouse', breaking: true, reason: 'Type mismatch: total is string' },
          { name: 'Customer Notification Service', breaking: false, reason: 'Valid contract match' }
        ];

        const target = consumers[Math.floor(Math.random() * consumers.length)];
        const isBlocked = target.breaking;

        const newEvent: StreamEvent = {
          id,
          order_id: orderId,
          consumer: target.name,
          status: isBlocked ? 'BLOCKED' : 'PASSED',
          reason: target.reason,
          timestamp: new Date().toLocaleTimeString()
        };

        setEvents(prev => [newEvent, ...prev.slice(0, 24)]);
        setStats(prev => ({
          total: prev.total + 1,
          blocked: isBlocked ? prev.blocked + 1 : prev.blocked,
          passed: !isBlocked ? prev.passed + 1 : prev.passed
        }));
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-orange-400">
              Live Event Firehose Firewall Stream
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Real-Time Ingestion Contract Inspection
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Pause Live Stream' : 'Start Live Firehose'}</span>
          </button>
          <button
            onClick={() => {
              setEvents([]);
              setStats({ total: 0, blocked: 0, passed: 0 });
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs font-semibold"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Real-time Ticker Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Stream Packets</span>
          <span className="text-xl font-bold text-white font-mono mt-0.5 block">{stats.total}</span>
        </div>
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60">
          <span className="text-[10px] uppercase text-rose-400 font-bold block">Breaking Drops (Firewalled)</span>
          <span className="text-xl font-bold text-rose-400 font-mono mt-0.5 block">{stats.blocked}</span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/60">
          <span className="text-[10px] uppercase text-emerald-400 font-bold block">Safe Conduits (Delivered)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">{stats.passed}</span>
        </div>
      </div>

      {/* Stream Event Log */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-3 max-h-64 overflow-y-auto space-y-1.5 text-[11px]">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            Click "Start Live Firehose" above to watch real-time data packets evaluated by the firewall.
          </div>
        ) : (
          events.map(evt => (
            <div
              key={evt.id}
              className={`p-2 rounded-xl flex items-center justify-between transition ${
                evt.status === 'BLOCKED'
                  ? 'bg-rose-950/30 border border-rose-900/40 text-rose-300'
                  : 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-500 text-[10px]">{evt.timestamp}</span>
                <span className="font-bold text-white">{evt.order_id}</span>
                <span className="text-slate-400">→</span>
                <span className="font-semibold text-slate-200">{evt.consumer}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 italic hidden sm:inline">{evt.reason}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    evt.status === 'BLOCKED'
                      ? 'bg-rose-900/80 text-rose-200'
                      : 'bg-emerald-900/80 text-emerald-200'
                  }`}
                >
                  {evt.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
