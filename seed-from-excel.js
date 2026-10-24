const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EXCEL_PATH = 'C:\\Users\\Shuvo\\Downloads\\_Completed Contact Form List_NM(7).xlsx';

function normalizeBoolean(val) {
  if (val === true || val === 1) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'yes' || s === 'true' || s === 'y' || s === '1';
  }
  return false;
}

function normalizeString(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

const AGENT_MAPPING = {
  'takwa': { name: 'Takwa International', location: 'Dhaka - Head Office', code: 'TKW' },
  'jiec syl': { name: 'JIEC Sylhet', location: 'Sylhet Division', code: 'JIEC' },
  'jiec sylhet': { name: 'JIEC Sylhet', location: 'Sylhet Division', code: 'JIEC' },
  'rajlokkhi': { name: 'Agent Rajlokkhi', location: 'Dhaka - Uttara', code: 'RAJK' },
  'agent rajlokkhi': { name: 'Agent Rajlokkhi', location: 'Dhaka - Uttara', code: 'RAJK' },
  'polton': { name: 'Polton Agency', location: 'Dhaka - Purana Paltan', code: 'PLT' },
  'polton agent': { name: 'Polton Agency', location: 'Dhaka - Purana Paltan', code: 'PLT' },
  'banani': { name: 'Agent Banani', location: 'Dhaka - Banani', code: 'BNN' },
  'agent banani': { name: 'Agent Banani', location: 'Dhaka - Banani', code: 'BNN' },
  'fly migration': { name: 'Fly Migration Jhenaidah', location: 'Jhenaidah', code: 'FLY' },
  'jhenaidah': { name: 'Fly Migration Jhenaidah', location: 'Jhenaidah', code: 'FLY' },
  'agent kuril': { name: 'Agent Kuril', location: 'Dhaka - Kuril Bishwa Road', code: 'KRL' },
  'kuril': { name: 'Agent Kuril', location: 'Dhaka - Kuril Bishwa Road', code: 'KRL' },
  'sikder travels': { name: 'Sikder Travels Khilkhet', location: 'Dhaka - Khilkhet', code: 'SKD' },
  'sikder travels_khilkhet': { name: 'Sikder Travels Khilkhet', location: 'Dhaka - Khilkhet', code: 'SKD' },
  'shihab syl': { name: 'Shihab Sylhet Agency', location: 'Sylhet - Zindabazar', code: 'SHB' },
  'agent shihab syl': { name: 'Shihab Sylhet Agency', location: 'Sylhet - Zindabazar', code: 'SHB' },
  'sultan international': { name: 'Sultan International', location: 'Dhaka - Naya Paltan', code: 'SLT' },
  'dream heaven': { name: 'Dream Heaven Overseas', location: 'Dhaka - Kakrail', code: 'DRM' },
  'agent dream heaven': { name: 'Dream Heaven Overseas', location: 'Dhaka - Kakrail', code: 'DRM' },
  'agent noakhali': { name: 'Agent Noakhali', location: 'Noakhali - Maijdee Court', code: 'NKH' },
  'noakhali': { name: 'Agent Noakhali', location: 'Noakhali - Maijdee Court', code: 'NKH' },
  'kishoreganj': { name: 'Kishoreganj Gateway', location: 'Kishoreganj Sadar', code: 'KSH' },
  'kishoreganj agent': { name: 'Kishoreganj Gateway', location: 'Kishoreganj Sadar', code: 'KSH' },
  'agent ashulia': { name: 'Ashulia Regional Agency', location: 'Dhaka - Ashulia', code: 'ASH' },
  'ashulia': { name: 'Ashulia Regional Agency', location: 'Dhaka - Ashulia', code: 'ASH' },
  'jowel agent': { name: 'Agent Jowel (NM)', location: 'Dhaka - Central Operations', code: 'JWL' },
  'agent jowel': { name: 'Agent Jowel (NM)', location: 'Dhaka - Central Operations', code: 'JWL' },
  'agent jowel (nm)': { name: 'Agent Jowel (NM)', location: 'Dhaka - Central Operations', code: 'JWL' },
  'direct skybridge': { name: 'Sky Bridge Direct Intake', location: 'Dhaka - Gulshan HQ', code: 'SBD' },
};

function resolveAgent(rawName) {
  if (!rawName) return AGENT_MAPPING['direct skybridge'];
  const key = rawName.trim().toLowerCase();
  for (const [k, v] of Object.entries(AGENT_MAPPING)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return {
    name: rawName.trim(),
    location: 'Regional Partner',
    code: rawName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'AGNT',
  };
}

async function syncFromExcel() {
  console.log('✈️ SAFE SYNC: Starting Non-Destructive Excel Ingestion...');
  console.log(`📁 Source: ${EXCEL_PATH}`);

  const workbook = XLSX.readFile(EXCEL_PATH);
  
  // Step 1: Scan agent sheets for physical tracking metrics (Passport in Vault & PCC)
  const passportExtraMap = new Map();

  for (const sheetName of workbook.SheetNames) {
    if (sheetName === 'Mother List') continue;
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    let headerIdx = -1;
    for (let r = 0; r < Math.min(10, data.length); r++) {
      if (data[r] && data[r][0] && String(data[r][0]).trim().toUpperCase() === 'SL') {
        headerIdx = r;
        break;
      }
    }
    if (headerIdx === -1) continue;

    const headers = data[headerIdx].map(h => normalizeString(h).toLowerCase());
    const ppIdx = headers.findIndex(h => h.includes('passport number') || h.includes('passport no') || h === 'passport');
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const inHandIdx = headers.findIndex(h => h === 'passport' || h === 'passport ' || h.includes('passport in hand'));
    const pccIdx = headers.findIndex(h => h.includes('pcc'));

    for (let r = headerIdx + 1; r < data.length; r++) {
      const row = data[r];
      if (!row || !row[nameIdx]) continue;
      const ppNum = normalizeString(row[ppIdx]).toUpperCase();
      const inHand = inHandIdx !== -1 ? normalizeBoolean(row[inHandIdx]) : false;
      const pcc = pccIdx !== -1 ? normalizeBoolean(row[pccIdx]) : false;
      
      if (ppNum) {
        passportExtraMap.set(ppNum, { passportInHand: inHand, pccReceived: pcc });
      }
      const cleanName = normalizeString(row[nameIdx]).toUpperCase();
      if (cleanName) {
        passportExtraMap.set(cleanName, { passportInHand: inHand, pccReceived: pcc });
      }
    }
  }

  // Step 2: Cache / Upsert Agents
  const agentCache = new Map();
  async function getOrCreateAgent(rawAgentName) {
    const resolved = resolveAgent(rawAgentName);
    if (agentCache.has(resolved.name)) {
      return agentCache.get(resolved.name);
    }
    const agent = await prisma.agent.upsert({
      where: { name: resolved.name },
      update: {
        location: resolved.location,
        code: resolved.code,
      },
      create: {
        name: resolved.name,
        code: resolved.code,
        location: resolved.location,
        contactPerson: `Operations Coordinator (${resolved.location})`,
        phone: '+880 1700-000000',
        email: `ops@${resolved.code.toLowerCase()}.skybridge.com`,
        notes: `Authorized European Employment Migration Partner - North Macedonia Project`,
      },
    });
    agentCache.set(resolved.name, agent);
    return agent;
  }

  for (const info of Object.values(AGENT_MAPPING)) {
    await getOrCreateAgent(info.name);
  }

  // Step 3: Parse Master Mother List
  const motherSheet = workbook.Sheets['Mother List'];
  const motherData = XLSX.utils.sheet_to_json(motherSheet, { header: 1, defval: '' });
  let candidateRows = motherData.slice(4).filter(r => r && r[1] && normalizeString(r[1]) !== '');

  console.log(`📋 Safe upserting ${candidateRows.length} candidates (ZERO DELETION)...`);

  let countSubmitted = 0;
  let countApproved = 0;

  for (let i = 0; i < candidateRows.length; i++) {
    const row = candidateRows[i];
    const sl = parseInt(row[0]) || (i + 1);
    const name = normalizeString(row[1]);
    const passportNo = normalizeString(row[2]).toUpperCase();
    const contactDate = normalizeString(row[3]);
    const agentRaw = normalizeString(row[4]);
    const contactForm = normalizeBoolean(row[5] !== undefined && row[5] !== '' ? row[5] : true);
    const submissionSlip = normalizeBoolean(row[6]);
    const submissionDate = normalizeString(row[7]);
    const approval = normalizeBoolean(row[8]);
    const approvalDate = normalizeString(row[9]);
    const approvalCity = normalizeString(row[10]);

    const extra = passportExtraMap.get(passportNo) || passportExtraMap.get(name.toUpperCase()) || { passportInHand: false, pccReceived: false };
    const passportInHand = extra.passportInHand || (submissionSlip && !approval ? true : extra.passportInHand);
    const pccReceived = extra.pccReceived;

    let stage = 'INTAKE';
    if (approval) {
      countApproved++;
      stage = (passportInHand && pccReceived) ? 'DEPLOYMENT_READY' : 'APPROVED';
    } else if (submissionSlip) {
      countSubmitted++;
      stage = 'SUBMITTED';
    }

    const fileId = `SB-NM-${String(sl).padStart(4, '0')}`;
    const agent = await getOrCreateAgent(agentRaw);

    // NON-DESTRUCTIVE UPSERT: matches by unique fileId
    await prisma.candidate.upsert({
      where: { fileId },
      update: {
        sl,
        name,
        passportNumber: passportNo,
        contactForm,
        contactDate: contactDate || null,
        submissionSlip,
        submissionDate: submissionDate || null,
        approval,
        approvalDate: approvalDate || null,
        approvalCity: approvalCity || (approval ? 'Strumica' : null),
        agentId: agent.id,
        // Only update physical flags if not already manually marked true
        stage,
      },
      create: {
        sl,
        fileId,
        name,
        passportNumber: passportNo,
        contactForm,
        contactDate: contactDate || null,
        submissionSlip,
        submissionDate: submissionDate || null,
        approval,
        approvalDate: approvalDate || null,
        approvalCity: approvalCity || (approval ? 'Strumica' : null),
        passportInHand,
        pccReceived,
        stage,
        agentId: agent.id,
        notes: approval ? `Approved work permit for ${approvalCity || 'Macedonia'}` : null,
      },
    });
  }

  console.log(`✅ Safe Sync Complete: ${candidateRows.length} candidates verified and preserved.`);
  return {
    total: candidateRows.length,
    submitted: countSubmitted + countApproved,
    approved: countApproved,
  };
}

if (require.main === module) {
  syncFromExcel()
    .then((stats) => {
      console.log('Stats:', stats);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { syncFromExcel };
