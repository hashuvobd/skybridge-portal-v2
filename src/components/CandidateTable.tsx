'use client';

import React, { useState, useEffect, useRef } from 'react';
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
}: CandidateTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justUpdatedId, setJustUpdatedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 25;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        onSearchChange('');
        onAgentChange('all');
        onCityChange('all');
        onStageChange('ALL');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange, onAgentChange, onCityChange, onStageChange]);

  const handleCopyPassport = (passport: string, id: string) => {
    navigator.clipboard.writeText(passport);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCellUpdate = async (id: string, updates: Partial<CandidateRecord>) => {
    setJustUpdatedId(id);
    await onUpdateCandidate(id, updates);
    setTimeout(() => setJustUpdatedId(null), 1200);
  };

  const totalPages = Math.ceil(candidates.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, candidates.length);
  const paginatedCandidates = candidates.slice(startIndex, endIndex);

  const allSelectedOnPage =
    paginatedCandidates.length > 0 &&
    paginatedCandidates.every((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-4 pb-12">
      {/* Search and Filters Toolbar */}
      <div className="clean-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search candidate name, passport, file ID... (Press / to search)"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Agent Filter */}
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

            {/* City Filter */}
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

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedStage}
                onChange={(e) => {
                  onStageChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Stages</option>
                <option value="INTAKE">1. Intake</option>
                <option value="SUBMITTED">2. Submitted</option>
                <option value="APPROVED">3. Approved</option>
                <option value="DEPLOYMENT_READY">4. Ready for Visa</option>
              </select>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export (.XLSX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Candidate Table */}
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
                <th className="py-3 px-2 w-12 font-mono-numeric">#</th>
                <th className="py-3 px-3">File ID</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-3">Passport No.</th>
                <th className="py-3 px-3">Sourcing Agency</th>
                <th className="py-3 px-3 text-center">Submission Slip</th>
                <th className="py-3 px-3 text-center">Work Permit</th>
                <th className="py-3 px-3">City (NM)</th>
                <th className="py-3 px-3 text-center">Passport</th>
                <th className="py-3 px-3 text-center">PCC</th>
                <th className="py-3 px-4 text-right">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      <span className="text-xs">Loading candidates...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <p className="text-xs">No candidate records match your filter criteria.</p>
                    <button
                      onClick={() => {
                        onSearchChange('');
                        onAgentChange('all');
                        onCityChange('all');
                        onStageChange('ALL');
                      }}
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
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-[#213F7C]/6' : ''
                      } ${isJustUpdated ? 'bg-amber-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(c.id)}
                          className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                        />
                      </td>

                      {/* SL */}
                      <td className="py-2.5 px-2 font-mono-numeric text-slate-400 font-medium text-[11px]">
                        {c.sl ? String(c.sl).padStart(3, '0') : '—'}
                      </td>

                      {/* File ID */}
                      <td className="py-2.5 px-3 font-mono-numeric font-semibold text-slate-600 text-xs">
                        {c.fileId}
                      </td>

                      {/* Candidate Name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 uppercase">
                            {c.name}
                          </span>
                          {isUrgentMissingPassport && (
                            <span title="Physical passport not in office" className="text-[#C0434A]">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono-numeric">
                          Contact: {c.contactDate || 'Recorded'}
                        </span>
                      </td>

                      {/* Passport Number + Copy */}
                      <td className="py-2.5 px-3 font-mono-numeric">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-0.5 border border-slate-200">
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {c.passportNumber}
                          </span>
                          <button
                            onClick={() => handleCopyPassport(c.passportNumber, c.id)}
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
                          onClick={() =>
                            handleCellUpdate(c.id, {
                              submissionSlip: !c.submissionSlip,
                              submissionDate: !c.submissionSlip
                                ? new Date().toLocaleDateString('en-GB')
                                : null,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            c.submissionSlip
                              ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20 hover:bg-[#213F7C]/15'
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
                          onClick={() =>
                            handleCellUpdate(c.id, {
                              approval: !c.approval,
                              approvalDate: !c.approval
                                ? new Date().toLocaleDateString('en-GB')
                                : null,
                              approvalCity: !c.approval ? c.approvalCity || 'Strumica' : c.approvalCity,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            c.approval
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-semibold'
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
                      <td className="py-2.5 px-3">
                        <select
                          value={c.approvalCity || ''}
                          onChange={(e) =>
                            handleCellUpdate(c.id, { approvalCity: e.target.value })
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
                          onClick={() =>
                            handleCellUpdate(c.id, { passportInHand: !c.passportInHand })
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
                          onClick={() =>
                            handleCellUpdate(c.id, { pccReceived: !c.pccReceived })
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
                      <td className="py-2.5 px-4 text-right">
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
            <strong className="text-slate-900">{candidates.length}</strong> candidates
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
