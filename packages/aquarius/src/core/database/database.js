import Prisma from '@prisma/client';

// CJS / ESM compatibility
const { PrismaClient } = Prisma;

export default (() => new PrismaClient())();
