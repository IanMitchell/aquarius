import { PrismaClient } from '@prisma/client';

export default (() => {
  const client = new PrismaClient();
  return client;
})();
