import { NextRequest, NextResponse } from 'next/server';
import { getExportCandidates } from '@/lib/dataService';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const { agentId, city, stage, search } = await request.json().catch(() => ({}));

    const result = await getExportCandidates({
      agentId,
      city,
      stage,
      search,
    });

    const candidates = result.candidates;

    // Transform into clean tabular Excel rows
    const excelRows = candidates.map((c) => ({
      'SL': c.sl || '',
      'File ID': c.fileId,
      'Candidate Name': c.name,
      'Passport Number': c.passportNumber,
      'Contact Date': c.contactDate || '',
      'Sourcing Agent': c.agent?.name || 'Direct SkyBridge',
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
  } catch (error: unknown) {
    console.error('Error exporting excel:', error);
    return NextResponse.json(
      { success: false, error: 'Excel generation failed' },
      { status: 500 }
    );
  }
}
