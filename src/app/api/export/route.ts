import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const { agentId, city, stage, search } = await request.json().catch(() => ({}));

    const where: any = {};
    if (agentId && agentId !== 'all') where.agentId = agentId;
    if (city && city !== 'all') where.approvalCity = { contains: city, mode: 'insensitive' };
    if (stage && stage !== 'ALL') where.stage = stage;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { passportNumber: { contains: search, mode: 'insensitive' } },
        { fileId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        agent: true,
      },
      orderBy: { sl: 'asc' },
    });

    // Transform into clean tabular Excel rows
    const excelRows = candidates.map((c) => ({
      'SL': c.sl || '',
      'File ID': c.fileId,
      'Candidate Name': c.name,
      'Passport Number': c.passportNumber,
      'Contact Date': c.contactDate || '',
      'Sourcing Agent': c.agent?.name || 'Direct',
      'Submission Slip': c.submissionSlip ? 'Yes' : 'No',
      'Submission Date': c.submissionDate || '',
      'Approval Status': c.approval ? 'Approved' : 'Pending',
      'Approval City': c.approvalCity || '',
      'Approval Date': c.approvalDate || '',
      'Passport in Hand': c.passportInHand ? 'Yes' : 'No',
      'PCC Received': c.pccReceived ? 'Yes' : 'No',
      'Pipeline Stage': c.stage,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Candidates');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="SkyBridge_Candidates_Export_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting excel:', error);
    return NextResponse.json(
      { success: false, error: 'Excel generation failed' },
      { status: 500 }
    );
  }
}
