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
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  Send,
  FileText,
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

interface CustomSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  icon: React.ReactNode;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
}

function CustomSelect({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select...',
  className = '',
  align = 'left',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50/80 px-2 sm:px-2.5 py-1.5 text-xs text-slate-800 transition-colors w-full cursor-pointer focus:outline-none focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C]"
      >
        <span className="shrink-0 text-slate-400">{icon}</span>
        <span className="truncate flex-1 text-left font-medium">
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.count !== undefined && (
            <span className="ml-1 text-[10px] font-mono-numeric text-slate-500 font-normal">
              ({selectedOption.count})
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Custom Menu Panel (Rendered inside DOM - strictly bounded within screen) */}
      {isOpen && (
        <div
          className={`absolute z-50 top-full mt-1.5 w-full min-w-[190px] sm:min-w-[210px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-98 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#213F7C]/8 text-[#213F7C] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className="truncate">{opt.label}</span>
                  {opt.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono-numeric px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                        isSelected
                          ? 'bg-[#213F7C]/15 text-[#213F7C]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#213F7C] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
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

    return { total, submitted, approved, missingPassports, missingPcc };
  }, [candidates]);

  // Dropdown Options for Custom In-App Pickers
  const agencyOptions = useMemo(() => [
    { value: 'all', label: 'All Agencies', count: candidates.length },
    ...agents.map((ag) => ({
      value: ag.id,
      label: ag.name,
      count: ag.candidateCount || 0,
    })),
  ], [agents, candidates.length]);

  const cityOptions = useMemo(() => [
    { value: 'all', label: 'All Municipalities' },
    ...CITIES.map((c) => ({
      value: c,
      label: c,
    })),
  ], []);

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
    <div className="space-y-3 sm:space-y-4 pb-12">
      {/* 1. Smart Operational Status Tabs */}
      <div className="border-b border-slate-200/90 pb-2.5">
        {/* DESKTOP VIEW (≥ md): Exactly one unified contiguous row */}
        <div className="hidden md:flex items-center gap-1.5 py-0.5">
          {/* All Files Tab */}
          <button
            onClick={() => {
              onUrgentFilterChange('');
              onStageChange('ALL');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              urgentFilter === '' && selectedStage === 'ALL'
                ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
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
                ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#213F7C]" />
              In Process
            </span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === '' && selectedStage === 'SUBMITTED'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
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
                ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50/50'
            }`}
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Approved
            </span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === '' && selectedStage === 'APPROVED'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {metrics.approved}
            </span>
          </button>

          {/* Urgent: Missing Passports for Approved Candidates */}
          <button
            onClick={() => {
              onUrgentFilterChange('missing_passport_approved');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              urgentFilter === 'missing_passport_approved'
                ? 'bg-[#C0434A] text-white shadow-2xs font-bold'
                : 'bg-white text-[#C0434A] border border-[#C0434A]/30 hover:bg-[#C0434A]/8'
            }`}
          >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Missing Passports</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                urgentFilter === 'missing_passport_approved'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#C0434A]/12 text-[#C0434A]'
              }`}
            >
              {metrics.missingPassports}
            </span>
          </button>

          {/* Urgent: Missing PCC */}
          <button
            onClick={() => {
              onUrgentFilterChange('missing_pcc_approved');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              urgentFilter === 'missing_pcc_approved'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Clock className="h-3 w-3 shrink-0" />
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

        {/* MOBILE VIEW (< md): 2-Tier Grid that fits the screen without scrolling */}
        <div className="md:hidden space-y-1.5">
          {/* Row 1: 3 Equal Columns */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                onUrgentFilterChange('');
                onStageChange('ALL');
                setCurrentPage(1);
              }}
              className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                urgentFilter === '' && selectedStage === 'ALL'
                  ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">All</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold shrink-0 ${
                  urgentFilter === '' && selectedStage === 'ALL'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => {
                onUrgentFilterChange('');
                onStageChange('SUBMITTED');
                setCurrentPage(1);
              }}
              className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                urgentFilter === '' && selectedStage === 'SUBMITTED'
                  ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">In Process</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold shrink-0 ${
                  urgentFilter === '' && selectedStage === 'SUBMITTED'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {metrics.submitted}
              </span>
            </button>

            <button
              onClick={() => {
                onUrgentFilterChange('');
                onStageChange('APPROVED');
                setCurrentPage(1);
              }}
              className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                urgentFilter === '' && selectedStage === 'APPROVED'
                  ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              <span className="truncate">Approved</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold shrink-0 ${
                  urgentFilter === '' && selectedStage === 'APPROVED'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {metrics.approved}
              </span>
            </button>
          </div>

          {/* Row 2: 2 Equal Columns for Urgent Attention */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onUrgentFilterChange('missing_passport_approved');
                setCurrentPage(1);
              }}
              className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                urgentFilter === 'missing_passport_approved'
                  ? 'bg-[#C0434A] text-white shadow-2xs font-bold'
                  : 'bg-white text-[#C0434A] border border-[#C0434A]/30 hover:bg-[#C0434A]/8'
              }`}
            >
              <div className="flex items-center gap-1 truncate">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span className="truncate">Missing Passports</span>
              </div>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold shrink-0 ${
                  urgentFilter === 'missing_passport_approved'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#C0434A]/12 text-[#C0434A]'
                }`}
              >
                {metrics.missingPassports}
              </span>
            </button>

            <button
              onClick={() => {
                onUrgentFilterChange('missing_pcc_approved');
                setCurrentPage(1);
              }}
              className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                urgentFilter === 'missing_pcc_approved'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-1 truncate">
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate">Missing PCC</span>
              </div>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold shrink-0 ${
                  urgentFilter === 'missing_pcc_approved'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {metrics.missingPcc}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Toolbar */}
      <div className="clean-card p-3 sm:p-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
          {/* Universal Fast Search Box */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search candidate name, passport, file ID... (Press /)"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white pl-8.5 pr-8 py-1.5 sm:py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters & Controls (Guaranteed to fit mobile screens) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            {/* Dropdowns Row: 2 equal columns on mobile so they NEVER overflow the viewport */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              {/* Custom In-App Agency Filter */}
              <CustomSelect
                value={selectedAgent}
                onChange={(val) => {
                  onAgentChange(val);
                  setCurrentPage(1);
                }}
                options={agencyOptions}
                icon={<Building className="h-3.5 w-3.5" />}
                className="w-full sm:w-[170px]"
                align="left"
              />

              {/* Custom In-App City / Municipality Filter */}
              <CustomSelect
                value={selectedCity}
                onChange={(val) => {
                  onCityChange(val);
                  setCurrentPage(1);
                }}
                options={cityOptions}
                icon={<MapPin className="h-3.5 w-3.5" />}
                className="w-full sm:w-[155px]"
                align="right"
              />
            </div>

            {/* Actions Row: Reset, View Switcher, and Export */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              {/* Clear Filters Reset */}
              {isAnyFilterActive ? (
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs font-semibold text-[#213F7C] hover:underline px-1 py-1 cursor-pointer shrink-0"
                >
                  Reset filters
                </button>
              ) : (
                <span className="hidden sm:inline" />
              )}

              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                {/* Mobile View Switcher (Cards vs Table) */}
                <div className="flex md:hidden items-center rounded-lg border border-slate-300 bg-slate-100 p-0.5 shrink-0">
                  <button
                    onClick={() => setMobileViewMode('cards')}
                    className={`p-1 rounded text-xs transition-colors ${
                      mobileViewMode === 'cards'
                        ? 'bg-white text-[#213F7C] shadow-2xs font-bold'
                        : 'text-slate-500'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setMobileViewMode('table')}
                    className={`p-1 rounded text-xs transition-colors ${
                      mobileViewMode === 'table'
                        ? 'bg-white text-[#213F7C] shadow-2xs font-bold'
                        : 'text-slate-500'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Export Excel Button */}
                <button
                  onClick={onExportExcel}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Export (.XLSX)</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBILE RESPONSIVE CARDS VIEW (Displayed on mobile screens when mode is 'cards') */}
      <div className={`md:hidden ${mobileViewMode === 'cards' ? 'block' : 'hidden'} space-y-2.5`}>
        {loading ? (
          <div className="clean-card p-8 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#213F7C] border-t-transparent" />
              <span className="text-xs">Loading candidates...</span>
            </div>
          </div>
        ) : paginatedCandidates.length === 0 ? (
          <div className="clean-card p-8 text-center text-slate-500">
            <p className="text-xs">No candidate records match your filter criteria.</p>
            <button
              onClick={handleClearAllFilters}
              className="mt-2 text-xs text-[#213F7C] font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          paginatedCandidates.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            const isApproved = c.approval;
            const isUrgentMissingPassport = isApproved && !c.passportInHand;

            return (
              <div
                key={c.id}
                onClick={() => onOpenDrawer(c)}
                className={`clean-card p-3.5 transition-all cursor-pointer ${
                  isSelected ? 'border-[#213F7C] bg-[#213F7C]/4 ring-1 ring-[#213F7C]' : ''
                }`}
              >
                {/* Header: Name, File ID, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleSelect(c.id);
                        }}
                        className="rounded border-slate-300 accent-[#213F7C] h-4 w-4"
                      />
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase truncate">
                        {c.name}
                      </h4>
                      {isUrgentMissingPassport && (
                        <span
                          title="Missing physical passport"
                          className="text-[#C0434A] animate-status-pulse shrink-0"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-mono-numeric font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {c.fileId}
                      </span>
                      <span className="truncate">{c.agent?.name || 'Direct Agency'}</span>
                    </div>
                  </div>

                  {/* Stage Pill */}
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      c.stage === 'DEPLOYMENT_READY'
                        ? 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/25'
                        : c.stage === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : c.stage === 'SUBMITTED'
                        ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.stage === 'APPROVED' || c.stage === 'DEPLOYMENT_READY'
                          ? 'bg-emerald-600'
                          : 'bg-[#213F7C]'
                      }`}
                    />
                    {c.stage.replace('_', ' ')}
                  </span>
                </div>

                {/* Passport & Details Row */}
                <div className="flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono-numeric">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {c.passportNumber}
                    </span>
                    <button
                      onClick={(e) => handleCopyPassport(c.passportNumber, c.id, e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Copy passport"
                    >
                      {copiedId === c.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {c.approvalCity && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {c.approvalCity}
                    </span>
                  )}
                </div>

                {/* Fast Action Toggle Chips for Mobile */}
                <div className="flex items-center justify-between border-t border-slate-100 mt-2 pt-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Submission Slip Chip */}
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
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border ${
                        c.submissionSlip
                          ? 'bg-[#213F7C]/8 text-[#213F7C] border-[#213F7C]/20'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Send className="h-2.5 w-2.5" />
                      <span>{c.submissionSlip ? 'Filed' : 'Slip'}</span>
                    </button>

                    {/* Work Permit Approval Chip */}
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
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border ${
                        c.approval
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>{c.approval ? 'Permit' : 'Permit'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-[#213F7C] flex items-center gap-0.5">
                    Open File <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MASTER SPREADSHEET TABLE (Always visible on desktop `>= md`, or on mobile if table mode selected) */}
      <div className={`clean-card overflow-hidden ${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-semibold text-[11px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={onSelectAll}
                    className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-10 font-mono-numeric text-center">#</th>
                <th className="py-2.5 px-3">File ID</th>
                <th className="py-2.5 px-4">Candidate Name</th>
                <th className="py-2.5 px-3">Passport No.</th>
                <th className="py-2.5 px-3">Sourcing Agency</th>
                <th className="py-2.5 px-3 text-center">Submission Slip</th>
                <th className="py-2.5 px-3 text-center">Work Permit</th>
                <th className="py-2.5 px-3">City / Region</th>
                <th className="py-2.5 px-3 text-center">Passport</th>
                <th className="py-2.5 px-3 text-center">PCC</th>
                <th className="py-2.5 px-3 text-center">Stage</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white">
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
                        isSelected ? 'bg-[#213F7C]/5' : ''
                      } ${isJustUpdated ? 'bg-amber-50/80' : ''}`}
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
                              className="text-[#C0434A] animate-status-pulse"
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
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
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
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
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
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-900">{endIndex}</strong> of{' '}
            <strong className="text-slate-900">{filteredCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center justify-center gap-2">
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