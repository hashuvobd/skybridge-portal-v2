import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { initialMockAgents, initialMockCandidates } from '@/lib/dummyData';
import { CandidateRecord, AgentRecord, DashboardMetrics, PipelineStage } from '@/lib/types';

// In-memory mock store initialized with dummy data
// Used strictly as a placeholder when no database is connected
const globalForMock = globalThis as unknown as {
  mockCandidates: CandidateRecord[] | undefined;
  mockAgents: AgentRecord[] | undefined;
};

if (!globalForMock.mockCandidates) {
  globalForMock.mockCandidates = JSON.parse(JSON.stringify(initialMockCandidates));
}
if (!globalForMock.mockAgents) {
  globalForMock.mockAgents = JSON.parse(JSON.stringify(initialMockAgents));
}

const mockCandidates = globalForMock.mockCandidates!;
const mockAgents = globalForMock.mockAgents!;

// Check if DATABASE_URL is configured with a real connection string
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === '') return false;
  if (
    url.includes('[') ||
    url.includes('your-project-id') ||
    url.includes('your-supabase-anon-key') ||
    url.includes('example.com')
  ) {
    return false;
  }
  return true;
}

let dbConnectedCache: { status: boolean; timestamp: number } | null = null;
const CACHE_TTL_MS = 10000; // 10 seconds cache

export async function isDatabaseConnected(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const now = Date.now();
  if (dbConnectedCache && now - dbConnectedCache.timestamp < CACHE_TTL_MS) {
    return dbConnectedCache.status;
  }

  try {
    // Quick probe to check if database is reachable and schema is present
    const check = Promise.race([
      prisma.candidate.findFirst({ select: { id: true } }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2500)),
    ]);
    await check;
    dbConnectedCache = { status: true, timestamp: now };
    return true;
  } catch (_error) {
    // Database is either down, unreachable, or tables not yet pushed
    dbConnectedCache = { status: false, timestamp: now };
    return false;
  }
}

// -------------------------------------------------------------
// CANDIDATES DATA ACCESS
// -------------------------------------------------------------

export interface CandidateQueryFilters {
  search?: string;
  agentId?: string;
  stage?: string;
  city?: string;
  urgent?: string;
  passportInHand?: string | null;
  pccReceived?: string | null;
}

