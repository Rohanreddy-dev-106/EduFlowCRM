import prisma from '../src/db/prismaClient.js';

(async () => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await prisma.prospect.updateMany({
      where: { deletedAt: null, stage: { not: 'Pilot Closed' } },
      data: { nextFollowUpDate: yesterday },
    });
    console.log('Updated prospects:', result);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
