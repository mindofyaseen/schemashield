import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContractDetailPage } from './pages/ContractDetailPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { HistoryPage } from './pages/HistoryPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ConsumersPage } from './pages/ConsumersPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import { DataContract, DownstreamConsumer, AnalysisRecord, AnalysisReport } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [contracts, setContracts] = useState<DataContract[]>([]);
  const [consumers, setConsumers] = useState<DownstreamConsumer[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  // Initial Data Load
  const refreshData = async () => {
    try {
      const [fetchedContracts, fetchedAnalyses] = await Promise.all([
        api.listContracts(),
        api.listAnalyses()
      ]);
      setContracts(fetchedContracts);
      setAnalyses(fetchedAnalyses);

      // If contracts exist, load consumers for all
      if (fetchedContracts.length > 0) {
        const allConsumers: DownstreamConsumer[] = [];
        for (const c of fetchedContracts) {
          const cConsumers = await api.listConsumers(c.contractId);
          allConsumers.push(...cConsumers);
        }
        setConsumers(allConsumers);
      }
    } catch (e) {
      console.warn('Initial load error:', e);
      setApiConnected(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 1-Click Interactive Demo Loader
  const handleQuickDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await api.seedDemo();
      await refreshData();
      // Automatically open the demo contract
      setSelectedContractId(res.contract_id);
      setCurrentTab('contract-detail');
    } catch (e) {
      alert('Failed to load interactive demo: ' + e);
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Run Analysis Execution
  const handleRunAnalysis = async (proposedSchema: any) => {
    if (!selectedContractId) return;
    setIsAnalyzing(true);
    try {
      const res = await api.startAnalysis(selectedContractId, proposedSchema);
      const report = await api.getReport(res.analysis_id);
      if (report) {
        setActiveReport(report);
        setCurrentTab('analysis');
      }
      await refreshData();
    } catch (e) {
      alert('Analysis execution error: ' + e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open Contract Detail
  const handleOpenContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setCurrentTab('contract-detail');
  };

  // Open Analysis Report
  const handleOpenAnalysis = async (analysisId: string) => {
    const report = await api.getReport(analysisId);
    if (report) {
      setActiveReport(report);
      setCurrentTab('analysis');
    } else {
      alert(`Report for '${analysisId}' is not yet available or failed.`);
    }
  };

  const selectedContract = contracts.find(c => c.contractId === selectedContractId) || contracts[0];
  const contractConsumers = consumers.filter(c => c.contractId === selectedContract?.contractId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={tab => {
          setSelectedContractId(null);
          setCurrentTab(tab);
        }}
        onQuickDemo={handleQuickDemo}
        isDemoLoading={isDemoLoading}
      />

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar
          currentTab={currentTab}
          onQuickDemo={handleQuickDemo}
          onRunAnalysis={() => {
            if (contracts.length > 0) {
              handleOpenContract(contracts[0].contractId);
            } else {
              handleQuickDemo();
            }
          }}
          isDemoLoading={isDemoLoading}
          apiConnected={apiConnected}
        />

        <main className="flex-1 p-8 mt-16 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              contracts={contracts}
              analyses={analyses}
              onNavigateTab={setCurrentTab}
              onOpenContract={handleOpenContract}
              onOpenAnalysis={handleOpenAnalysis}
              onQuickDemo={handleQuickDemo}
              isDemoLoading={isDemoLoading}
            />
          )}

          {currentTab === 'contracts' && (
            <ContractsPage
              contracts={contracts}
              onOpenContract={handleOpenContract}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'consumers' && (
            <ConsumersPage
              consumers={consumers}
              contracts={contracts}
              onOpenContract={handleOpenContract}
            />
          )}

          {currentTab === 'contract-detail' && selectedContract && (
            <ContractDetailPage
              contract={selectedContract}
              consumers={contractConsumers}
              onBack={() => setCurrentTab('contracts')}
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {currentTab === 'analysis' && activeReport && (
            <AnalysisPage
              report={activeReport}
              onBack={() => setCurrentTab('overview')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              analyses={analyses}
              onOpenAnalysis={handleOpenAnalysis}
            />
          )}

          {currentTab === 'architecture' && <ArchitecturePage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};
