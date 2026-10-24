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
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Partner Agencies & Sourcing Network
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Managing candidate volume and clearance conversion rates across 17 regional partner offices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 font-mono-numeric">
            {agents.length} Partner Agencies
          </span>
        </div>
      </div>

      {/* Agency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const count = agent.candidateCount || 0;
          const approved = agent.approvedCount || 0;
          const submitted = agent.submittedCount || 0;

          return (
            <div
              key={agent.id}
              className="clean-card clean-card-hover p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {agent.name}
                      </h3>
                      {agent.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>{agent.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {count} files
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-center">
                  <div>
                    <div className="text-base font-bold text-slate-900 font-mono-numeric">
                      {count}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Intake</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-blue-600 font-mono-numeric">
                      {submitted}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Filed</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-emerald-600 font-mono-numeric">
                      {approved}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Approved</div>
                  </div>
                </div>

                {agent.contactPerson && (
                  <div className="mt-3 text-xs text-slate-600">
                    <span className="text-slate-400 text-[11px]">Contact: </span>
                    <span className="font-medium">{agent.contactPerson}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectAgentToFilter(agent.id)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <span>View Candidates</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
