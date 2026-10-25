const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.candidate.count();
  const agents = await prisma.agent.count();
  const approvals = await prisma.candidate.count({ where: { approval: true } });
  const submissions = await prisma.candidate.count({ where: { submissionSlip: true } });
  console.log(JSON.stringify({ count, agents, approvals, submissions }));
  await prisma.$disconnect();
}
run();
