const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const u = await p.user.findUnique({ where: { email: 'amungalucas@gmail.com' } });
  if (!u) {
    console.log('USER NOT FOUND');
  } else {
    console.log('ID:', u.id);
    console.log('Name:', u.name);
    console.log('Role:', u.role);
    console.log('Has passwordHash:', !!u.passwordHash);
    console.log('Hash length:', u.passwordHash?.length);
    console.log('Hash preview:', u.passwordHash?.substring(0, 20) + '...');
    const c = await p.candidate.findUnique({ where: { userId: u.id } });
    console.log('Candidate found:', !!c);
    if (c) console.log('Onboarding:', c.onboardingState);
  }
}

main().catch(e => console.error('Error:', e.message)).finally(() => p.$disconnect());
