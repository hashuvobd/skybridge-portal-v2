'use client';

import React from 'react';
import {
  Users,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  MapPin,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DashboardMetrics } from '@/lib/types';

interface DashboardProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onFilterTrigger: (filterType: string, value: string) => void;
}

export default function OperationsDashboard({
  metrics,
  loading,
  onFilterTrigger,
}: DashboardProps) {
  if (loading || !metrics) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#213F7C] border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading operations analytics...</p>
        </div>
      </div>
    );
  }

  const submissionRate = metrics.totalCandidates > 0
    ? Math.round((metrics.submittedFiles / metrics.totalCandidates) * 100)
    : 0;
  const approvalRate = metrics.submittedFiles > 0
    ? Math.round((metrics.approvalsGranted / metrics.submittedFiles) * 100)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-3 sm:pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Executive Insights</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring across {metrics.totalCandidates} applicant files and 17 regional sourcing partners.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C0434A]/8 px-2.5 sm:px-3 py-1 text-xs font-bold text-[#C0434A] border border-[#C0434A]/25">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C0434A] animate-status-pulse" />
            21 Approvals Granted (Oct 2026)
          </span>
        </div>
      </div>

      {/* 4 Core Funnel KPI Cards (Responsive 2x2 grid on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Candidates */}
        <div
          onClick={() => onFilterTrigger('stage', 'ALL')}
          className="clean-card clean-card-hover p-3.5 sm:p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Intake
            </span>
            <div className="p-1 sm:p-1.5 rounded-md bg-slate-100 text-[#213F7C]">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-numeric">
              {metrics.totalCandidates}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">files</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 truncate">Master intake records</p>
          <div className="mt-2.5 sm:mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#213F7C] rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Submitted Files */}
        <div
          onClick={() => onFilterTrigger('stage', 'SUBMITTED')}
          className="clean-card clean-card-hover p-3.5 sm:p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submitted
            </span>
            <div className="p-1 sm:p-1.5 rounded-md bg-[#213F7C]/8 text-[#213F7C]">
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#213F7C] font-mono-numeric">
              {metrics.submittedFiles}
            </span>
            <span className="text-[11px] sm:text-xs text-[#213F7C] font-semibold">{submissionRate}% filed</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 truncate">Submission slips issued</p>
          <div className="mt-2.5 sm:mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#213F7C] rounded-full" style={{ width: `${submissionRate}%` }} />
          </div>
        </div>

        {/* Approvals Granted */}
        <div
          onClick={() => onFilterTrigger('stage', 'APPROVED')}
          className="clean-card clean-card-hover p-3.5 sm:p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
            </span>
            <div className="p-1 sm:p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono-numeric">
              {metrics.approvalsGranted}
            </span>
            <span className="text-[11px] sm:text-xs text-emerald-600 font-semibold">{approvalRate}% conv</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 truncate">Work permits cleared</p>
          <div className="mt-2.5 sm:mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${approvalRate}%` }} />
          </div>
        </div>

        {/* In Review / Pending */}
        <div
          onClick={() => onFilterTrigger('urgent', 'pending_30_days')}
          className="clean-card clean-card-hover p-3.5 sm:p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="p-1 sm:p-1.5 rounded-md bg-amber-50 text-amber-700">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono-numeric">
              {metrics.inReview}
            </span>
            <span className="text-[11px] sm:text-xs text-amber-600 font-semibold">in process</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 truncate">Awaiting ministry decision</p>
          <div className="mt-2.5 sm:mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.round((metrics.inReview / metrics.totalCandidates) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Items / Operational Attention Alerts */}
      <div className="clean-card p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h2 className="text-xs font-bold text-[#213F7C] uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-[#C0434A]" />
            <span>Required Actions & Verification Alerts</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Tap to inspect files</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Missing Passports for Approved (using #C0434A) */}
          <div
            onClick={() => onFilterTrigger('urgent', 'missing_passport_approved')}
            className="flex items-start gap-3 p-3 rounded-lg border border-[#C0434A]/30 bg-[#C0434A]/6 hover:bg-[#C0434A]/10 transition-colors cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 text-[#C0434A] shrink-0 mt-0.5 animate-status-pulse" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C0434A]">Missing Passports</span>
                <span className="font-mono text-xs font-bold text-white bg-[#C0434A] px-2 py-0.5 rounded">
                  {metrics.missingPassportsApproved} files
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Approved candidates needing physical passport collection from candidate.
              </p>
            </div>
          </div>

          {/* Missing PCC for Approved */}
          <div
            onClick={() => onFilterTrigger('urgent', 'missing_pcc_approved')}
            className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">Missing PCC</span>
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {metrics.missingPccApproved} files
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                Approved candidates pending Police Clearance Certificate verification.
              </p>
            </div>
          </div>

          {/* Pending > 30 Days */}
          <div
            onClick={() => onFilterTrigger('urgent', 'pending_30_days')}
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <Clock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Awaiting Decision</span>
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                  {metrics.pendingOver30Days} files
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Submissions filed over 30 days ago pending ministry clearance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Municipalities & Destination Regions */}
        <div className="clean-card p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#213F7C]" />
              <h3 className="text-xs font-bold text-[#213F7C] uppercase tracking-wider">
                Approved Municipalities
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">21 Total Clearances</span>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {metrics.cityBreakdown.map((item) => {
              const pct = Math.round((item.approvals / metrics.approvalsGranted) * 100) || 0;
              return (
                <div
                  key={item.city}
                  onClick={() => onFilterTrigger('city', item.city)}
                  className="group p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 group-hover:text-[#213F7C] transition-colors">
                      {item.city}
                    </span>
                    <span className="font-mono-numeric font-bold text-slate-900">
                      {item.approvals} approved ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Partner Agency Leaderboard */}
        <div className="clean-card p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#213F7C]" />
              <h3 className="text-xs font-bold text-[#213F7C] uppercase tracking-wider">
                Top Sourcing Agencies
              </h3>
            </div>
            <button
              onClick={() => onFilterTrigger('stage', 'ALL')}
              className="text-xs font-semibold text-[#213F7C] hover:text-[#182F5D] flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2.5 divide-y divide-slate-100">
            {metrics.agentLeaderboard.slice(0, 6).map((agent, i) => (
              <div
                key={agent.agentName}
                onClick={() => onFilterTrigger('agentName', agent.agentName)}
                className="flex items-center justify-between py-2 sm:py-2.5 hover:bg-slate-50/80 px-2 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="font-mono text-xs text-slate-400 w-3.5 shrink-0">{i + 1}</span>
                  <span className="text-xs font-semibold text-slate-800 truncate">{agent.agentName}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono-numeric shrink-0">
                  <span className="text-slate-500 hidden xs:inline">{agent.total} intake</span>
                  <span className="text-[#213F7C] font-medium">{agent.submitted} filed</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">
                    {agent.approved} approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
