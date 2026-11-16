import React, { useState } from 'react';
import { DownstreamConsumer, DataContract } from '../types';
import { Users2, Plus, ArrowRight, ShieldCheck, Server } from 'lucide-react';

interface ConsumersPageProps {
  consumers: DownstreamConsumer[];
  contracts: DataContract[];
  onOpenContract: (contractId: string) => void;
}

export const ConsumersPage: React.FC<ConsumersPageProps> = ({
  consumers,
  contracts,
  onOpenContract
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Downstream Consumer Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered microservices, data warehouses, and notification pipelines that consume upstream schemas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consumers.map(consumer => {
          const parentContract = contracts.find(c => c.contractId === consumer.contractId);
          return (
            <div
              key={consumer.consumerId}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {consumer.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {consumer.consumerId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{consumer.name}</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Bound to producer contract:{' '}
                  <span className="font-semibold text-slate-700">
                    {parentContract?.name || consumer.contractId}
                  </span>
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block mb-1">
                    Guaranteed Requirements
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {consumer.expected_schema?.required?.map((req: string) => (
                      <span
                        key={req}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px]"
                      >
                        {req}
                      </span>
                    )) || <span className="text-xs text-slate-400">None specified</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenContract(consumer.contractId)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-xs border border-slate-200 transition"
              >
                <span>Inspect in Contract Topology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
