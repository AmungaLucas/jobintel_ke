const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const u = await p.user.findUnique({ where: { email: 'amungalucas@gmail.com' } });
  const match = await bcrypt.compare('Admincyber', u.passwordHash);
  console.log('Password matches:', match);
  if (!match) {
    // Reset the password
    const newHash = await bcrypt.hash('Admincyber', 12);
    await p.user.update({ where: { id: u.id }, data: { passwordHash: newHash } });
    console.log('Password reset successfully');
    const verify = await bcrypt.compare('Admincyber', newHash);
    console.log('New hash verifies:', verify);
  }
}

main().catch(e => console.error('Error:', e.message)).finally(() => p.$disconnect());