export async function getCandidates(filters: CandidateQueryFilters): Promise<{
  candidates: CandidateRecord[];
  total: number;
  isDummy: boolean;
}> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    // Live Database Access (Prisma)
    const where: Record<string, unknown> = {};
    const { search, agentId, stage, city, urgent, passportInHand, pccReceived } = filters;

    if (search) {
      const searchNum = parseInt(search.replace(/[^0-9]/g, ''), 10);
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { passportNumber: { contains: search, mode: 'insensitive' } },
        ...(!isNaN(searchNum) ? [{ sl: searchNum }] : []),
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
    if (urgent === 'missing_passport' || urgent === 'missing_passport_approved') {
      where.approval = true;
      where.passportInHand = false;
    } else if (urgent === 'missing_pcc' || urgent === 'missing_pcc_approved') {
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

    return {
      candidates: candidates as CandidateRecord[],
      total: totalCount,
      isDummy: false,
    };
  }

  // Fallback Dummy Data Store (Placeholder mode)
  let result = [...mockCandidates];
  const { search, agentId, stage, city, urgent, passportInHand, pccReceived } = filters;

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.passportNumber.toLowerCase().includes(s) ||
        (c.sl !== null && String(c.sl).includes(s))
    );
  }

  if (agentId && agentId !== 'all') {
    result = result.filter((c) => c.agentId === agentId);
  }

  if (stage && stage !== 'ALL') {
    result = result.filter((c) => c.stage === stage);
  }

  if (city && city !== 'all') {
    result = result.filter(
      (c) => c.approvalCity && c.approvalCity.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (passportInHand !== null && passportInHand !== undefined && passportInHand !== '') {
    const target = passportInHand === 'true';
    result = result.filter((c) => c.passportInHand === target);
  }

  if (pccReceived !== null && pccReceived !== undefined && pccReceived !== '') {
    const target = pccReceived === 'true';
    result = result.filter((c) => c.pccReceived === target);
  }

  if (urgent === 'missing_passport' || urgent === 'missing_passport_approved') {
    result = result.filter((c) => c.approval && !c.passportInHand);
  } else if (urgent === 'missing_pcc' || urgent === 'missing_pcc_approved') {
    result = result.filter((c) => c.approval && !c.pccReceived);
  } else if (urgent === 'pending_30_days') {
    result = result.filter((c) => c.submissionSlip && !c.approval);
  }

  // Sort by SL ascending
  result.sort((a, b) => (a.sl || 0) - (b.sl || 0));

  return {
    candidates: result,
    total: result.length,
    isDummy: true,
  };
}

export async function createCandidate(data: {
  name: string;
  passportNumber: string;
  contactDate?: string | null;
  agentId: string;
  submissionSlip?: boolean;
  submissionDate?: string | null;
  approval?: boolean;
  approvalDate?: string | null;
  approvalCity?: string | null;
  passportInHand?: boolean;
  pccReceived?: boolean;
  notes?: string | null;
}): Promise<{ candidate: CandidateRecord; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  // Determine Pipeline Stage
  let stage: PipelineStage = 'INTAKE';
  if (data.approval) {
    if (data.passportInHand && data.pccReceived) {
      stage = 'DEPLOYMENT_READY';
    } else {
      stage = 'APPROVED';
    }
  } else if (data.submissionSlip) {
    stage = 'SUBMITTED';
  }

  if (dbConnected) {
    const lastCandidate = await prisma.candidate.findFirst({
      orderBy: { sl: 'desc' },
      select: { sl: true },
    });
    const nextSl = (lastCandidate?.sl || 0) + 1;

    const newCandidate = await prisma.candidate.create({
      data: {
        sl: nextSl,
        name: data.name.toUpperCase().trim(),
        passportNumber: data.passportNumber.toUpperCase().trim(),
        contactForm: true,
        contactDate: data.contactDate || new Date().toLocaleDateString('en-GB'),
        submissionSlip: !!data.submissionSlip,
        submissionDate: data.submissionDate || null,
        approval: !!data.approval,
        approvalDate: data.approvalDate || null,
        approvalCity: data.approvalCity || null,
        passportInHand: !!data.passportInHand,
        pccReceived: !!data.pccReceived,
        stage: stage,
        agentId: data.agentId,
        notes: data.notes || null,
        auditLogs: {
          create: {
            action: 'CREATED_MANUAL',
            actor: 'Operations Admin',
            details: `Manually added candidate ${data.name} (SL #${nextSl})`,
          },
        },
      },
      include: {
        agent: true,
      },
    });

    return { candidate: newCandidate as CandidateRecord, isDummy: false };
  }

  // Dummy Store Creation
  const maxSl = mockCandidates.reduce((max, c) => Math.max(max, c.sl || 0), 0);
  const nextSl = maxSl + 1;

  const agent = mockAgents.find((a) => a.id === data.agentId) || {
    id: data.agentId,
    name: 'Direct SkyBridge',
    code: 'SBD',
    location: 'Dhaka - Head Office',
  };

  const newCandidate: CandidateRecord = {
    id: `cand-${Date.now()}`,
    sl: nextSl,
    name: data.name.toUpperCase().trim(),
    passportNumber: data.passportNumber.toUpperCase().trim(),
    contactForm: true,
    contactDate: data.contactDate || new Date().toLocaleDateString('en-GB'),
    submissionSlip: !!data.submissionSlip,
    submissionDate: data.submissionDate || null,
    approval: !!data.approval,
    approvalDate: data.approvalDate || null,
    approvalCity: data.approvalCity || null,
    passportInHand: !!data.passportInHand,
    pccReceived: !!data.pccReceived,
    stage: stage,
    agentId: data.agentId,
    agent: {
      id: agent.id,
      name: agent.name,
      code: agent.code,
      location: agent.location,
    },
    notes: data.notes || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockCandidates.push(newCandidate);
  return { candidate: newCandidate, isDummy: true };
}

export async function updateCandidate(
  id: string,
  updates: Partial<CandidateRecord>
): Promise<{ candidate: CandidateRecord | null; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) return { candidate: null, isDummy: false };

    const updatedApproval = updates.approval !== undefined ? updates.approval : existing.approval;
    const updatedSubmission = updates.submissionSlip !== undefined ? updates.submissionSlip : existing.submissionSlip;
    const updatedPassportInHand = updates.passportInHand !== undefined ? updates.passportInHand : existing.passportInHand;
    const updatedPcc = updates.pccReceived !== undefined ? updates.pccReceived : existing.pccReceived;

    let nextStage: PipelineStage = updates.stage || 'INTAKE';
    if (!updates.stage) {
      if (updatedApproval) {
        if (updatedPassportInHand && updatedPcc) {
          nextStage = 'DEPLOYMENT_READY';
        } else {
          nextStage = 'APPROVED';
        }
      } else if (updatedSubmission) {
        nextStage = 'SUBMITTED';
      }
    }

    const cleanUpdates = { ...updates };
    delete cleanUpdates.agent;
    delete cleanUpdates.id;
    delete cleanUpdates.createdAt;
    delete cleanUpdates.updatedAt;

    const updateData: Prisma.CandidateUncheckedUpdateInput = {
      ...(cleanUpdates as Prisma.CandidateUncheckedUpdateInput),
      stage: nextStage,
      auditLogs: {
        create: {
          action: 'CELL_UPDATE',
          actor: 'Operations Admin',
          details: `Updated fields: ${Object.keys(updates).join(', ')} -> Stage: ${nextStage}`,
        },
      },
    };

    const updated = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        agent: true,
      },
    });

    return { candidate: updated as CandidateRecord, isDummy: false };
  }

  // Dummy Store Update
  const index = mockCandidates.findIndex((c) => c.id === id);
  if (index === -1) return { candidate: null, isDummy: true };

  const existing = mockCandidates[index];
  const updatedApproval = updates.approval !== undefined ? updates.approval : existing.approval;
  const updatedSubmission = updates.submissionSlip !== undefined ? updates.submissionSlip : existing.submissionSlip;
  const updatedPassportInHand = updates.passportInHand !== undefined ? updates.passportInHand : existing.passportInHand;
  const updatedPcc = updates.pccReceived !== undefined ? updates.pccReceived : existing.pccReceived;

  let nextStage: PipelineStage = updates.stage || 'INTAKE';
  if (!updates.stage) {
    if (updatedApproval) {
      if (updatedPassportInHand && updatedPcc) {
        nextStage = 'DEPLOYMENT_READY';
      } else {
        nextStage = 'APPROVED';
      }
    } else if (updatedSubmission) {
      nextStage = 'SUBMITTED';
    }
  }

  const updatedCandidate: CandidateRecord = {
    ...existing,
    ...updates,
    stage: nextStage,
    updatedAt: new Date(),
  };

  mockCandidates[index] = updatedCandidate;
  return { candidate: updatedCandidate, isDummy: true };
}

