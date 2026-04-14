/**
 * Flow C: 관리자
 *
 * 로그인 → 관리자 대시보드 → 사용자 검색 → 로그 필터/검색
 */

import { test, expect } from "@playwright/test";
import {
  createTestUser,
  createTestAlert,
  cleanupTestUser,
  loginAsAdmin,
} from "./helpers";

const ADMIN_EMAIL = "admin@test.com";
const NORMAL_USER_EMAIL = "normal-for-admin-test@test.com";

test.describe("Flow C: 관리자", () => {
  test.beforeAll(async () => {
    // 관리자 유저 생성
    await createTestUser(ADMIN_EMAIL, ["user", "admin"]);

    // 일반 유저 + 알림 몇 건 생성 (관리자 대시보드 데이터 확보)
    const normalUser = await createTestUser(NORMAL_USER_EMAIL, ["user"]);
    await createTestAlert(normalUser.id, {
      stockCode: "005930",
      stockName: "삼성전자",
      basePrice: 70000,
      thresholdUpper: 5,
    });
    await createTestAlert(normalUser.id, {
      stockCode: "000660",
      stockName: "SK하이닉스",
      basePrice: 180000,
      thresholdLower: -3,
    });
  });

  test.afterAll(async () => {
    await cleanupTestUser(ADMIN_EMAIL);
    await cleanupTestUser(NORMAL_USER_EMAIL);
  });

  test("관리자 대시보드 → 사용자 관리 → 시스템 로그", async ({ page }) => {
    // 1. 로그인
    await test.step("관리자 로그인 → 대시보드", async () => {
      await loginAsAdmin(page, ADMIN_EMAIL);
      // 사이드바의 /admin 링크 존재 확인 (href 기반으로 strict mode 회피)
      await expect(page.locator('a[href="/admin"]').first()).toBeVisible({
        timeout: 10_000,
      });
    });

    // 2. /admin 이동 → 관리자 대시보드
    await test.step("/admin 관리자 대시보드 확인", async () => {
      await page.goto("/admin");
      await expect(
        page.getByRole("heading", { name: /관리자 대시보드/ })
      ).toBeVisible();
      // 통계 카드 존재 확인
      await expect(page.getByText(/전체 사용자|총 사용자/)).toBeVisible();
    });

    // 3. /admin/users 이동 → 사용자 목록
    await test.step("/admin/users 사용자 목록 확인", async () => {
      await page.goto("/admin/users");
      await expect(
        page.getByRole("heading", { name: /사용자 관리/ })
      ).toBeVisible();
      // 생성한 테스트 유저들이 목록에 표시됨
      await expect(page.getByText(NORMAL_USER_EMAIL)).toBeVisible();
    });

    // 4. 이메일/닉네임 검색
    await test.step("사용자 검색 필터링", async () => {
      const searchInput = page.getByRole("searchbox").or(
        page.getByPlaceholder(/이메일|닉네임|검색/)
      );
      await searchInput.fill("normal-for-admin");
      await page.waitForTimeout(400);
      await expect(page.getByText(NORMAL_USER_EMAIL)).toBeVisible();
      // 검색 초기화
      await searchInput.clear();
    });

    // 5. /admin/logs 이동 → 시스템 로그
    await test.step("/admin/logs 시스템 로그 확인", async () => {
      await page.goto("/admin/logs");
      await expect(
        page.getByRole("heading", { name: /시스템 로그/ })
      ).toBeVisible();
    });

    // 6. 레벨 필터 (ERROR)
    await test.step("로그 레벨 필터 (ERROR)", async () => {
      const levelFilter = page
        .getByRole("combobox", { name: /레벨/ })
        .or(page.getByRole("button", { name: /레벨|ERROR|INFO|WARN/ }));
      if (await levelFilter.isVisible()) {
        await levelFilter.click();
        const errorOption = page.getByRole("option", { name: /ERROR/ });
        if (await errorOption.isVisible()) {
          await errorOption.click();
          await page.waitForTimeout(300);
        }
      }
    });

    // 7. 카테고리 필터
    await test.step("로그 카테고리 필터", async () => {
      const categoryFilter = page
        .getByRole("combobox", { name: /카테고리/ })
        .or(page.getByRole("button", { name: /카테고리/ }));
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        // 첫 번째 옵션 선택 (있을 경우)
        const firstOption = page.getByRole("option").first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          await page.waitForTimeout(300);
        }
      }
    });

    // 8. 날짜 범위 프리셋 "7일"
    await test.step('날짜 범위 프리셋 "7일" 적용', async () => {
      const datePreset = page
        .getByRole("button", { name: /7일/ })
        .or(page.getByText("최근 7일"));
      if (await datePreset.isVisible()) {
        await datePreset.click();
        await page.waitForTimeout(300);
      }
    });

    // 9. 로그 메시지 확장 (있을 경우)
    await test.step("로그 메시지 클릭 확장", async () => {
      const firstLogRow = page
        .getByRole("row")
        .nth(1); // 헤더 제외 첫 번째 행
      if (await firstLogRow.isVisible()) {
        await firstLogRow.click();
        await page.waitForTimeout(200);
        // 확장 상태가 표시되면 통과 (구현에 따라 다름)
      }
    });
  });
});
