import React, { useState } from 'react';
import { DataContract } from '../types';
import { FileCode2, Plus, ArrowRight, Layers, Calendar, Users2 } from 'lucide-react';

interface ContractsPageProps {
  contracts: DataContract[];
  onOpenContract: (contractId: string) => void;
  onRefresh: () => void;
}

export const ContractsPage: React.FC<ContractsPageProps> = ({
  contracts,
  onOpenContract,
  onRefresh
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('E-Commerce');
  const [description, setDescription] = useState('');
  const [schemaText, setSchemaText] = useState(`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "created_at": { "type": "string" }
  },
  "required": ["id", "created_at"]
}`);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(schemaText);
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain, description, schema: parsed })
      });
      if (res.ok) {
        setShowCreateModal(false);
        onRefresh();
      } else {
        alert('Failed to create contract.');
      }
    } catch (err: any) {
      alert('Invalid JSON Schema: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contract Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authoritative JSON Schemas published by upstream services.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Data Contract</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map(contract => (
          <div
            key={contract.contractId}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {contract.domain}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  v{contract.currentVersion}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{contract.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                {contract.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex items-center space-x-1.5">
                  <Users2 className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-700">{contract.consumerCount || 0} Consumers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenContract(contract.contractId)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs border border-slate-200 transition"
              >
                <span>Inspect Contract & Analyze</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Register New Data Contract</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Payment Events"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Domain</label>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  JSON Schema (Draft 2020-12)
                </label>
                <textarea
                  rows={8}
                  value={schemaText}
                  onChange={e => setSchemaText(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
                >
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