export async function deleteCandidate(id: string): Promise<{ success: boolean; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    await prisma.candidate.delete({ where: { id } });
    return { success: true, isDummy: false };
  }

  const index = mockCandidates.findIndex((c) => c.id === id);
  if (index !== -1) {
    mockCandidates.splice(index, 1);
  }
  return { success: true, isDummy: true };
}

export async function batchUpdateCandidates(
  candidateIds: string[],
  action: string,
  city?: string,
  date?: string
): Promise<{ success: boolean; count: number; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();
  const todayStr = date || new Date().toLocaleDateString('en-GB');

  if (dbConnected) {
    if (action === 'MARK_SUBMITTED') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              submissionSlip: true,
              submissionDate: todayStr,
              stage: 'SUBMITTED',
            },
          })
        )
      );
    } else if (action === 'MARK_APPROVED') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              approval: true,
              approvalDate: todayStr,
              approvalCity: city || 'Strumica',
              stage: 'APPROVED',
            },
          })
        )
      );
    } else if (action === 'MARK_PASSPORT_IN_HAND') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              passportInHand: true,
            },
          })
        )
      );
    } else if (action === 'MARK_PCC_RECEIVED') {
      await prisma.$transaction(
        candidateIds.map((id) =>
          prisma.candidate.update({
            where: { id },
            data: {
              pccReceived: true,
            },
          })
        )
      );
    }

    return { success: true, count: candidateIds.length, isDummy: false };
  }

  // Dummy Store Batch Update
  const idSet = new Set(candidateIds);
  let updatedCount = 0;

  for (let i = 0; i < mockCandidates.length; i++) {
    const c = mockCandidates[i];
    if (!idSet.has(c.id)) continue;

    if (action === 'MARK_SUBMITTED') {
      c.submissionSlip = true;
      c.submissionDate = todayStr;
      if (c.stage === 'INTAKE') c.stage = 'SUBMITTED';
      c.updatedAt = new Date();
      updatedCount++;
    } else if (action === 'MARK_APPROVED') {
      c.approval = true;
      c.approvalDate = todayStr;
      c.approvalCity = city || 'Strumica';
      if (c.passportInHand && c.pccReceived) {
        c.stage = 'DEPLOYMENT_READY';
      } else {
        c.stage = 'APPROVED';
      }
      c.updatedAt = new Date();
      updatedCount++;
    } else if (action === 'MARK_PASSPORT_IN_HAND') {
      c.passportInHand = true;
      if (c.approval && c.pccReceived) {
        c.stage = 'DEPLOYMENT_READY';
      }
      c.updatedAt = new Date();
      updatedCount++;
    } else if (action === 'MARK_PCC_RECEIVED') {
      c.pccReceived = true;
      if (c.approval && c.passportInHand) {
        c.stage = 'DEPLOYMENT_READY';
      }
      c.updatedAt = new Date();
      updatedCount++;
    }
  }

  return { success: true, count: updatedCount, isDummy: true };
}

