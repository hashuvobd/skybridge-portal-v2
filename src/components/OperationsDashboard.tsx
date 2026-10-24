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
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading pipeline analytics...</p>
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
    <div className="space-y-6 pb-12">
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {metrics.totalCandidates} applicant files across 17 partner agencies for North Macedonia work visa clearances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            21 Approvals Granted (Oct 2026)
          </span>
        </div>
      </div>

      {/* 4 Core Funnel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div
          onClick={() => onFilterTrigger('stage', 'ALL')}
          className="clean-card clean-card-hover p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Intake
            </span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-numeric">
              {metrics.totalCandidates}
            </span>
            <span className="text-xs text-slate-500 font-medium">candidates</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Master database records</p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Submitted Files */}
        <div
          onClick={() => onFilterTrigger('stage', 'SUBMITTED')}
          className="clean-card clean-card-hover p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submitted to NM
            </span>
            <Send className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-numeric">
              {metrics.submittedFiles}
            </span>
            <span className="text-xs text-blue-600 font-semibold">{submissionRate}% filed</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Submission slips issued</p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${submissionRate}%` }} />
          </div>
        </div>

        {/* Approvals Granted */}
        <div
          onClick={() => onFilterTrigger('stage', 'APPROVED')}
          className="clean-card clean-card-hover p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approvals Granted
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono-numeric">
              {metrics.approvalsGranted}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">{approvalRate}% conversion</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Work permits authorized</p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${approvalRate}%` }} />
          </div>
        </div>

        {/* In Review / Pending */}
        <div
          onClick={() => onFilterTrigger('urgent', 'pending_30_days')}
          className="clean-card clean-card-hover p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-numeric">
              {metrics.inReview}
            </span>
            <span className="text-xs text-amber-600 font-semibold">in process</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Awaiting clearance decision</p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.round((metrics.inReview / metrics.totalCandidates) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Items / Attention Alerts */}
      <div className="clean-card p-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Required Actions & Verification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Missing Passports for Approved */}
          <div
            onClick={() => onFilterTrigger('urgent', 'missing_passport_approved')}
            className="flex items-start gap-3 p-3 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-900">Missing Passports</span>
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  {metrics.missingPassportsApproved} files
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1">
                Approved candidates needing physical passport collection.
              </p>
            </div>
          </div>

          {/* Missing PCC for Approved */}
          <div
            onClick={() => onFilterTrigger('urgent', 'missing_pcc_approved')}
            className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">Missing PCC</span>
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  {metrics.missingPccApproved} files
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Approved candidates pending police clearance verification.
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
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macedonian Municipalities */}
        <div className="clean-card p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Approved Municipalities (North Macedonia)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">21 Total Clearances</span>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.cityBreakdown.map((item) => {
              const pct = Math.round((item.approvals / metrics.approvalsGranted) * 100) || 0;
              return (
                <div
                  key={item.city}
                  onClick={() => onFilterTrigger('city', item.city)}
                  className="group p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
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
        <div className="clean-card p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top Sourcing Agencies
              </h3>
            </div>
            <button
              onClick={() => onFilterTrigger('stage', 'ALL')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {metrics.agentLeaderboard.slice(0, 6).map((agent, i) => (
              <div
                key={agent.agentName}
                onClick={() => onFilterTrigger('agentName', agent.agentName)}
                className="flex items-center justify-between py-2.5 hover:bg-slate-50/80 px-2 rounded-md transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-slate-400 w-4">{i + 1}</span>
                  <span className="text-xs font-medium text-slate-800">{agent.agentName}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono-numeric">
                  <span className="text-slate-500">{agent.total} intake</span>
                  <span className="text-blue-600">{agent.submitted} filed</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
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
