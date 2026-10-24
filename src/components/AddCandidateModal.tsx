'use client';

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { AgentRecord } from '@/lib/types';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentRecord[];
  onAddCandidate: (data: any) => Promise<boolean>;
}

const CITIES = ['Strumica', 'Tetovo', 'Skopje', 'Kumanovo', 'Shtip', 'Bitola'];

export default function AddCandidateModal({
  isOpen,
  onClose,
  agents,
  onAddCandidate,
}: AddCandidateModalProps) {
  const [name, setName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [agentId, setAgentId] = useState('');
  const [contactDate, setContactDate] = useState('');

  React.useEffect(() => {
    setContactDate(new Date().toLocaleDateString('en-GB'));
  }, []);

  const [submissionSlip, setSubmissionSlip] = useState(false);
  const [submissionDate, setSubmissionDate] = useState('');
  const [approvalCity, setApprovalCity] = useState('Strumica');
  const [passportInHand, setPassportInHand] = useState(true);
  const [pccReceived, setPccReceived] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Candidate full name is required');
      return;
    }

    if (!passportNumber.trim() || passportNumber.trim().length < 7) {
      setErrorMsg('Valid Passport number is required (e.g. A09578491)');
      return;
    }

    if (!agentId) {
      setErrorMsg('Please select a sourcing agency');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onAddCandidate({
        name: name.trim().toUpperCase(),
        passportNumber: passportNumber.trim().toUpperCase(),
        agentId,
        contactDate,
        submissionSlip,
        submissionDate: submissionSlip ? submissionDate || contactDate : null,
        approvalCity: submissionSlip ? approvalCity : null,
        passportInHand,
        pccReceived,
        notes: notes.trim() || null,
      });

      if (ok) {
        onClose();
        setName('');
        setPassportNumber('');
        setAgentId('');
        setSubmissionSlip(false);
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="clean-card w-full max-w-lg p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213F7C]/10 text-[#213F7C]">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add New Candidate</h2>
              <p className="text-[11px] text-slate-500">Manual candidate intake for visa processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-[#C0434A]/10 border border-[#C0434A]/30 p-2.5 text-xs text-[#C0434A]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Candidate Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Candidate Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. MOHAMMAD RAHMAN"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none uppercase"
              required
            />
          </div>

          {/* Passport Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Passport Number *
              </label>
              <input
                type="text"
                placeholder="e.g. A09578491"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none font-mono-numeric uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Intake Date
              </label>
              <input
                type="text"
                placeholder="DD.MM.YYYY"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none font-mono-numeric"
              />
            </div>
          </div>

          {/* Sourcing Agency */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sourcing Partner Agency *
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none cursor-pointer"
              required
            >
              <option value="">Select an agency...</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Document Verification Checkboxes */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5">
            <span className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Document Checklist
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passportInHand}
                  onChange={(e) => setPassportInHand(e.target.checked)}
                  className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                />
                <span className="text-slate-800">Physical Passport In Office</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pccReceived}
                  onChange={(e) => setPccReceived(e.target.checked)}
                  className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
                />
                <span className="text-slate-800">PCC Certificate Collected</span>
              </label>
            </div>
          </div>

          {/* Submission Slip Filed? */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={submissionSlip}
                onChange={(e) => setSubmissionSlip(e.target.checked)}
                className="rounded border-slate-300 accent-[#213F7C] text-[#213F7C] focus:ring-[#213F7C] cursor-pointer"
              />
              <span className="font-semibold text-slate-800">Already filed with Ministry / Immigration (Submission Slip)</span>
            </label>

            {submissionSlip && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Submission Date</label>
                  <input
                    type="text"
                    placeholder="DD.MM.YYYY"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 font-mono-numeric"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Target Municipality</label>
                  <select
                    value={approvalCity}
                    onChange={(e) => setApprovalCity(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Medical pending, second contact number..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#213F7C] focus:ring-1 focus:ring-[#213F7C] focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-[#C0434A] hover:bg-[#A8373E] text-white font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
