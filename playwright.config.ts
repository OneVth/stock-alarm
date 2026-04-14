import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// 테스트 환경변수 로드 (.env.test)
dotenv.config({ path: ".env.test", override: true });

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.mts",

  /* 전체 테스트 타임아웃 */
  timeout: 60_000,

  /* 실패 시 재시도 없음 (로컬 기준) */
  retries: process.env.CI ? 2 : 0,

  /* 병렬 실행 비활성화 (DB 격리 보장) */
  workers: 1,

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // 핵심: 테스트 러너와 webServer가 동일한 NEXTAUTH_SECRET / DATABASE_URL을 사용해야
    // JWT 주입 방식 로그인(tests/e2e/helpers.mts의 loginAsUser)이 작동한다.
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
    },
  },
});
