'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import OperationsDashboard from '@/components/OperationsDashboard';
import CandidateTable from '@/components/CandidateTable';
import CandidateKanban from '@/components/CandidateKanban';
import AgentDirectory from '@/components/AgentDirectory';
import AddCandidateModal from '@/components/AddCandidateModal';
import CandidateDrawer from '@/components/CandidateDrawer';
import BatchActionBar from '@/components/BatchActionBar';
import { CandidateRecord, AgentRecord, DashboardMetrics } from '@/lib/types';
import { CheckCircle2, AlertCircle, Table as TableIcon, KanbanSquare } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'candidates' | 'kanban' | 'agents'>('candidates');
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'AGENT'>('ADMIN');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [urgentFilter, setUrgentFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Dashboard Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/metrics');
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch (err) {
      console.error('Metrics fetch error:', err);
    }
  }, []);

  // Fetch Agents
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      const json = await res.json();
      if (json.success) {
        setAgents(json.data);
      }
    } catch (err) {
      console.error('Agents fetch error:', err);
    }
  }, []);

  // Fetch Candidates with Filters
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedAgent && selectedAgent !== 'all') params.append('agentId', selectedAgent);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedStage && selectedStage !== 'ALL') params.append('stage', selectedStage);
      if (urgentFilter) params.append('urgent', urgentFilter);

      const res = await fetch(`/api/candidates?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCandidates(json.data);
      }
    } catch (err) {
      console.error('Candidates fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedAgent, selectedCity, selectedStage, urgentFilter]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
    fetchAgents();
    fetchCandidates();
  }, [fetchMetrics, fetchAgents, fetchCandidates]);

  // Handle Inline Update of Candidate
  const handleUpdateCandidate = async (id: string, updates: Partial<CandidateRecord>) => {
    try {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      setSelectedCandidate((prev) =>
        prev && prev.id === id ? { ...prev, ...updates } : prev
      );

      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Candidate updated');
        fetchMetrics();
      } else {
        showToast(json.error || 'Update failed', 'error');
        fetchCandidates();
      }
    } catch (err) {
      showToast('Network error on update', 'error');
      fetchCandidates();
    }
  };

  // Handle Batch Actions
  const handleBatchAction = async (action: string, city?: string, date?: string) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/candidates/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selectedIds, action, city, date }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setSelectedIds([]);
        fetchCandidates();
        fetchMetrics();
      } else {
        showToast(json.error || 'Batch update failed', 'error');
      }
    } catch (err) {
      showToast('Network error during batch update', 'error');
    }
  };

  // Handle Add Candidate File
  const handleAddCandidate = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Candidate ${json.data.name} created (SL #${json.data.sl})`);
        fetchCandidates();
        fetchMetrics();
        fetchAgents();
        return true;
      } else {
        showToast(json.error || 'Failed to add candidate', 'error');
        return false;
      }
    } catch (err) {
      showToast('Network error adding candidate', 'error');
      return false;
    }
  };

  // Handle Export to Excel
  const handleExportExcel = async () => {
    try {
      showToast('Exporting spreadsheet...');
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          city: selectedCity,
          stage: selectedStage,
          search: searchQuery,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SkyBridge_Candidates_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Excel download ready');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  // Dashboard filter shortcut triggers
  const handleDashboardFilter = (filterType: string, value: string) => {
    if (filterType === 'urgent') {
      setUrgentFilter(value);
      setSelectedStage('ALL');
      setSelectedAgent('all');
      setSelectedCity('all');
    } else if (filterType === 'stage') {
      setSelectedStage(value);
      setUrgentFilter('');
    } else if (filterType === 'city') {
      setSelectedCity(value);
      setUrgentFilter('');
    } else if (filterType === 'agentName') {
      const match = agents.find((a) => a.name.toLowerCase().includes(value.toLowerCase()));
      if (match) setSelectedAgent(match.id);
      setUrgentFilter('');
    }
    setCurrentView('candidates');
  };

  // Checkbox selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification (Responsive position) */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-50 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xl animate-in slide-in-from-top-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span className="truncate">{toastMessage.text}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          setUrgentFilter('');
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        userRole={userRole}
        onToggleRole={() => {
          const next = userRole === 'ADMIN' ? 'AGENT' : 'ADMIN';
          setUserRole(next);
          showToast(`Switched view to ${next === 'ADMIN' ? 'Head Office Administrator' : 'Regional Agent Scope'}`);
        }}
      />

      {/* Main Content Area (pb-20 on mobile for bottom navigation) */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {/* View Header with Sub-tabs if on candidates or kanban */}
        {(currentView === 'candidates' || currentView === 'kanban') && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 sm:mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 sm:gap-2.5">
                <span>Operations Desk</span>
                <span className="rounded-md bg-[#213F7C]/8 px-2 py-0.5 text-xs font-bold text-[#213F7C] border border-[#213F7C]/20 font-mono-numeric">
                  {candidates.length} Files
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Central operations desk • Candidate lookup, milestone tracking, and document verification.
              </p>
            </div>

            {/* View Mode Toggle: Table View vs Pipeline Board (Full-width balanced control on mobile, compact on desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto shadow-2xs">
              <button
                onClick={() => setCurrentView('candidates')}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'candidates'
                    ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Table View</span>
              </button>
              <button
                onClick={() => setCurrentView('kanban')}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'kanban'
                    ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KanbanSquare className="h-3.5 w-3.5" />
                <span>Pipeline Board</span>
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {currentView === 'dashboard' && (
          <OperationsDashboard
            metrics={metrics}
            loading={loading && !metrics}
            onFilterTrigger={handleDashboardFilter}
          />
        )}

        {currentView === 'candidates' && (
          <CandidateTable
            candidates={candidates}
            agents={agents}
            loading={loading}
            onUpdateCandidate={handleUpdateCandidate}
            onBatchAction={handleBatchAction}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onExportExcel={handleExportExcel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedAgent={selectedAgent}
            onAgentChange={setSelectedAgent}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedStage={selectedStage}
            onStageChange={setSelectedStage}
            onOpenDrawer={(c) => {
              setSelectedCandidate(c);
              setIsDrawerOpen(true);
            }}
            urgentFilter={urgentFilter}
            onUrgentFilterChange={setUrgentFilter}
          />
        )}

        {currentView === 'kanban' && (
          <CandidateKanban
            candidates={candidates}
            onUpdateCandidate={handleUpdateCandidate}
          />
        )}

        {currentView === 'agents' && (
          <AgentDirectory
            agents={agents}
            onSelectAgentToFilter={(agentId) => {
              setSelectedAgent(agentId);
              setCurrentView('candidates');
            }}
            onRefreshAgents={fetchAgents}
            onRefreshCandidates={fetchCandidates}
            onShowToast={showToast}
            userRole={userRole}
          />
        )}
      </main>

      {/* Batch Actions Floating Bar */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBatchAction={handleBatchAction}
      />

      {/* Add Candidate Modal Dialog */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        agents={agents}
        onAddCandidate={handleAddCandidate}
      />

      {/* Slide-Over Candidate File Inspector Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateCandidate={handleUpdateCandidate}
        agents={agents}
      />
    </div>
  );
}
