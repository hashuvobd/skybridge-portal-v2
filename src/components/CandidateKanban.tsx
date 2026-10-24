'use client';

import React from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  Plane,
  MapPin,
  ChevronRight,
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
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export default function CandidateKanban({
  candidates,
  onUpdateCandidate,
}: CandidateKanbanProps) {
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
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pipeline Board</h2>
          <p className="text-xs text-slate-500">
            Track candidates progressing from intake to visa deployment readiness.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono-numeric">
          {candidates.length} total candidates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colCandidates = getCandidatesByStage(col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="clean-card flex flex-col max-h-[calc(100vh-220px)] overflow-hidden"
            >
              {/* Column Header */}
              <div className="border-b border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-600" />
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
                    No candidates in this stage
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
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {c.fileId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono-numeric text-slate-600">
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {c.passportNumber}
                        </span>
                        <span className="text-slate-500 truncate max-w-[100px]">
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
                          Passport: {c.passportInHand ? 'Yes' : 'No'}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded border font-medium ${
                            c.pccReceived
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          PCC: {c.pccReceived ? 'Yes' : 'No'}
                        </span>
                      </div>

                      {/* Advance Stage Button */}
                      {col.id !== 'DEPLOYMENT_READY' && (
                        <button
                          onClick={() => handleAdvanceStage(c)}
                          className="w-full mt-2 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                        >
                          <span>Advance stage</span>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
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
