/**
 * E2E 테스트 헬퍼
 *
 * DB seed/cleanup 유틸과 로그인 헬퍼를 제공합니다.
 * Prisma Client는 .env.test의 DATABASE_URL을 사용합니다.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.test", override: true });

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { encode } from "@auth/core/jwt";
import type { Page } from "@playwright/test";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

export interface AlertData {
  stockCode: string;
  stockName: string;
  basePrice: number;
  thresholdUpper?: number | null;
  thresholdLower?: number | null;
  status?: string;
}

// ---------------------------------------------------------------------------
// Seed 함수
// ---------------------------------------------------------------------------

/**
 * 테스트 유저를 생성합니다.
 *
 * @param email - 테스트 유저 이메일
 * @param roles - 부여할 역할 배열 (기본값: ["user"])
 * @returns 생성된 User 레코드
 */
export async function createTestUser(
  email: string,
  roles: string[] = ["user"]
) {
  // 이미 존재하면 삭제 후 재생성 (이전 테스트 잔류 데이터 처리)
  await cleanupTestUser(email);

  const roleRecords = await prisma.role.findMany({
    where: { name: { in: roles } },
  });

  const user = await prisma.user.create({
    data: {
      email,
      nickname: email.split("@")[0],
      userRoles: {
        create: roleRecords.map((r) => ({ roleId: r.id })),
      },
    },
    include: {
      userRoles: { include: { role: true } },
    },
  });

  return user;
}

/**
 * 테스트 알림을 생성합니다.
 *
 * @param userId - 알림을 소유할 유저 ID
 * @param data - 알림 데이터
 * @returns 생성된 Alert 레코드
 */
export async function createTestAlert(userId: string, data: AlertData) {
  return prisma.alert.create({
    data: {
      userId,
      stockCode: data.stockCode,
      stockName: data.stockName,
      basePrice: data.basePrice,
      thresholdUpper: data.thresholdUpper ?? null,
      thresholdLower: data.thresholdLower ?? null,
      status: data.status ?? "active",
    },
  });
}

/**
 * 테스트 알림 로그를 N건 생성합니다.
 *
 * @param alertId - 연결할 Alert ID
 * @param userId - 소유 유저 ID
 * @param stockCode - 종목 코드
 * @param basePrice - 기준가
 * @param count - 생성할 건수
 */
export async function createTestAlertLogs(
  alertId: string,
  userId: string,
  stockCode: string,
  basePrice: number,
  count: number
) {
  const logs = Array.from({ length: count }, (_, i) => {
    const isUpper = i % 2 === 0;
    const changeRate = isUpper ? 5.5 + i * 0.3 : -(3.2 + i * 0.2);
    const triggeredPrice = Math.round(basePrice * (1 + changeRate / 100));
    return {
      alertId,
      userId,
      stockCode,
      basePrice,
      triggeredPrice,
      changeRate,
      thresholdType: isUpper ? "upper" : "lower",
      emailSent: i % 3 !== 0,
    };
  });

  await prisma.alertLog.createMany({ data: logs });
}

/**
 * 테스트 유저와 관련 데이터(Alert, AlertLog, UserRole)를 삭제합니다.
 *
 * @param email - 삭제할 테스트 유저 이메일
 */
export async function cleanupTestUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  // CASCADE 순서 보장을 위해 명시적으로 순서 지정
  await prisma.alertLog.deleteMany({ where: { userId: user.id } });
  await prisma.alert.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

// ---------------------------------------------------------------------------
// 로그인 헬퍼
// ---------------------------------------------------------------------------

/**
 * 프로그래밍 방식으로 테스트 유저 세션을 주입합니다.
 *
 * NextAuth v5의 `encode()`로 세션 JWT를 직접 생성한 뒤
 * `authjs.session-token` 쿠키로 브라우저 컨텍스트에 주입합니다.
 * 이 방식은 CSRF/Credentials 엔드포인트를 거치지 않으므로
 * 더 빠르고 안정적입니다.
 *
 * **전제 조건**: 테스트 러너와 webServer가 동일한 NEXTAUTH_SECRET를 사용해야 함.
 * playwright.config.ts의 webServer.env에서 보장됨.
 *
 * @param page - Playwright Page 인스턴스
 * @param email - 로그인할 테스트 유저 이메일
 */
export async function loginAsUser(page: Page, email: string) {
  // 1. DB에서 테스트 유저 조회
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: { include: { role: true } } },
  });
  if (!user) {
    throw new Error(
      `[loginAsUser] Test user not found in DB: ${email}. createTestUser를 먼저 호출하세요.`
    );
  }
  const roles = (user.userRoles as Array<{ role: { name: string } }>).map(
    (ur) => ur.role.name
  );

  // 2. NextAuth 세션 JWT 생성 (@auth/core/jwt encode 사용)
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "[loginAsUser] NEXTAUTH_SECRET 환경변수가 설정되지 않았습니다."
    );
  }
  // dev(http) 기준 세션 쿠키 이름. prod(https)에서는 "__Secure-authjs.session-token"
  const sessionCookieName = "authjs.session-token";
  const sessionToken = await encode({
    token: {
      id: user.id,
      roles,
      email: user.email,
      name: user.nickname,
      sub: user.id,
    },
    secret,
    salt: sessionCookieName,
    maxAge: 30 * 24 * 60 * 60, // 30일
  });

  // 3. 브라우저 컨텍스트에 세션 쿠키 주입
  await page.context().addCookies([
    {
      name: sessionCookieName,
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    },
  ]);

  // 4. 대시보드로 이동
  await page.goto("/dashboard");
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

/**
 * admin 역할 유저로 로그인합니다.
 *
 * @param page - Playwright Page 인스턴스
 * @param email - admin 역할 테스트 유저 이메일
 */
export async function loginAsAdmin(page: Page, email: string) {
  await loginAsUser(page, email);
}
