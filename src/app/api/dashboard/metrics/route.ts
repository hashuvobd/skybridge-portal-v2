import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalCandidates,
      allCandidates,
      agents,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.candidate.findMany({
        select: {
          id: true,
          submissionSlip: true,
          submissionDate: true,
          approval: true,
          approvalDate: true,
          approvalCity: true,
          passportInHand: true,
          pccReceived: true,
          stage: true,
          agentId: true,
          agent: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.agent.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          location: true,
        },
      }),
    ]);

    let submittedFiles = 0;
    let approvalsGranted = 0;
    let deploymentReady = 0;
    let missingPassportsApproved = 0;
    let missingPccApproved = 0;
    let pendingOver30Days = 0;

    const cityMap: { [key: string]: { count: number; approvals: number } } = {};
    const agentStatsMap: { [key: string]: { name: string; total: number; submitted: number; approved: number } } = {};

    agents.forEach((ag) => {
      agentStatsMap[ag.id] = {
        name: ag.name,
        total: 0,
        submitted: 0,
        approved: 0,
      };
    });

    allCandidates.forEach((c) => {
      // Submissions count
      if (c.submissionSlip) {
        submittedFiles++;
      }

      // Approvals count
      if (c.approval) {
        approvalsGranted++;
        if (!c.passportInHand) missingPassportsApproved++;
        if (!c.pccReceived) missingPccApproved++;
      }

      // Deployment readiness
      if (c.approval && c.passportInHand && c.pccReceived) {
        deploymentReady++;
      }

      // Pending > 30 days (submitted but not approved)
      if (c.submissionSlip && !c.approval) {
        pendingOver30Days++;
      }

      // City breakdown
      if (c.approvalCity) {
        const cityKey = c.approvalCity.trim();
        if (!cityMap[cityKey]) {
          cityMap[cityKey] = { count: 0, approvals: 0 };
        }
        cityMap[cityKey].count++;
        if (c.approval) {
          cityMap[cityKey].approvals++;
        }
      }

      // Agent breakdown
      if (c.agentId && agentStatsMap[c.agentId]) {
        agentStatsMap[c.agentId].total++;
        if (c.submissionSlip) agentStatsMap[c.agentId].submitted++;
        if (c.approval) agentStatsMap[c.agentId].approved++;
      }
    });

    const inReview = Math.max(0, submittedFiles - approvalsGranted);

    const cityBreakdown = Object.entries(cityMap)
      .map(([city, data]) => ({
        city,
        count: data.count,
        approvals: data.approvals,
      }))
      .sort((a, b) => b.approvals - a.approvals || b.count - a.count);

    const agentLeaderboard = Object.values(agentStatsMap)
      .filter((a) => a.total > 0)
      .map((a) => ({
        agentName: a.name,
        total: a.total,
        submitted: a.submitted,
        approved: a.approved,
        conversionRate: a.total > 0 ? Math.round((a.approved / a.total) * 100) : 0,
      }))
      .sort((a, b) => b.approved - a.approved || b.total - a.total);

    return NextResponse.json({
      success: true,
      data: {
        totalCandidates,
        submittedFiles,
        approvalsGranted,
        inReview,
        deploymentReady,
        missingPassportsApproved,
        missingPccApproved,
        pendingOver30Days,
        cityBreakdown,
        agentLeaderboard,
      },
    });
  } catch (error: any) {
    console.error('Error computing dashboard metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}
