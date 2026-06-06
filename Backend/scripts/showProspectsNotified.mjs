import prisma from '../src/db/prismaClient.js';

(async () => {
  try {
    const prospects = await prisma.prospect.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, nextFollowUpDate: true, lastNotifiedAt: true, ownerId: true },
      orderBy: { createdAt: 'asc' }
    });
    console.log(JSON.stringify(prospects, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
