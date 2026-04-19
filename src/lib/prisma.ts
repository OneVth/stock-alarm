import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 클라이언트 싱글턴 인스턴스.
 *
 * PrismaPg 어댑터를 사용하여 PostgreSQL에 직접 TCP 연결합니다.
 * 개발 환경에서 HMR로 인한 다중 인스턴스 생성을 방지합니다.
 *
 * @example
 * ```ts
 * import { prisma } from "@/lib/prisma";
 *
 * const users = await prisma.user.findMany();
 * ```
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"]!,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
