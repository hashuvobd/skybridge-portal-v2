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
  Calendar,
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
  const [pageSize, setPageSize] = useState<number>(25);
  const [sortField, setSortField] = useState<'sl' | 'name' | 'agent' | 'stage'>('sl');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (field: 'sl' | 'name' | 'agent' | 'stage') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  // Filter & sort candidates based on active quick tab and sorting settings
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];
    if (urgentFilter === 'missing_passport_approved') {
      list = list.filter((c) => c.approval && !c.passportInHand);
    } else if (urgentFilter === 'missing_pcc_approved') {
      list = list.filter((c) => c.approval && !c.pccReceived);
    }

    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'sl') {
        comp = (a.sl || 0) - (b.sl || 0);
      } else if (sortField === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (sortField === 'agent') {
        comp = (a.agent?.name || '').localeCompare(b.agent?.name || '');
      } else if (sortField === 'stage') {
        comp = a.stage.localeCompare(b.stage);
      }
      return sortDirection === 'asc' ? comp : -comp;
    });

    return list;
  }, [candidates, urgentFilter, sortField, sortDirection]);

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
              placeholder="Search candidate name, passport, SL... (Press /)"
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

      {/* 3. MOBILE RESPONSIVE CARDS VIEW (Clean, zero horizontal scroll cards on mobile) */}
      <div className="md:hidden space-y-3">
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
                {/* Header: Checkbox, File ID, Stage Pill (No serial number) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelect(c.id);
                      }}
                      className="rounded border-slate-300 accent-[#213F7C] h-4 w-4 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-slate-700">
                      #{c.sl}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
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

                {/* Candidate Name & Urgent Alert */}
                <div className="mt-2.5 flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm uppercase truncate">
                    {c.name}
                  </h4>
                  {isUrgentMissingPassport && (
                    <span
                      title="Missing physical passport"
                      className="text-[#C0434A] text-[10px] font-bold flex items-center gap-1 shrink-0 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 animate-status-pulse"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Passport Missing
                    </span>
                  )}
                </div>

                {/* Passport & Sourcing Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
                  <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {c.agent?.name || 'Direct SkyBridge'}
                  </div>
                </div>

                {/* Destination City Dropdown */}
                <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <select
                    value={c.approvalCity || ''}
                    onChange={(e) =>
                      onUpdateCandidate(c.id, { approvalCity: e.target.value })
                    }
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#213F7C]"
                  >
                    <option value="">Unassigned Municipality</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Milestones & Documents (Submission Slip, Approval, Passport, PCC) */}
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  {/* Submission Slip */}
                  <button
                    onClick={(e) =>
                      handleCellUpdate(
                        c.id,
                        {
                          submissionSlip: !c.submissionSlip,
                          submissionDate: !c.submissionDate && !c.submissionSlip
                            ? new Date().toLocaleDateString('en-GB')
                            : null,
                        },
                        e
                      )
                    }
                    className={`flex flex-col items-start px-2 py-1.5 rounded text-[11px] font-semibold border ${
                      c.submissionSlip
                        ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/25'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Slip: {c.submissionSlip ? 'Filed' : 'Pending'}</span>
                      {c.submissionSlip ? <Check className="h-3 w-3 stroke-[2.5]" /> : null}
                    </div>
                    {c.submissionDate && (
                      <span className="text-[10px] font-mono-numeric text-slate-600 font-normal mt-0.5 flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5 text-slate-400" />
                        {c.submissionDate}
                      </span>
                    )}
                  </button>

                  {/* Approval */}
                  <button
                    onClick={(e) =>
                      handleCellUpdate(
                        c.id,
                        {
                          approval: !c.approval,
                          approvalDate: !c.approvalDate && !c.approval
                            ? new Date().toLocaleDateString('en-GB')
                            : null,
                          approvalCity: !c.approval ? c.approvalCity || 'Strumica' : c.approvalCity,
                        },
                        e
                      )
                    }
                    className={`flex flex-col items-start px-2 py-1.5 rounded text-[11px] font-semibold border ${
                      c.approval
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Approval: {c.approval ? 'Approved' : 'Pending'}</span>
                      {c.approval ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : null}
                    </div>
                    {c.approvalDate && (
                      <span className="text-[10px] font-mono-numeric text-emerald-700 font-semibold mt-0.5 flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5 text-emerald-600" />
                        {c.approvalDate}
                      </span>
                    )}
                  </button>

                  {/* Passport (Physical in hand) */}
                  <button
                    onClick={(e) =>
                      handleCellUpdate(c.id, { passportInHand: !c.passportInHand }, e)
                    }
                    className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-semibold border ${
                      c.passportInHand
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : c.approval
                        ? 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/25 font-bold'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>Passport: {c.passportInHand ? 'Received' : c.approval ? 'Missing' : 'Pending'}</span>
                    {c.passportInHand ? <Check className="h-3 w-3 stroke-[2.5]" /> : null}
                  </button>

                  {/* PCC */}
                  <button
                    onClick={(e) =>
                      handleCellUpdate(c.id, { pccReceived: !c.pccReceived }, e)
                    }
                    className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-semibold border ${
                      c.pccReceived
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>PCC: {c.pccReceived ? 'Received' : 'Pending'}</span>
                    {c.pccReceived ? <Check className="h-3 w-3 stroke-[2.5]" /> : null}
                  </button>
                </div>

                {/* Footer: Open File Link */}
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-[#213F7C] flex items-center gap-1">
                    Open File <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODERN COMPACT TABLE (Desktop `>= md`, fits full width with zero horizontal dragging) */}
      <div className="hidden md:block clean-card overflow-hidden shadow-xs border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200">
            <tr className="text-slate-600 font-semibold text-[11px] uppercase tracking-wider select-none">
              {/* Col 1: Select & SL */}
              <th className="py-3 px-3 w-[70px] whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={onSelectAll}
                    className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                  />
                  <button
                    onClick={() => handleSort('sl')}
                    className="flex items-center gap-1 hover:text-[#213F7C] transition-colors cursor-pointer"
                  >
                    <span>SL</span>
                    {sortField === 'sl' && (
                      <span className="text-[#213F7C] font-bold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </div>
              </th>

              {/* Col 2: Candidate & Passport */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3.5 cursor-pointer hover:text-[#213F7C] hover:bg-slate-100/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Candidate &amp; Passport</span>
                  {sortField === 'name' && (
                    <span className="text-[#213F7C] font-bold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>

              {/* Col 3: Agent & City */}
              <th
                onClick={() => handleSort('agent')}
                className="py-3 px-3.5 cursor-pointer hover:text-[#213F7C] hover:bg-slate-100/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Agent &amp; City</span>
                  {sortField === 'agent' && (
                    <span className="text-[#213F7C] font-bold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>

              {/* Col 4: Submission Slip */}
              <th className="py-3 px-3 whitespace-nowrap">
                Submission Slip
              </th>

              {/* Col 5: Approval */}
              <th className="py-3 px-3 whitespace-nowrap">
                Approval
              </th>

              {/* Col 6: Passport & PCC */}
              <th className="py-3 px-3 whitespace-nowrap">
                Passport &amp; PCC
              </th>

              {/* Col 7: Stage & Action */}
              <th
                onClick={() => handleSort('stage')}
                className="py-3 px-4 text-right cursor-pointer hover:text-[#213F7C] hover:bg-slate-100/60 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Stage</span>
                  {sortField === 'stage' && (
                    <span className="text-[#213F7C] font-bold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#213F7C] border-t-transparent" />
                    <span className="text-xs">Loading candidates...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedCandidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
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
                    {/* Col 1: Select & SL (Clean serial number, no border, no background) */}
                    <td
                      className="py-3 px-3 align-middle whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(c.id)}
                          className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                        />
                        <span className="font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {c.sl}
                        </span>
                      </div>
                    </td>

                    {/* Col 2: Candidate Name + Passport Chip + Intake Date */}
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 uppercase group-hover:text-[#213F7C] transition-colors leading-tight">
                          {c.name}
                        </span>
                        {isUrgentMissingPassport && (
                          <span
                            title="Physical passport not in office (Urgent)"
                            className="text-[#C0434A] animate-status-pulse shrink-0"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <div className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 border border-slate-200/80 font-mono text-slate-700">
                          <span className="font-semibold">{c.passportNumber}</span>
                          <button
                            onClick={(e) => handleCopyPassport(c.passportNumber, c.id, e)}
                            title="Copy passport number"
                            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {copiedId === c.id ? (
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-slate-400 font-mono-numeric">
                          Intake: {c.contactDate || 'Recorded'}
                        </span>
                      </div>
                    </td>

                    {/* Col 3: Agency & Placement (Agency name + Code + Destination City Select) */}
                    <td className="py-2.5 px-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <span className="truncate max-w-[150px]">{c.agent?.name || 'Direct SkyBridge'}</span>
                        {c.agent?.code && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                            [{c.agent.code}]
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <select
                          value={c.approvalCity || ''}
                          onChange={(e) =>
                            onUpdateCandidate(c.id, { approvalCity: e.target.value })
                          }
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-700 hover:border-slate-300 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none cursor-pointer"
                        >
                          <option value="">Unassigned City</option>
                          {CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Col 4: Submission Slip (Status & Visible Date) */}
                    <td className="py-2.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1 min-w-[125px]">
                        <button
                          onClick={(e) =>
                            handleCellUpdate(
                              c.id,
                              {
                                submissionSlip: !c.submissionSlip,
                                submissionDate: !c.submissionDate && !c.submissionSlip
                                  ? new Date().toLocaleDateString('en-GB')
                                  : null,
                              },
                              e
                            )
                          }
                          title={c.submissionSlip ? `Submission Slip Filed: ${c.submissionDate || 'Yes'}` : 'Click to mark submission slip filed'}
                          className={`inline-flex items-center justify-between gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer w-fit ${
                            c.submissionSlip
                              ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/25 hover:bg-[#213F7C]/15'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{c.submissionSlip ? 'Filed' : 'Pending'}</span>
                          {c.submissionSlip ? <Check className="h-3 w-3 stroke-[2.5]" /> : null}
                        </button>

                        <div className="text-[11px] font-mono-numeric text-slate-600 flex items-center gap-1 pl-0.5">
                          {c.submissionDate ? (
                            <>
                              <Calendar className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span>{c.submissionDate}</span>
                            </>
                          ) : (
                            <span className="text-slate-300 text-[10px]">—</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Col 5: Approval (Status & Visible Date) */}
                    <td className="py-2.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1 min-w-[125px]">
                        <button
                          onClick={(e) =>
                            handleCellUpdate(
                              c.id,
                              {
                                approval: !c.approval,
                                approvalDate: !c.approvalDate && !c.approval
                                  ? new Date().toLocaleDateString('en-GB')
                                  : null,
                                approvalCity: !c.approval ? c.approvalCity || 'Strumica' : c.approvalCity,
                              },
                              e
                            )
                          }
                          title={c.approval ? `Work Permit Approved: ${c.approvalDate || 'OK'}` : 'Click to approve work permit'}
                          className={`inline-flex items-center justify-between gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer w-fit ${
                            c.approval
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <span>{c.approval ? 'Approved' : 'Pending'}</span>
                          {c.approval ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <Clock className="h-2.5 w-2.5 text-amber-600" />
                          )}
                        </button>

                        <div className="text-[11px] font-mono-numeric flex items-center gap-1 pl-0.5">
                          {c.approvalDate ? (
                            <>
                              <Calendar className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                              <span className="text-emerald-700 font-semibold">{c.approvalDate}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[10px]">In Review</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Col 6: Passport & PCC (Words from sheet, replacing 'Vault') */}
                    <td className="py-2.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1 min-w-[130px]">
                        {/* Physical Passport In Office */}
                        <button
                          onClick={(e) =>
                            handleCellUpdate(c.id, { passportInHand: !c.passportInHand }, e)
                          }
                          title={c.passportInHand ? "Physical passport in office" : "Physical passport pending collection"}
                          className={`inline-flex items-center justify-between gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer w-fit ${
                            c.passportInHand
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : c.approval
                              ? 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/30 font-bold animate-status-pulse'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>Passport: {c.passportInHand ? 'Received' : c.approval ? 'Missing' : 'Pending'}</span>
                          {c.passportInHand ? (
                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                          ) : c.approval ? (
                            <AlertTriangle className="h-2.5 w-2.5 text-[#C0434A]" />
                          ) : null}
                        </button>

                        {/* PCC */}
                        <button
                          onClick={(e) =>
                            handleCellUpdate(c.id, { pccReceived: !c.pccReceived }, e)
                          }
                          title={c.pccReceived ? "Police clearance certificate received" : "Police clearance certificate pending"}
                          className={`inline-flex items-center justify-between gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer w-fit ${
                            c.pccReceived
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>PCC: {c.pccReceived ? 'Received' : 'Pending'}</span>
                          {c.pccReceived ? <Check className="h-2.5 w-2.5 stroke-[2.5]" /> : null}
                        </button>
                      </div>
                    </td>

                    {/* Col 5: Stage & Action */}
                    <td className="py-2.5 px-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide border uppercase ${
                            c.stage === 'DEPLOYMENT_READY'
                              ? 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/25'
                              : c.stage === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.stage === 'SUBMITTED'
                              ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20'
                              : c.stage === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {c.stage.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => onOpenDrawer(c)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#213F7C] hover:text-[#183060] bg-[#213F7C]/6 hover:bg-[#213F7C]/12 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. RESPONSIVE PAGINATION BAR (Visible on both mobile & desktop) */}
      <div className="clean-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 bg-white/80 backdrop-blur-xs px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900 font-mono-numeric">{filteredCandidates.length > 0 ? startIndex + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900 font-mono-numeric">{endIndex}</strong> of{' '}
            <strong className="text-slate-900 font-mono-numeric">{filteredCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:border-[#213F7C] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-slate-700 font-mono-numeric px-2 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}