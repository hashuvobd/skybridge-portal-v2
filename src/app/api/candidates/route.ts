import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCandidates, createCandidate } from '@/lib/dataService';

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

    const result = await getCandidates({
      search,
      agentId,
      stage,
      city,
      urgent,
      passportInHand,
      pccReceived,
    });

    return NextResponse.json({
      success: true,
      data: result.candidates,
      total: result.total,
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
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

    const result = await createCandidate(validated);

    return NextResponse.json({
      success: true,
      data: result.candidate,
      isDummy: result.isDummy,
    });
  } catch (error: unknown) {
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