// -------------------------------------------------------------
// AGENTS DIRECTORY ACCESS
// -------------------------------------------------------------

export async function getAgents(): Promise<{ agents: AgentRecord[]; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
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

    return { agents: formatted, isDummy: false };
  }

  // Dummy Store Agent Analytics
  const formatted = mockAgents.map((ag) => {
    const candidatesForAgent = mockCandidates.filter((c) => c.agentId === ag.id);
    const candidateCount = candidatesForAgent.length;
    let approvedCount = 0;
    let submittedCount = 0;

    candidatesForAgent.forEach((c) => {
      if (c.approval) approvedCount++;
      if (c.submissionSlip) submittedCount++;
    });

    return {
      ...ag,
      candidateCount,
      approvedCount,
      submittedCount,
      conversionRate: candidateCount > 0 ? Math.round((approvedCount / candidateCount) * 100) : 0,
    };
  });

  return { agents: formatted, isDummy: true };
}

export async function createAgent(data: {
  name: string;
  code?: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
}): Promise<{ agent: AgentRecord; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();
  const trimmedName = data.name.trim();
  const code =
    data.code?.trim().toUpperCase() ||
    trimmedName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() ||
    'AGNT';

  if (dbConnected) {
    const created = await prisma.agent.create({
      data: {
        name: trimmedName,
        code,
        location: data.location?.trim() || null,
        contactPerson: data.contactPerson?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    return {
      agent: {
        id: created.id,
        name: created.name,
        code: created.code,
        location: created.location,
        contactPerson: created.contactPerson,
        phone: created.phone,
        email: created.email,
        notes: created.notes,
        candidateCount: 0,
        approvedCount: 0,
        submittedCount: 0,
        createdAt: created.createdAt,
      },
      isDummy: false,
    };
  }

  const newAgent: AgentRecord = {
    id: `agent-${Date.now()}`,
    name: trimmedName,
    code,
    location: data.location?.trim() || 'Regional Office',
    contactPerson: data.contactPerson?.trim() || null,
    phone: data.phone?.trim() || null,
    email: data.email?.trim() || null,
    notes: data.notes?.trim() || null,
    candidateCount: 0,
    approvedCount: 0,
    submittedCount: 0,
    createdAt: new Date(),
  };

  mockAgents.push(newAgent);
  return { agent: newAgent, isDummy: true };
}

export async function updateAgent(
  id: string,
  updates: Partial<{
    name: string;
    code?: string;
    location?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    notes?: string;
  }>
): Promise<{ agent: AgentRecord | null; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const existing = await prisma.agent.findUnique({
      where: { id },
      include: {
        _count: { select: { candidates: true } },
        candidates: { select: { submissionSlip: true, approval: true } },
      },
    });
    if (!existing) return { agent: null, isDummy: false };

    const updated = await prisma.agent.update({
      where: { id },
      data: {
        name: updates.name !== undefined ? updates.name.trim() : undefined,
        code: updates.code !== undefined ? updates.code.trim().toUpperCase() : undefined,
        location: updates.location !== undefined ? updates.location.trim() || null : undefined,
        contactPerson: updates.contactPerson !== undefined ? updates.contactPerson.trim() || null : undefined,
        phone: updates.phone !== undefined ? updates.phone.trim() || null : undefined,
        email: updates.email !== undefined ? updates.email.trim() || null : undefined,
        notes: updates.notes !== undefined ? updates.notes.trim() || null : undefined,
      },
    });

    let approvedCount = 0;
    let submittedCount = 0;
    existing.candidates.forEach((c) => {
      if (c.approval) approvedCount++;
      if (c.submissionSlip) submittedCount++;
    });

    return {
      agent: {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        location: updated.location,
        contactPerson: updated.contactPerson,
        phone: updated.phone,
        email: updated.email,
        notes: updated.notes,
        candidateCount: existing._count.candidates,
        approvedCount,
        submittedCount,
        createdAt: updated.createdAt,
      },
      isDummy: false,
    };
  }

  const idx = mockAgents.findIndex((a) => a.id === id);
  if (idx === -1) return { agent: null, isDummy: true };

  mockAgents[idx] = {
    ...mockAgents[idx],
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : mockAgents[idx].name,
    code: updates.code !== undefined ? updates.code.trim().toUpperCase() : mockAgents[idx].code,
  };

  return { agent: mockAgents[idx], isDummy: true };
}

export async function deleteAgent(id: string): Promise<{ success: boolean; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { _count: { select: { candidates: true } } },
    });
    if (!agent) return { success: false, isDummy: false };

    // If candidates exist, safely reassign to Direct Intake so candidates are never deleted
    if (agent._count.candidates > 0) {
      let defaultAgent = await prisma.agent.findFirst({
        where: {
          OR: [
            { name: { contains: 'Direct', mode: 'insensitive' } },
            { name: { contains: 'Head Office', mode: 'insensitive' } },
          ],
          id: { not: id },
        },
      });

      if (!defaultAgent) {
        defaultAgent = await prisma.agent.findFirst({
          where: { id: { not: id } },
        });
      }

      if (defaultAgent) {
        await prisma.candidate.updateMany({
          where: { agentId: id },
          data: { agentId: defaultAgent.id },
        });
      }
    }

    await prisma.agent.delete({ where: { id } });
    return { success: true, isDummy: false };
  }

  const idx = mockAgents.findIndex((a) => a.id === id);
  if (idx !== -1) {
    mockAgents.splice(idx, 1);
    return { success: true, isDummy: true };
  }
  return { success: false, isDummy: true };
}

