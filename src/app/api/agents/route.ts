import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
        candidates: {
          select: {
            submissionSlip: true,
            approval: true,
            stage: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formatted = agents.map((ag) => {
      let approvedCount = 0;
      let submittedCount = 0;

      ag.candidates.forEach((c) => {
        if (c.approval) approvedCount++;
        if (c.submissionSlip) submittedCount++;
      });

      return {
        id: ag.id,
        name: ag.name,
        code: ag.code,
        location: ag.location,
        contactPerson: ag.contactPerson,
        phone: ag.phone,
        email: ag.email,
        notes: ag.notes,
        candidateCount: ag._count.candidates,
        approvedCount,
        submittedCount,
        conversionRate: ag._count.candidates > 0 ? Math.round((approvedCount / ag._count.candidates) * 100) : 0,
        createdAt: ag.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent directory' },
      { status: 500 }
    );
  }
}
