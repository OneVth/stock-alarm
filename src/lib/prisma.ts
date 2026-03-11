import { PrismaClient } from "@/generated/prisma";

/**
 * Prisma 클라이언트 싱글턴 인스턴스.
 *
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

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
