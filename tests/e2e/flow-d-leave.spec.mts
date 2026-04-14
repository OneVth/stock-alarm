/**
 * Flow D: 이탈 (계정 삭제)
 *
 * 로그인 → 설정 → 계정 삭제 → /login 리다이렉트 → DB 삭제 확인
 */

import { test, expect } from "@playwright/test";
import {
  createTestUser,
  createTestAlert,
  cleanupTestUser,
  loginAsUser,
  prisma,
} from "./helpers";

const TEST_EMAIL = "leaving@test.com";

test.describe("Flow D: 이탈 (계정 삭제)", () => {
  test.beforeAll(async () => {
    const user = await createTestUser(TEST_EMAIL);
    // 알림 몇 건 생성 (삭제 cascade 검증을 위해)
    await createTestAlert(user.id, {
      stockCode: "005930",
      stockName: "삼성전자",
      basePrice: 70000,
      thresholdUpper: 5,
    });
    await createTestAlert(user.id, {
      stockCode: "000660",
      stockName: "SK하이닉스",
      basePrice: 180000,
      thresholdLower: -3,
    });
  });

  test.afterAll(async () => {
    // 테스트 실패 시를 대비한 안전 cleanup
    await cleanupTestUser(TEST_EMAIL);
  });

  test("계정 삭제 → 로그아웃 상태 확인 → DB 삭제 확인", async ({ page }) => {
    // 1. 로그인
    await test.step("로그인 → 대시보드", async () => {
      await loginAsUser(page, TEST_EMAIL);
      await expect(page).toHaveURL(/\/dashboard/);
    });

    // 2. /settings 이동
    await test.step("/settings 페이지 이동", async () => {
      await page.goto("/settings");
      await expect(
        page.getByRole("heading", { name: /설정|프로필/ }).first()
      ).toBeVisible();
    });

    // 3. "계정 삭제" 버튼 클릭 → 확인 Dialog 열림
    await test.step('"계정 삭제" 클릭 → 확인 다이얼로그', async () => {
      await page.getByRole("button", { name: "계정 삭제" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "계정 삭제" })
      ).toBeVisible();
      // 확인 메시지 표시
      await expect(page.getByText(/영구적으로 삭제/)).toBeVisible();
    });

    // 4. Dialog에서 "삭제" 클릭 → /login 리다이렉트
    await test.step("삭제 확인 → /login 리다이렉트", async () => {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: /삭제/ })
        .click();
      // 계정 삭제 후 로그아웃 → /login으로 리다이렉트
      await page.waitForURL("**/login**", { timeout: 15_000 });
    });

    // 5. 이전 대시보드 URL 직접 접근 → /login 리다이렉트 (인증 필요)
    await test.step("삭제 후 대시보드 접근 → /login 리다이렉트", async () => {
      await page.goto("/dashboard");
      await page.waitForURL("**/login**", { timeout: 10_000 });
    });

    // 6. DB에서 유저 삭제 확인
    await test.step("DB에서 유저 + 관련 데이터 삭제 확인", async () => {
      const user = await prisma.user.findUnique({
        where: { email: TEST_EMAIL },
        include: {
          alerts: true,
          alertLogs: true,
        },
      });
      expect(user).toBeNull();
    });
  });
});