// -------------------------------------------------------------
// DASHBOARD METRICS ACCESS
// -------------------------------------------------------------

export async function getDashboardMetrics(): Promise<{ metrics: DashboardMetrics; isDummy: boolean }> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const [totalCandidates, allCandidates, agents] = await Promise.all([
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
      if (c.submissionSlip) submittedFiles++;
      if (c.approval) {
        approvalsGranted++;
        if (!c.passportInHand) missingPassportsApproved++;
        if (!c.pccReceived) missingPccApproved++;
      }
      if (c.approval && c.passportInHand && c.pccReceived) deploymentReady++;
      if (c.submissionSlip && !c.approval) pendingOver30Days++;

      if (c.approvalCity) {
        const cityKey = c.approvalCity.trim();
        if (!cityMap[cityKey]) {
          cityMap[cityKey] = { count: 0, approvals: 0 };
        }
        cityMap[cityKey].count++;
        if (c.approval) cityMap[cityKey].approvals++;
      }

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

    return {
      metrics: {
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
      isDummy: false,
    };
  }

  // Dummy Store Metrics Calculation
  let submittedFiles = 0;
  let approvalsGranted = 0;
  let deploymentReady = 0;
  let missingPassportsApproved = 0;
  let missingPccApproved = 0;
  let pendingOver30Days = 0;

  const cityMap: { [key: string]: { count: number; approvals: number } } = {};
  const agentStatsMap: { [key: string]: { name: string; total: number; submitted: number; approved: number } } = {};

  mockAgents.forEach((ag) => {
    agentStatsMap[ag.id] = {
      name: ag.name,
      total: 0,
      submitted: 0,
      approved: 0,
    };
  });

  mockCandidates.forEach((c) => {
    if (c.submissionSlip) submittedFiles++;
    if (c.approval) {
      approvalsGranted++;
      if (!c.passportInHand) missingPassportsApproved++;
      if (!c.pccReceived) missingPccApproved++;
    }
    if (c.approval && c.passportInHand && c.pccReceived) deploymentReady++;
    if (c.submissionSlip && !c.approval) pendingOver30Days++;

    if (c.approvalCity) {
      const cityKey = c.approvalCity.trim();
      if (!cityMap[cityKey]) {
        cityMap[cityKey] = { count: 0, approvals: 0 };
      }
      cityMap[cityKey].count++;
      if (c.approval) cityMap[cityKey].approvals++;
    }

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

  return {
    metrics: {
      totalCandidates: mockCandidates.length,
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
    isDummy: true,
  };
}

// -------------------------------------------------------------
// EXPORT DATA ACCESS
// -------------------------------------------------------------

export async function getExportCandidates(filters: {
  agentId?: string;
  city?: string;
  stage?: string;
  search?: string;
}): Promise<{ candidates: CandidateRecord[]; isDummy: boolean }> {
  const result = await getCandidates({
    ...filters,
  });

  return { candidates: result.candidates, isDummy: result.isDummy };
}
