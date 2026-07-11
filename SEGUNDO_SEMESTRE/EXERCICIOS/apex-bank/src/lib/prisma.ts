import { PrismaClient } from "@prisma/client/extension";
import { log } from "next/dist/server/typescript/utils";

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = 
    globalForPrisma || new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma