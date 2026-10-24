'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Copy,
  Check,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { CandidateRecord, AgentRecord } from '@/lib/types';

interface CandidateTableProps {
  candidates: CandidateRecord[];
  agents: AgentRecord[];
  loading: boolean;
  onUpdateCandidate: (id: string, updates: Partial<CandidateRecord>) => Promise<void>;
  onBatchAction: (action: string, city?: string, date?: string) => Promise<void>;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onExportExcel: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAgent: string;
  onAgentChange: (id: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  onOpenDrawer: (candidate: CandidateRecord) => void;
  urgentFilter: string;
  onUrgentFilterChange: (urgent: string) => void;
}

const CITIES = ['Strumica', 'Tetovo', 'Skopje', 'Kumanovo', 'Shtip', 'Bitola'];

export default function CandidateTable({
  candidates,
  agents,
  loading,
  onUpdateCandidate,
  onBatchAction,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onExportExcel,
  searchQuery,
  onSearchChange,
  selectedAgent,
  onAgentChange,
  selectedCity,
  onCityChange,
  selectedStage,
  onStageChange,
  onOpenDrawer,
  urgentFilter,
  onUrgentFilterChange,
}: CandidateTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justUpdatedId, setJustUpdatedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showInsightsSummary, setShowInsightsSummary] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 25;

