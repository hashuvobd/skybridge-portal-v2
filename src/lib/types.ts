import { PipelineStage } from '@prisma/client';
export { PipelineStage };

export type CandidateRecord = {
  id: string;
  sl: number | null;
  fileId: string;
  name: string;
  passportNumber: string;
  contactForm: boolean;
  contactDate: string | null;
  submissionSlip: boolean;
  submissionDate: string | null;
  approval: boolean;
  approvalDate: string | null;
  approvalCity: string | null;
  passportInHand: boolean;
  pccReceived: boolean;
  stage: PipelineStage;
  agentId: string;
  agent?: {
    id: string;
    name: string;
    code?: string | null;
    location?: string | null;
  };
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentRecord = {
  id: string;
  name: string;
  code?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  notes?: string | null;
  candidateCount?: number;
  approvedCount?: number;
  submittedCount?: number;
  createdAt: Date;
};

export type DashboardMetrics = {
  totalCandidates: number;
  submittedFiles: number;
  approvalsGranted: number;
  inReview: number;
  deploymentReady: number;
  missingPassportsApproved: number;
  missingPccApproved: number;
  pendingOver30Days: number;
  cityBreakdown: { city: string; count: number; approvals: number }[];
  agentLeaderboard: {
    agentName: string;
    total: number;
    submitted: number;
    approved: number;
    conversionRate: number;
  }[];
};
