// prisma/client.ts
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient({
    log:['query']
});

export default prisma;