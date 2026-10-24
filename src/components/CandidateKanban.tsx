'use client';

import React, { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  Plane,
  MapPin,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { CandidateRecord, PipelineStage } from '@/lib/types';

interface CandidateKanbanProps {
  candidates: CandidateRecord[];
  onUpdateCandidate: (id: string, updates: Partial<CandidateRecord>) => Promise<void>;
}

const COLUMNS: { id: PipelineStage; title: string; subtitle: string; icon: any; badgeColor: string }[] = [
  {
    id: 'INTAKE',
    title: '1. Intake',
    subtitle: 'Passport & Contact Details',
    icon: FileText,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'SUBMITTED',
    title: '2. Submitted',
    subtitle: 'Submission Slip Filed',
    icon: Send,
    badgeColor: 'bg-[#213F7C]/10 text-[#213F7C] border-[#213F7C]/20',
  },
  {
    id: 'APPROVED',
    title: '3. Approved',
    subtitle: 'Work Permit Granted',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'DEPLOYMENT_READY',
    title: '4. Deployment Ready',
    subtitle: 'Passport & PCC Collected',
    icon: Plane,
    badgeColor: 'bg-[#C0434A]/10 text-[#C0434A] border-[#C0434A]/25',
  },
];

export default function CandidateKanban({
  candidates,
  onUpdateCandidate,
}: CandidateKanbanProps) {
  const [activeMobileColumn, setActiveMobileColumn] = useState<PipelineStage>('INTAKE');

  const getCandidatesByStage = (stage: PipelineStage) => {
    return candidates.filter((c) => c.stage === stage);
  };

  const handleAdvanceStage = (c: CandidateRecord) => {
    const today = new Date().toLocaleDateString('en-GB');
    if (c.stage === 'INTAKE') {
      onUpdateCandidate(c.id, {
        submissionSlip: true,
        submissionDate: today,
      });
    } else if (c.stage === 'SUBMITTED') {
      onUpdateCandidate(c.id, {
        approval: true,
        approvalDate: today,
        approvalCity: c.approvalCity || 'Strumica',
      });
    } else if (c.stage === 'APPROVED') {
      onUpdateCandidate(c.id, {
        passportInHand: true,
        pccReceived: true,
      });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Pipeline Kanban Board</h2>
          <p className="text-xs text-slate-500">
            Track candidates progressing from initial intake to departure clearance.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono-numeric">
          {candidates.length} active files
        </span>
      </div>

      {/* Mobile Stage Selector Pill Tabs (< lg screens) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {COLUMNS.map((col) => {
          const count = getCandidatesByStage(col.id).length;
          const isActive = activeMobileColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileColumn(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <span>{col.title.split('. ')[1]}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono-numeric font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Grid (Desktop 4 columns, Mobile single focused column or swipe) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 sm:gap-4 items-start">
        {COLUMNS.map((col) => {
          const colCandidates = getCandidatesByStage(col.id);
          const Icon = col.icon;
          const isHiddenOnMobile = activeMobileColumn !== col.id;

          return (
            <div
              key={col.id}
              className={`clean-card flex flex-col max-h-[calc(100vh-220px)] overflow-hidden ${
                isHiddenOnMobile ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Column Header */}
              <div className="border-b border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-white border border-slate-200 text-slate-700">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                    <p className="text-[10px] text-slate-500">{col.subtitle}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${col.badgeColor}`}>
                  {colCandidates.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {colCandidates.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No candidates currently in this stage
                  </div>
                ) : (
                  colCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="clean-card clean-card-hover p-3 space-y-2 bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 text-xs uppercase leading-tight">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded shrink-0">
                          {c.fileId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono-numeric text-slate-600">
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {c.passportNumber}
                        </span>
                        <span className="text-slate-500 truncate max-w-[110px]">
                          {c.agent?.name || 'Direct'}
                        </span>
                      </div>

                      {c.approvalCity && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{c.approvalCity}</span>
                          {c.approvalDate && (
                            <span className="text-emerald-600 ml-auto text-[10px]">
                              {c.approvalDate}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Document Status Pills */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded border font-medium ${
                            c.passportInHand
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          Passport: {c.passportInHand ? 'Verified' : 'Pending'}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded border font-medium ${
                            c.pccReceived
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          PCC: {c.pccReceived ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      {/* Advance Stage Button */}
                      {col.id !== 'DEPLOYMENT_READY' && (
                        <button
                          onClick={() => handleAdvanceStage(c)}
                          className="w-full mt-1.5 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-[#213F7C] bg-[#213F7C]/8 hover:bg-[#213F7C] hover:text-white border border-[#213F7C]/20 transition-all cursor-pointer"
                        >
                          <span>Move to Next Stage</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
