import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = global;

const prisma = globalForPrisma.prismaGlobal || prismaClientSingleton();

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaGlobal = prisma;

export default prisma;
