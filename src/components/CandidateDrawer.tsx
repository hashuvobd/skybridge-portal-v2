'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Building2,
  FileCheck,
  AlertTriangle,
  Calendar,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Share2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { CandidateRecord, AgentRecord } from '@/lib/types';

interface CandidateDrawerProps {
  candidate: CandidateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCandidate: (id: string, updates: Partial<CandidateRecord>) => Promise<void>;
  agents: AgentRecord[];
}

const CITIES = ['Strumica', 'Tetovo', 'Skopje', 'Kumanovo', 'Shtip', 'Bitola'];

export default function CandidateDrawer({
  candidate,
  isOpen,
  onClose,
  onUpdateCandidate,
  agents,
}: CandidateDrawerProps) {
  const [notes, setNotes] = useState('');
  const [copiedPassport, setCopiedPassport] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (candidate) {
      setNotes(candidate.notes || '');
    }
  }, [candidate]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const isApproved = candidate.approval;
  const isMissingPassportApproved = isApproved && !candidate.passportInHand;

  const handleCopyPassport = () => {
    navigator.clipboard.writeText(candidate.passportNumber);
    setCopiedPassport(true);
    setTimeout(() => setCopiedPassport(false), 2000);
  };

  const handleCopyWhatsAppSummary = () => {
    const text = `*Sky Bridge Visa Consultancy - File Update*
Candidate: ${candidate.name}
File ID: ${candidate.fileId}
Passport No: ${candidate.passportNumber}
Sourcing Agency: ${candidate.agent?.name || 'Direct'}
Submission Slip: ${candidate.submissionSlip ? `Filed (${candidate.submissionDate || 'Yes'})` : 'Pending'}
Work Permit: ${candidate.approval ? `APPROVED (${candidate.approvalCity || 'Authorized'} - ${candidate.approvalDate || 'Issued'})` : 'In Process'}
Physical Passport: ${candidate.passportInHand ? 'In Office (Verified)' : 'PENDING COLLECTION'}
PCC: ${candidate.pccReceived ? 'Received' : 'Pending'}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleQuickToggle = async (updates: Partial<CandidateRecord>) => {
    setIsSaving(true);
    try {
      await onUpdateCandidate(candidate.id, updates);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await onUpdateCandidate(candidate.id, { notes: notes.trim() || null });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#213F7C] bg-[#213F7C]/8 px-2 py-0.5 rounded border border-[#213F7C]/20">
                  {candidate.fileId}
                </span>
                {candidate.sl && (
                  <span className="font-mono text-xs text-slate-400">
                    SL #{String(candidate.sl).padStart(3, '0')}
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide border ${
                    candidate.stage === 'DEPLOYMENT_READY'
                      ? 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/25'
                      : candidate.stage === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : candidate.stage === 'SUBMITTED'
                      ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {candidate.stage.replace('_', ' ')}
                </span>
              </div>

              <h2 className="mt-2 text-lg font-bold text-slate-900 uppercase tracking-tight">
                {candidate.name}
              </h2>

              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <div className="inline-flex items-center gap-1 font-mono-numeric font-medium text-slate-700">
                  <span>{candidate.passportNumber}</span>
                  <button
                    onClick={handleCopyPassport}
                    title="Copy passport number"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                  >
                    {copiedPassport ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <span>•</span>
                <span>Intake: {candidate.contactDate || 'Recorded'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Urgent Warning if Approved but Physical Passport is missing */}
            {isMissingPassportApproved && (
              <div className="rounded-lg border border-[#C0434A]/30 bg-[#C0434A]/8 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-[#C0434A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#C0434A]">
                      Action Required: Physical Passport Missing
                    </h4>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      This candidate&apos;s work permit has been issued, but their original passport is not in the office. Please collect the original passport immediately for embassy visa stamping.
                    </p>
                    <button
                      onClick={() => handleQuickToggle({ passportInHand: true })}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#C0434A] hover:bg-[#A8373E] px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Passport In Hand</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Stage Visualizer */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Milestone Progress
              </span>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg text-center">
                <div className="p-2 rounded bg-white shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-semibold">Step 1</div>
                  <div className="text-xs font-bold text-slate-800">Intake</div>
                  <div className="mt-1 flex justify-center text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className={`p-2 rounded ${candidate.submissionSlip ? 'bg-white shadow-2xs' : 'opacity-60'}`}>
                  <div className="text-[10px] text-slate-400 font-semibold">Step 2</div>
                  <div className="text-xs font-bold text-slate-800">Submitted</div>
                  <div className="mt-1 flex justify-center text-[#213F7C]">
                    {candidate.submissionSlip ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <span className="text-[10px] text-slate-400">Pending</span>}
                  </div>
                </div>
                <div className={`p-2 rounded ${candidate.approval ? 'bg-white shadow-2xs' : 'opacity-60'}`}>
                  <div className="text-[10px] text-slate-400 font-semibold">Step 3</div>
                  <div className="text-xs font-bold text-slate-800">Approved</div>
                  <div className="mt-1 flex justify-center text-emerald-600">
                    {candidate.approval ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <span className="text-[10px] text-slate-400">Review</span>}
                  </div>
                </div>
                <div className={`p-2 rounded ${candidate.stage === 'DEPLOYMENT_READY' ? 'bg-white shadow-2xs' : 'opacity-60'}`}>
                  <div className="text-[10px] text-slate-400 font-semibold">Step 4</div>
                  <div className="text-xs font-bold text-slate-800">Visa Ready</div>
                  <div className="mt-1 flex justify-center">
                    {candidate.stage === 'DEPLOYMENT_READY' ? <CheckCircle2 className="h-3.5 w-3.5 text-[#C0434A]" /> : <span className="text-[10px] text-slate-400">Pending</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Controls & Document Check */}
            <div className="clean-card p-4 space-y-4">
              <span className="text-xs font-bold text-[#213F7C] uppercase tracking-wider block border-b border-slate-100 pb-2">
                Document Checklist & Verification
              </span>

              {/* Physical Passport In Office */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Original Passport In Office</div>
                  <p className="text-[11px] text-slate-500">Physical document stored in vault</p>
                </div>
                <button
                  onClick={() => handleQuickToggle({ passportInHand: !candidate.passportInHand })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                    candidate.passportInHand
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {candidate.passportInHand ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>In Hand</span>
                    </>
                  ) : (
                    <span>Not Received</span>
                  )}
                </button>
              </div>

              {/* PCC Received */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Police Clearance Certificate (PCC)</div>
                  <p className="text-[11px] text-slate-500">Ministry certified background verification</p>
                </div>
                <button
                  onClick={() => handleQuickToggle({ pccReceived: !candidate.pccReceived })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                    candidate.pccReceived
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {candidate.pccReceived ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>Missing</span>
                  )}
                </button>
              </div>

              {/* Ministry Submission Slip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">Submission Slip</div>
                  <p className="text-[11px] text-slate-500">
                    {candidate.submissionDate ? `Filed on ${candidate.submissionDate}` : 'Pending filing with authorities'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleQuickToggle({
                      submissionSlip: !candidate.submissionSlip,
                      submissionDate: !candidate.submissionSlip
                        ? new Date().toLocaleDateString('en-GB')
                        : null,
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                    candidate.submissionSlip
                      ? 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/30'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {candidate.submissionSlip ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Filed</span>
                    </>
                  ) : (
                    <span>Mark Filed</span>
                  )}
                </button>
              </div>

              {/* Work Permit Approval & City */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Work Permit Approval</div>
                    <p className="text-[11px] text-slate-500">
                      {candidate.approvalDate ? `Granted on ${candidate.approvalDate}` : 'Pending ministry clearance'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickToggle({
                        approval: !candidate.approval,
                        approvalDate: !candidate.approval
                          ? new Date().toLocaleDateString('en-GB')
                          : null,
                        approvalCity: !candidate.approval ? candidate.approvalCity || 'Strumica' : candidate.approvalCity,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                      candidate.approval
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {candidate.approval ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approved</span>
                      </>
                    ) : (
                      <span>Mark Approved</span>
                    )}
                  </button>
                </div>

                {/* City selector if approved */}
                {candidate.approval && (
                  <div className="flex items-center gap-2 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">Approved Municipality:</span>
                    <select
                      value={candidate.approvalCity || 'Strumica'}
                      onChange={(e) => handleQuickToggle({ approvalCity: e.target.value })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-[#213F7C] focus:outline-none cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Sourcing Partner Agency Information */}
            <div className="clean-card p-4 space-y-2.5">
              <span className="text-xs font-bold text-[#213F7C] uppercase tracking-wider block border-b border-slate-100 pb-2">
                Sourcing Agency Details
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-[#213F7C]" />
                    <span>{candidate.agent?.name || 'Direct Sky Bridge Intake'}</span>
                  </div>
                  {candidate.agent?.location && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {candidate.agent.location}
                    </div>
                  )}
                  {candidate.agent?.contactPerson && (
                    <div className="text-xs text-slate-600 mt-1">
                      <span className="text-slate-400">Coordinator: </span>
                      {candidate.agent.contactPerson}
                    </div>
                  )}
                </div>
                {candidate.agent?.code && (
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                    {candidate.agent.code}
                  </span>
                )}
              </div>
            </div>

            {/* Operational Notes & Remarks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  <span>Internal Operational Remarks</span>
                </label>
                {saveSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes, e.g. medical status, agent follow-up, passport courier tracking..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none transition-all"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-md bg-[#213F7C] hover:bg-[#182F5D] px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={handleCopyWhatsAppSummary}
              className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied for WhatsApp!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copy Agent WhatsApp Update</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}