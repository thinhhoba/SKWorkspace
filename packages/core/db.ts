import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Fallback: dummy client — mọi query sẽ throw và được catch về fallback mock
    // Prisma 7 yêu cầu adapter, nên trả về proxy tránh init lỗi
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "$queryRaw" || prop === "$executeRaw" || prop === "$connect" || prop === "$disconnect") {
          return async () => { throw new Error("DATABASE_URL missing — fallback mock"); };
        }
        // model accessors (user, customer, ...) cũng throw khi gọi
        return new Proxy(() => {}, {
          get: () => async () => { throw new Error("DATABASE_URL missing — fallback mock"); },
          apply: async () => { throw new Error("DATABASE_URL missing — fallback mock"); },
        });
      },
    });
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function checkDatabaseConnection(): Promise<"connected" | "fallback_mock"> {
  try {
    if (!process.env.DATABASE_URL) return "fallback_mock";
    await prisma.$queryRaw`SELECT 1`;
    return "connected";
  } catch {
    return "fallback_mock";
  }
}

export default prisma;
