/**
 * Flow A: 신규 사용자
 *
 * 랜딩 → 로그인 → 빈 대시보드 → 알림 추가 → 종목 상세 → 수정 → 삭제
 */

import { test, expect } from "@playwright/test";
import {
  createTestUser,
  cleanupTestUser,
  loginAsUser,
} from "./helpers";

const TEST_EMAIL = "newuser@test.com";

test.describe("Flow A: 신규 사용자", () => {
  test.beforeAll(async () => {
    await createTestUser(TEST_EMAIL);
  });

  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("랜딩 → 로그인 → 알림 추가 → 종목 상세 → 수정 → 삭제", async ({
    page,
  }) => {
    // 1. 랜딩 페이지 접근
    await test.step("랜딩 페이지 확인", async () => {
      await page.goto("/");
      await expect(
        page.getByText("매일 확인하지 않아도 괜찮아요")
      ).toBeVisible();
    });

    // 2. "시작하기" 클릭 → /login 이동
    // Button render={<Link />} 패턴이라 role이 button/link 양쪽일 수 있음 → getByText 사용
    await test.step('"시작하기" 클릭 → 로그인 페이지', async () => {
      await page.getByText("시작하기", { exact: true }).click();
      await page.waitForURL("**/login**");
    });

    // 3. JWT 주입으로 로그인 → /dashboard
    await test.step("로그인 → 대시보드 리다이렉트", async () => {
      await loginAsUser(page, TEST_EMAIL);
    });

    // 4. 빈 대시보드 확인 (반응형 디자인으로 중복 요소 → first)
    await test.step("빈 대시보드 상태 확인", async () => {
      await expect(
        page.getByText("등록된 알림이 없습니다").first()
      ).toBeVisible();
    });

    // 5. "새 알림 추가" 클릭 → Dialog 열림
    // 빈 상태에서 버튼이 2개 (empty state + 헤더) → first() 사용
    await test.step('"새 알림 추가" 다이얼로그 열기', async () => {
      await page.getByRole("button", { name: /새 알림 추가/ }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "새 알림 추가" })
      ).toBeVisible();
    });

    // 6. 종목 검색 "삼성전자" → 선택
    await test.step("종목 검색 및 선택", async () => {
      await page.getByRole("button", { name: /종목을 검색하세요/ }).click();
      await page
        .getByPlaceholder("종목명 또는 코드 검색...")
        .fill("삼성전자");
      // 디바운스 (300ms) + API 응답 대기
      await page.waitForTimeout(600);
      await page.getByRole("option", { name: /삼성전자/ }).first().click();
      // 선택 후 버튼 텍스트에 종목명이 포함되어야 함
      await expect(
        page.getByRole("button", { name: /삼성전자/ })
      ).toBeVisible();
    });

    // 7. 기준가 + 상승 임계값 입력 → 등록
    await test.step("기준가·임계값 입력 후 등록", async () => {
      await page.locator("#basePrice").fill("70000");
      await page.locator("#thresholdUpper").fill("5");
      await page.getByRole("button", { name: "알림 등록" }).click();
      await expect(page.getByText("알림이 등록되었습니다")).toBeVisible();
      // 대시보드에 알림 1건 표시
      await expect(page.getByText("삼성전자")).toBeVisible();
    });

    // 8. 알림 카드 클릭 → 종목 상세 페이지
    await test.step("알림 카드 → 종목 상세 페이지", async () => {
      await page.getByRole("link", { name: /삼성전자/ }).first().click();
      await page.waitForURL(/\/dashboard\/[a-z0-9]+$/);
    });

    // 9. 종목 상세: 임계값 표시 확인 (정확한 값 미검증)
    await test.step("종목 상세 페이지 임계값 표시 확인", async () => {
      await expect(page.getByText(/상승\s*\+5%/)).toBeVisible();
    });

    // 10. 수정 버튼 → 인라인 편집 → 임계값 변경 → 저장
    // StockPriceHero는 dialog 없이 inline 편집 (setIsEditing)
    await test.step("알림 수정 (임계값 7%로 변경)", async () => {
      await page.getByRole("button", { name: /수정/ }).click();
      // 인라인 편집 input들이 나타남: [0]=기준가, [1]=상승 (thresholdLower가 없는 경우)
      const upperInput = page.locator('input[type="number"]').nth(1);
      await expect(upperInput).toBeVisible();
      await upperInput.clear();
      await upperInput.fill("7");
      await page.getByRole("button", { name: /^저장$/ }).click();
      await expect(
        page.getByText("알림 설정이 저장되었습니다")
      ).toBeVisible();
      await expect(page.getByText(/상승\s*\+7%/)).toBeVisible();
    });

    // 11. 대시보드로 돌아가기 (사이드바 링크)
    await test.step("대시보드로 돌아가기", async () => {
      // 사이드바의 "대시보드" 링크 (href="/dashboard") - 정확 매칭
      await page.locator('a[href="/dashboard"]').first().click();
      await page.waitForURL(/\/dashboard\/?$/);
      await expect(page.getByText("삼성전자").first()).toBeVisible();
    });

    // 12. ⋯ 메뉴 → 삭제 → 빈 상태
    await test.step("알림 삭제 → 빈 상태 확인", async () => {
      // MoreHorizontalIcon 버튼 (sr-only: "액션")
      await page.getByRole("button", { name: "액션" }).first().click();
      await page.getByRole("menuitem", { name: "삭제" }).click();
      // AlertDialog(role="alertdialog") 삭제 확인
      const confirmDialog = page.getByRole("alertdialog");
      await expect(confirmDialog).toBeVisible();
      await confirmDialog.getByRole("button", { name: /^삭제$/ }).click();
      // 알림 0건 → 빈 상태
      await expect(
        page.getByText("등록된 알림이 없습니다").first()
      ).toBeVisible();
    });
  });
});
