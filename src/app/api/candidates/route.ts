import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { PipelineStage } from '@prisma/client';

const candidateSchema = z.object({
  name: z.string().min(2, 'Candidate name must be at least 2 characters'),
  passportNumber: z.string().regex(/^[A-Z0-9]{7,12}$/i, 'Invalid Passport Number format'),
  contactDate: z.string().optional().nullable(),
  agentId: z.string().min(1, 'Agent is required'),
  submissionSlip: z.boolean().default(false),
  submissionDate: z.string().optional().nullable(),
  approval: z.boolean().default(false),
  approvalDate: z.string().optional().nullable(),
  approvalCity: z.string().optional().nullable(),
  passportInHand: z.boolean().default(false),
  pccReceived: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const agentId = searchParams.get('agentId')?.trim() || '';
    const stage = searchParams.get('stage')?.trim() || '';
    const city = searchParams.get('city')?.trim() || '';
    const urgent = searchParams.get('urgent')?.trim() || '';
    const passportInHand = searchParams.get('passportInHand');
    const pccReceived = searchParams.get('pccReceived');

    // Build filter query
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { passportNumber: { contains: search, mode: 'insensitive' } },
        { fileId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (agentId && agentId !== 'all') {
      where.agentId = agentId;
    }

    if (stage && stage !== 'ALL') {
      where.stage = stage as PipelineStage;
    }

    if (city && city !== 'all') {
      where.approvalCity = { contains: city, mode: 'insensitive' };
    }

    if (passportInHand !== null && passportInHand !== undefined && passportInHand !== '') {
      where.passportInHand = passportInHand === 'true';
    }

    if (pccReceived !== null && pccReceived !== undefined && pccReceived !== '') {
      where.pccReceived = pccReceived === 'true';
    }

    // Urgent filters
    if (urgent === 'missing_passport') {
      where.approval = true;
      where.passportInHand = false;
    } else if (urgent === 'missing_pcc') {
      where.approval = true;
      where.pccReceived = false;
    } else if (urgent === 'pending_30_days') {
      where.submissionSlip = true;
      where.approval = false;
    }

    const [candidates, totalCount] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              code: true,
              location: true,
            },
          },
        },
        orderBy: [{ sl: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: candidates,
      total: totalCount,
    });
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = candidateSchema.parse(body);

    // Auto-generate next fileId and SL
    const lastCandidate = await prisma.candidate.findFirst({
      orderBy: { sl: 'desc' },
      select: { sl: true },
    });
    const nextSl = (lastCandidate?.sl || 0) + 1;
    const nextFileId = `SB-NM-${String(nextSl).padStart(4, '0')}`;

    // Determine Stage
    let stage: PipelineStage = 'INTAKE';
    if (validated.approval) {
      if (validated.passportInHand && validated.pccReceived) {
        stage = 'DEPLOYMENT_READY';
      } else {
        stage = 'APPROVED';
      }
    } else if (validated.submissionSlip) {
      stage = 'SUBMITTED';
    }

    const newCandidate = await prisma.candidate.create({
      data: {
        sl: nextSl,
        fileId: nextFileId,
        name: validated.name.toUpperCase().trim(),
        passportNumber: validated.passportNumber.toUpperCase().trim(),
        contactForm: true,
        contactDate: validated.contactDate || new Date().toLocaleDateString('en-GB'),
        submissionSlip: validated.submissionSlip,
        submissionDate: validated.submissionDate || null,
        approval: validated.approval,
        approvalDate: validated.approvalDate || null,
        approvalCity: validated.approvalCity || null,
        passportInHand: validated.passportInHand,
        pccReceived: validated.pccReceived,
        stage: stage,
        agentId: validated.agentId,
        notes: validated.notes || null,
        auditLogs: {
          create: {
            action: 'CREATED_MANUAL',
            actor: 'Operations Admin',
            details: `Manually added candidate ${validated.name} (${nextFileId})`,
          },
        },
      },
      include: {
        agent: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCandidate,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}
