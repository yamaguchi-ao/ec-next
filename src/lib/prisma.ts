// prisma singleton
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = global as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter,
        log: ["query"],
    });
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;