  // Keyboard shortcut: '/' focuses search, Escape clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        onSearchChange('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  const handleCopyPassport = (passport: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(passport);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCellUpdate = async (id: string, updates: Partial<CandidateRecord>, e: React.MouseEvent) => {
    e.stopPropagation();
    setJustUpdatedId(id);
    await onUpdateCandidate(id, updates);
    setTimeout(() => setJustUpdatedId(null), 1200);
  };

  // Live Metric Counts for Quick Filter Tabs
  const metrics = useMemo(() => {
    const total = candidates.length;
    const submitted = candidates.filter((c) => c.submissionSlip && !c.approval).length;
    const approved = candidates.filter((c) => c.approval).length;
    const missingPassports = candidates.filter((c) => c.approval && !c.passportInHand).length;
    const missingPcc = candidates.filter((c) => c.approval && !c.pccReceived).length;

    // City breakdown
    const cityCounts: Record<string, number> = {};
    candidates.forEach((c) => {
      if (c.approval && c.approvalCity) {
        cityCounts[c.approvalCity] = (cityCounts[c.approvalCity] || 0) + 1;
      }
    });

    return { total, submitted, approved, missingPassports, missingPcc, cityCounts };
  }, [candidates]);

  // Filter candidates based on active quick tab
  const filteredCandidates = useMemo(() => {
    if (urgentFilter === 'missing_passport_approved') {
      return candidates.filter((c) => c.approval && !c.passportInHand);
    }
    if (urgentFilter === 'missing_pcc_approved') {
      return candidates.filter((c) => c.approval && !c.pccReceived);
    }
    return candidates;
  }, [candidates, urgentFilter]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredCandidates.length);
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  const allSelectedOnPage =
    paginatedCandidates.length > 0 &&
    paginatedCandidates.every((c) => selectedIds.includes(c.id));

  const isAnyFilterActive =
    searchQuery ||
    selectedAgent !== 'all' ||
    selectedCity !== 'all' ||
    selectedStage !== 'ALL' ||
    urgentFilter !== '';

  const handleClearAllFilters = () => {
    onSearchChange('');
    onAgentChange('all');
    onCityChange('all');
    onStageChange('ALL');
    onUrgentFilterChange('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Smart Operational Status Tabs (The Central Daily Workspace Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* All Files Tab */}
          <button
            onClick={() => {
              onUrgentFilterChange('');
              onStageChange('ALL');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              urgentFilter === '' && selectedStage === 'ALL'
                ? 'bg-[#213F7C] text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All Candidates</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === '' && selectedStage === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {candidates.length}
            </span>
          </button>

          {/* Submitted / In Process Tab */}
          <button
            onClick={() => {
              onUrgentFilterChange('');
              onStageChange('SUBMITTED');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              urgentFilter === '' && selectedStage === 'SUBMITTED'
                ? 'bg-[#213F7C] text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>In Process</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === '' && selectedStage === 'SUBMITTED'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {metrics.submitted}
            </span>
          </button>

          {/* Approved Permits Tab */}
          <button
            onClick={() => {
              onUrgentFilterChange('');
              onStageChange('APPROVED');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              urgentFilter === '' && selectedStage === 'APPROVED'
                ? 'bg-[#213F7C] text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Approved Permits</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === '' && selectedStage === 'APPROVED'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {metrics.approved}
            </span>
          </button>

          {/* Urgent: Missing Physical Passports Tab */}
          <button
            onClick={() => {
              onUrgentFilterChange(
                urgentFilter === 'missing_passport_approved' ? '' : 'missing_passport_approved'
              );
              onStageChange('ALL');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
              urgentFilter === 'missing_passport_approved'
                ? 'bg-[#C0434A] text-white border-[#C0434A] shadow-xs font-bold'
                : 'bg-white text-[#C0434A] border-[#C0434A]/30 hover:bg-[#C0434A]/5'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Missing Passport</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === 'missing_passport_approved'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#C0434A]/10 text-[#C0434A]'
              }`}
            >
              {metrics.missingPassports}
            </span>
          </button>

          {/* Urgent: Missing PCC Tab */}
          <button
            onClick={() => {
              onUrgentFilterChange(
                urgentFilter === 'missing_pcc_approved' ? '' : 'missing_pcc_approved'
              );
              onStageChange('ALL');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
              urgentFilter === 'missing_pcc_approved'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Missing PCC</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === 'missing_pcc_approved'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {metrics.missingPcc}
            </span>
          </button>
        </div>

        {/* Collapsible Insights Toggle */}
        <button
          onClick={() => setShowInsightsSummary(!showInsightsSummary)}
          className="flex items-center gap-1 text-xs font-semibold text-[#213F7C] hover:text-[#182F5D] bg-white border border-slate-200 hover:border-[#213F7C]/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>{showInsightsSummary ? 'Hide Insights' : 'Executive Insights'}</span>
          {showInsightsSummary ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Collapsible Executive Insights Panel (In-place overview without leaving the table) */}
      {showInsightsSummary && (
        <div className="clean-card p-4 bg-slate-50/60 border border-slate-200 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Municipal Approvals */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-[#213F7C] uppercase tracking-wider block mb-2">
                Approved Municipalities
              </span>
              <div className="space-y-1.5">
                {Object.entries(metrics.cityCounts).map(([city, count]) => (
                  <div
                    key={city}
                    onClick={() => {
                      onCityChange(city);
                      setCurrentPage(1);
                    }}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="font-semibold text-slate-700">{city}</span>
                    <span className="font-mono-numeric font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {count} approved
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sourcing Agency Overview */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 md:col-span-2">
              <span className="text-[11px] font-bold text-[#213F7C] uppercase tracking-wider block mb-2">
                Partner Sourcing Network ({agents.length} Regional Agencies)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {agents.slice(0, 6).map((ag) => (
                  <div
                    key={ag.id}
                    onClick={() => {
                      onAgentChange(ag.id);
                      setCurrentPage(1);
                    }}
                    className="p-2 rounded border border-slate-100 hover:border-[#213F7C]/30 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-800 truncate">{ag.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono-numeric mt-0.5">
                      {ag.candidateCount || 0} candidates • {ag.approvedCount || 0} approved
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Search & Filter Toolbar */}
      <div className="clean-card p-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Universal Fast Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search candidate name, passport, file ID, agency... (Press / to search)"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Agency Filter */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedAgent}
                onChange={(e) => {
                  onAgentChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Agencies ({agents.length})</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.candidateCount || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* City / Municipality Filter */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  onCityChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Municipalities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Reset */}
            {isAnyFilterActive && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs font-semibold text-[#213F7C] hover:underline px-2 py-1 cursor-pointer"
              >
                Reset filters
              </button>
            )}

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer ml-auto sm:ml-0"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export (.XLSX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Master Operations Table */}
      <div className="clean-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={onSelectAll}
                    className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-10 font-mono-numeric text-center">#</th>
                <th className="py-3 px-3">File ID</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-3">Passport No.</th>
                <th className="py-3 px-3">Sourcing Agency</th>
                <th className="py-3 px-3 text-center">Submission Slip</th>
                <th className="py-3 px-3 text-center">Work Permit</th>
                <th className="py-3 px-3">City / Region</th>
                <th className="py-3 px-3 text-center">Passport</th>
                <th className="py-3 px-3 text-center">PCC</th>
                <th className="py-3 px-3 text-center">Stage</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#213F7C] border-t-transparent" />
                      <span className="text-xs">Loading candidates...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500">
                    <p className="text-xs">No candidate records match your filter criteria.</p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-2 text-xs text-[#213F7C] font-semibold hover:underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const isApproved = c.approval;
                  const isUrgentMissingPassport = isApproved && !c.passportInHand;
                  const isJustUpdated = justUpdatedId === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onOpenDrawer(c)}
                      className={`hover:bg-slate-50/90 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[#213F7C]/6' : ''
                      } ${isJustUpdated ? 'bg-amber-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(c.id)}
                          className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                        />
                      </td>

                      {/* Serial Number */}
                      <td className="py-2.5 px-2 font-mono-numeric text-slate-400 font-medium text-[11px] text-center">
                        {c.sl ? String(c.sl).padStart(3, '0') : '—'}
                      </td>

                      {/* File ID */}
                      <td className="py-2.5 px-3 font-mono-numeric font-semibold text-slate-700 text-xs">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                          {c.fileId}
                        </span>
                      </td>

                      {/* Candidate Name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 uppercase group-hover:text-[#213F7C] transition-colors">
                            {c.name}
                          </span>
                          {isUrgentMissingPassport && (
                            <span
                              title="Physical passport not in office (Urgent)"
                              className="text-[#C0434A] animate-pulse"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono-numeric">
                          Intake: {c.contactDate || 'Recorded'}
                        </span>
                      </td>

                      {/* Passport Number + Copy */}
                      <td className="py-2.5 px-3 font-mono-numeric">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-0.5 border border-slate-200">
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {c.passportNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopyPassport(c.passportNumber, c.id, e)}
                            title="Copy passport number"
                            className="rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            {copiedId === c.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Sourcing Agency */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {c.agent?.name || 'Direct'}
                        </span>
                      </td>

                      {/* Submission Slip Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) =>
                            handleCellUpdate(
                              c.id,
                              {
                                submissionSlip: !c.submissionSlip,
                                submissionDate: !c.submissionSlip
                                  ? new Date().toLocaleDateString('en-GB')
                                  : null,
                              },
                              e
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            c.submissionSlip
                              ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20 hover:bg-[#213F7C]/15 font-semibold'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {c.submissionSlip ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>{c.submissionDate || 'Filed'}</span>
                            </>
                          ) : (
                            <span>Pending</span>
                          )}
                        </button>
                      </td>

                      {/* Approval Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) =>
                            handleCellUpdate(
                              c.id,
                              {
                                approval: !c.approval,
                                approvalDate: !c.approval
                                  ? new Date().toLocaleDateString('en-GB')
                                  : null,
                                approvalCity: !c.approval ? c.approvalCity || 'Strumica' : c.approvalCity,
                              },
                              e
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            c.approval
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {c.approval ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Approved</span>
                            </>
                          ) : (
                            <span>In Review</span>
                          )}
                        </button>
                      </td>

                      {/* City Dropdown */}
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.approvalCity || ''}
                          onChange={(e) =>
                            onUpdateCandidate(c.id, { approvalCity: e.target.value })
                          }
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 focus:border-[#213F7C] focus:outline-none cursor-pointer"
                        >
                          <option value="">Unassigned</option>
                          {CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Passport in Hand Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) =>
                            handleCellUpdate(c.id, { passportInHand: !c.passportInHand }, e)
                          }
                          title="Toggle original passport in office"
                          className={`inline-flex items-center justify-center h-6 w-6 rounded border transition-colors cursor-pointer ${
                            c.passportInHand
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {c.passportInHand ? <Check className="h-3.5 w-3.5" /> : '—'}
                        </button>
                      </td>

                      {/* PCC Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) =>
                            handleCellUpdate(c.id, { pccReceived: !c.pccReceived }, e)
                          }
                          title="Toggle Police Clearance Certificate"
                          className={`inline-flex items-center justify-center h-6 w-6 rounded border transition-colors cursor-pointer ${
                            c.pccReceived
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {c.pccReceived ? <Check className="h-3.5 w-3.5" /> : '—'}
                        </button>
                      </td>

                      {/* Overall Pipeline Stage */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide border ${
                            c.stage === 'DEPLOYMENT_READY'
                              ? 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/25'
                              : c.stage === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.stage === 'SUBMITTED'
                              ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {c.stage.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Open Candidate Drawer Button */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDrawer(c);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#213F7C] p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-900">{endIndex}</strong> of{' '}
            <strong className="text-slate-900">{filteredCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs text-slate-600 font-mono-numeric px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}