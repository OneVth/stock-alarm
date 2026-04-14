import { execSync } from "child_process";
import dotenv from "dotenv";

// 테스트 환경변수 로드 (playwright.config.ts보다 먼저 실행될 수 있으므로 여기서도 로드)
dotenv.config({ path: ".env.test", override: true });

/**
 * Playwright globalSetup
 *
 * 테스트 실행 전 1회 실행됩니다:
 * 1. 테스트 DB에 Prisma 마이그레이션 적용
 * 2. 필수 Role 데이터 시드 (user, admin)
 */
export default async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      ".env.test에 DATABASE_URL이 설정되지 않았습니다.\n" +
        "tests/e2e/global-setup.ts 주석을 참고하여 설정하세요."
    );
  }

  console.log("[E2E Setup] 테스트 DB 마이그레이션 적용 중...");
  execSync("pnpm prisma migrate deploy", {
    env: { ...process.env },
    stdio: "inherit",
  });

  console.log("[E2E Setup] Role 시드 적용 중...");
  // helpers.mts에서 이미 PrismaClient 인스턴스를 export하므로 재사용
  const { prisma } = await import("./helpers.mjs");

  try {
    await prisma.role.upsert({
      where: { name: "user" },
      update: {},
      create: { name: "user", description: "일반 사용자" },
    });
    await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin", description: "관리자" },
    });
    console.log("[E2E Setup] 완료");
  } finally {
    await prisma.$disconnect();
  }
}
