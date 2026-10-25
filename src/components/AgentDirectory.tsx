'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  AlertTriangle,
  Check,
  Loader2,
  FileText,
  Percent,
} from 'lucide-react';
import { AgentRecord } from '@/lib/types';

interface AgentDirectoryProps {
  agents: AgentRecord[];
  onSelectAgentToFilter: (agentId: string) => void;
  onRefreshAgents?: () => Promise<void>;
  onRefreshCandidates?: () => Promise<void>;
  onShowToast?: (text: string, type?: 'success' | 'error') => void;
  userRole?: 'ADMIN' | 'AGENT';
}

interface AgentFormData {
  name: string;
  code: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  notes: string;
}

const INITIAL_FORM: AgentFormData = {
  name: '',
  code: '',
  location: '',
  contactPerson: '',
  phone: '',
  email: '',
  notes: '',
};

export default function AgentDirectory({
  agents,
  onSelectAgentToFilter,
  onRefreshAgents,
  onRefreshCandidates,
  onShowToast,
  userRole = 'ADMIN',
}: AgentDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentRecord | null>(null);
  const [formData, setFormData] = useState<AgentFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal state
  const [deletingAgent, setDeletingAgent] = useState<AgentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter agents by search query
  const filteredAgents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.code && a.code.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.contactPerson && a.contactPerson.toLowerCase().includes(q)) ||
        (a.phone && a.phone.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q))
    );
  }, [agents, searchQuery]);

  // Overall stats
  const totalFiles = useMemo(
    () => agents.reduce((sum, a) => sum + (a.candidateCount || 0), 0),
    [agents]
  );
  const totalApproved = useMemo(
    () => agents.reduce((sum, a) => sum + (a.approvedCount || 0), 0),
    [agents]
  );
  const totalSubmitted = useMemo(
    () => agents.reduce((sum, a) => sum + (a.submittedCount || 0), 0),
    [agents]
  );

  const handleOpenAddModal = () => {
    setEditingAgent(null);
    setFormData(INITIAL_FORM);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (agent: AgentRecord) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || '',
      code: agent.code || '',
      location: agent.location || '',
      contactPerson: agent.contactPerson || '',
      phone: agent.phone || '',
      email: agent.email || '',
      notes: agent.notes || '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
    setFormData(INITIAL_FORM);
    setErrorMessage('');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Agency Name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (editingAgent) {
        // Update Agent
        const res = await fetch(`/api/agents/${editingAgent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to update agency');
        }
        onShowToast?.(`Agency "${formData.name.trim()}" updated successfully!`, 'success');
      } else {
        // Create Agent
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Failed to create agency');
        }
        onShowToast?.(`Agency "${formData.name.trim()}" added to network!`, 'success');
      }

      handleCloseModal();
      if (onRefreshAgents) await onRefreshAgents();
      if (onRefreshCandidates) await onRefreshCandidates();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAgent) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/agents/${deletingAgent.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to delete agency');
      }

      onShowToast?.(
        `Agency "${deletingAgent.name}" removed. Candidates safely preserved.`,
        'success'
      );
      setDeletingAgent(null);
      if (onRefreshAgents) await onRefreshAgents();
      if (onRefreshCandidates) await onRefreshCandidates();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to delete agency', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Info & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Partner Sourcing Agencies</span>
            <span className="rounded-md bg-[#213F7C]/8 px-2 py-0.5 text-xs font-bold text-[#213F7C] border border-[#213F7C]/20 font-mono-numeric">
              {agents.length} Offices
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage partner agency profiles, contacts, intake volume, and approval conversions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'ADMIN' && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#213F7C] hover:bg-[#182F5D] active:scale-98 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Partner Agency</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Badges & Search Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="clean-card p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Agencies
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono-numeric mt-1">
            {agents.length}
          </span>
        </div>
        <div className="clean-card p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Intake Files
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono-numeric mt-1">
            {totalFiles}
          </span>
        </div>
        <div className="clean-card p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Submission Slips
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#213F7C] font-mono-numeric mt-1">
            {totalSubmitted}
          </span>
        </div>
        <div className="clean-card p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Work Permits Approved
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-600 font-mono-numeric mt-1">
            {totalApproved}
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agency by name, code, city, coordinator..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Agency Grid */}
      {filteredAgents.length === 0 ? (
        <div className="clean-card p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">No partner agencies found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? `No agencies matched "${searchQuery}". Try a different keyword.`
              : 'Get started by creating your first partner sourcing agency.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-[#213F7C] hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          ) : userRole === 'ADMIN' ? (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#213F7C] hover:bg-[#182F5D] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Agency</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredAgents.map((agent) => {
            const count = agent.candidateCount || 0;
            const approved = agent.approvedCount || 0;
            const submitted = agent.submittedCount || 0;
            const conversionRate =
              count > 0 ? Math.round((approved / count) * 100) : 0;

            return (
              <div
                key={agent.id}
                className="clean-card clean-card-hover p-4 flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Agency Card Top Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-[#213F7C] shrink-0 mt-0.5">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            {agent.name}
                          </h3>
                        </div>
                        {agent.location && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{agent.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {agent.code && (
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {agent.code}
                        </span>
                      )}

                      {/* Management Actions (Admin Only) */}
                      {userRole === 'ADMIN' && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => handleOpenEditModal(agent)}
                            title="Edit Agency Profile"
                            className="p-1 rounded-md text-slate-400 hover:text-[#213F7C] hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingAgent(agent)}
                            title="Delete Agency"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics Bar */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5 text-center bg-slate-50/60 rounded-md">
                    <div>
                      <div className="text-sm sm:text-base font-bold text-slate-900 font-mono-numeric">
                        {count}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Intake
                      </div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-bold text-[#213F7C] font-mono-numeric">
                        {submitted}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Filed
                      </div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-bold text-emerald-600 font-mono-numeric">
                        {approved}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Approved
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate Pill */}
                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] font-medium text-slate-500">
                      Approval Rate:
                    </span>
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded border ${
                        conversionRate > 50
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : conversionRate > 0
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {conversionRate}%
                    </span>
                  </div>

                  {/* Coordinator & Contact Info */}
                  <div className="mt-2.5 space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                    {agent.contactPerson && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="text-slate-400 text-[11px]">Coordinator:</span>
                        <span className="font-medium text-slate-800 truncate">
                          {agent.contactPerson}
                        </span>
                      </div>
                    )}
                    {agent.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${agent.phone}`}
                          className="text-slate-600 hover:text-[#213F7C] truncate font-mono-numeric text-[11px]"
                        >
                          {agent.phone}
                        </a>
                      </div>
                    )}
                    {agent.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${agent.email}`}
                          className="text-slate-600 hover:text-[#213F7C] truncate text-[11px]"
                        >
                          {agent.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes / Remarks Preview */}
                  {agent.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100 italic">
                      "{agent.notes}"
                    </p>
                  )}
                </div>

                {/* Action Button: Filter Candidates */}
                <button
                  onClick={() => onSelectAgentToFilter(agent.id)}
                  className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-[#213F7C] bg-[#213F7C]/8 hover:bg-[#213F7C] hover:text-white border border-[#213F7C]/20 transition-all cursor-pointer group/btn"
                >
                  <span>Filter Agency Candidates ({count})</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT PARTNER AGENCY MODAL                              */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#213F7C]/10 text-[#213F7C]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingAgent ? 'Edit Partner Agency Profile' : 'Register New Partner Agency'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingAgent
                      ? `Updating operational details for ${editingAgent.name}`
                      : 'Add an authorized sourcing agency to the Sky Bridge network'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Agency Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Agency Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Takwa International"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                  />
                </div>

                {/* Agency Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Agency Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. TKW"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Regional Location / Division
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Dhaka - Uttara, Sylhet - Zindabazar, Noakhali"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Coordinator */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Coordinator / Lead Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    placeholder="e.g. Md. Rafiqul Islam"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +880 1712-345678"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 font-mono-numeric focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. operations@takwaint.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                />
              </div>

              {/* Operational Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Internal Operational Remarks
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Primary sourcing partner for Strumica textile project; verified documents."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#213F7C] hover:bg-[#182F5D] text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{editingAgent ? 'Update Agency' : 'Create Agency'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL (PROTECTED)                         */}
      {/* ============================================================ */}
      {deletingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Delete Partner Agency?
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action will remove the agency profile from the network.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900">{deletingAgent.name}</div>
                <div className="text-slate-500">Location: {deletingAgent.location || 'N/A'}</div>
                <div className="text-slate-500 font-mono-numeric">
                  Assigned Candidates: {deletingAgent.candidateCount || 0} files
                </div>
              </div>

              {(deletingAgent.candidateCount || 0) > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                  <strong>Safe Reassignment Guarantee:</strong> All{' '}
                  <span className="font-bold font-mono">
                    {deletingAgent.candidateCount} candidates
                  </span>{' '}
                  under this agency will be safely preserved and automatically reassigned to{' '}
                  <span className="font-bold">Sky Bridge Direct Intake</span>. No candidate records
                  will be lost.
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingAgent(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Agency</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
