'use client';

import React from 'react';
import {
  Building2,
  Users,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { AgentRecord } from '@/lib/types';

interface AgentDirectoryProps {
  agents: AgentRecord[];
  onSelectAgentToFilter: (agentId: string) => void;
}

export default function AgentDirectory({
  agents,
  onSelectAgentToFilter,
}: AgentDirectoryProps) {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-3 sm:pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Partner Sourcing Agencies
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing candidate volume and conversion metrics across 17 regional partner offices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 font-mono-numeric">
            {agents.length} Partner Offices
          </span>
        </div>
      </div>

      {/* Agency Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {agents.map((agent) => {
          const count = agent.candidateCount || 0;
          const approved = agent.approvedCount || 0;
          const submitted = agent.submittedCount || 0;

          return (
            <div
              key={agent.id}
              className="clean-card clean-card-hover p-3.5 sm:p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-[#213F7C] shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {agent.name}
                      </h3>
                      {agent.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{agent.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {count} files
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5 text-center">
                  <div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-mono-numeric">
                      {count}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Intake</div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-[#213F7C] font-mono-numeric">
                      {submitted}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Filed</div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-emerald-600 font-mono-numeric">
                      {approved}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Approved</div>
                  </div>
                </div>

                {agent.contactPerson && (
                  <div className="mt-2.5 text-xs text-slate-600">
                    <span className="text-slate-400 text-[11px]">Coordinator: </span>
                    <span className="font-medium text-slate-800">{agent.contactPerson}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectAgentToFilter(agent.id)}
                className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-[#213F7C] bg-[#213F7C]/8 hover:bg-[#213F7C] hover:text-white border border-[#213F7C]/20 transition-all cursor-pointer group"
              >
                <span>Filter Agency Candidates</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
