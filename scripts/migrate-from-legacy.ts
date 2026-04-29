/**
 * Legacy v1 SQLite → v2 PostgreSQL 데이터 마이그레이션 스크립트
 *
 * legacy SQLite에서 JSON으로 export된 3개 파일을 읽어 v2 PostgreSQL로 import합니다.
 * --dry-run 모드(기본값)에서는 트랜잭션을 롤백하여 실제 데이터 변경 없이 검증합니다.
 *
 * 실행:
 *   pnpm tsx scripts/migrate-from-legacy.ts \
 *     --users /path/users.json \
 *     --alerts /path/alerts.json \
 *     --logs /path/alert-logs.json \
 *     --dry-run
 */

import { readFile } from "fs/promises";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

// ─────────────────────────────────────────────
// Legacy 타입 정의
// ─────────────────────────────────────────────

interface LegacyUser {
  id: number;
  email: string;
  uuid: string;
  created_at: string;
}

interface LegacyAlert {
  id: number;
  user_id: number;
  stock_code: string;
  stock_name: string;
  base_price: number;
  threshold_upper: number | null;
  threshold_lower: number | null;
  status: string;
  triggered_at: string | null;
  created_at: string;
}

interface LegacyAlertLog {
  id: number;
  alert_id: number;
  user_id: number;
  stock_code: string;
  base_price: number;
  current_price: number;
  change_rate: number;
  threshold_type: string;
  /** SQLite 직렬화: 0 또는 1 정수 */
  email_sent: number;
  sent_at: string;
}

// ─────────────────────────────────────────────
// dry-run 롤백 전용 에러
// ─────────────────────────────────────────────

class DryRunRollback extends Error {
  constructor() {
    super("dry-run rollback");
  }
}

// ─────────────────────────────────────────────
// Prisma 클라이언트 생성
// ─────────────────────────────────────────────

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"]!,
  });
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

// ─────────────────────────────────────────────
// Datetime 파싱 헬퍼
// ─────────────────────────────────────────────

/**
 * legacy SQLite naive datetime 문자열을 JavaScript Date 객체로 변환합니다.
 *
 * legacy 형식 예: "2026-02-06 18:40:03.728046" (KST, 마이크로초 6자리, timezone 정보 없음)
 * 변환 절차:
 *   1. 공백 → "T" 치환 (ISO 8601 형태로)
 *   2. 마이크로초 6자리 → 밀리초 3자리로 truncate (JavaScript Date 정밀도 한계)
 *   3. "+09:00" 명시 부착 (KST 고정)
 *
 * @param s - legacy datetime 문자열
 * @returns 해당 KST 시각을 나타내는 Date 객체 (내부적으로 UTC milliseconds 보유)
 *
 * @example
 * ```ts
 * parseLegacyKstDate("2026-02-06 18:40:03.728046")
 * // → Date(KST 2026-02-06 18:40:03.728 = UTC 2026-02-06 09:40:03.728)
 * ```
 */
function parseLegacyKstDate(s: string): Date {
  // 1. 공백 → T
  // 2. 마이크로초(.ffffff) → 밀리초(.fff)로 자름
  const isoLocal = s.replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1");
  // 3. KST timezone 명시
  const result = new Date(`${isoLocal}+09:00`);
  if (Number.isNaN(result.getTime())) {
    throw new Error(`[parseLegacyKstDate] invalid datetime: ${s}`);
  }
  return result;
}

// ─────────────────────────────────────────────
// CLI 파싱
// ─────────────────────────────────────────────

interface CliArgs {
  usersPath: string;
  alertsPath: string;
  logsPath: string;
  isDryRun: boolean;
}

/**
 * CLI 인수를 파싱하여 실행 설정을 반환합니다.
 *
 * @param argv - process.argv
 * @returns 파싱된 CLI 인수
 */
function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);

  let usersPath: string | undefined;
  let alertsPath: string | undefined;
  let logsPath: string | undefined;
  let hasDryRun = false;
  let hasApply = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--users") {
      usersPath = args[++i];
    } else if (arg === "--alerts") {
      alertsPath = args[++i];
    } else if (arg === "--logs") {
      logsPath = args[++i];
    } else if (arg === "--dry-run") {
      hasDryRun = true;
    } else if (arg === "--apply") {
      hasApply = true;
    } else {
      console.error(`[migrate] 알 수 없는 플래그: ${arg}`);
      process.exit(1);
    }
  }

  if (!usersPath || !alertsPath || !logsPath) {
    console.error(
      "[migrate] 필수 인수 누락: --users <path> --alerts <path> --logs <path>"
    );
    process.exit(1);
  }

  if (hasDryRun && hasApply) {
    console.error("[migrate] --dry-run과 --apply를 동시에 명시할 수 없습니다");
    process.exit(1);
  }

  return {
    usersPath,
    alertsPath,
    logsPath,
    isDryRun: !hasApply, // 기본값 dry-run
  };
}

// ─────────────────────────────────────────────
// 입력 검증 헬퍼
// ─────────────────────────────────────────────

function validateUserRow(u: unknown, index: number): asserts u is LegacyUser {
  const row = u as Record<string, unknown>;
  if (
    typeof row["id"] !== "number" ||
    typeof row["email"] !== "string" ||
    typeof row["created_at"] !== "string"
  ) {
    throw new Error(
      `[validate] users[${index}] 필수 필드 누락: ${JSON.stringify(u)}`
    );
  }
}

function validateAlertRow(
  a: unknown,
  index: number
): asserts a is LegacyAlert {
  const row = a as Record<string, unknown>;
  if (
    typeof row["id"] !== "number" ||
    typeof row["user_id"] !== "number" ||
    typeof row["stock_code"] !== "string" ||
    typeof row["stock_name"] !== "string" ||
    typeof row["base_price"] !== "number" ||
    typeof row["status"] !== "string" ||
    typeof row["created_at"] !== "string"
  ) {
    throw new Error(
      `[validate] alerts[${index}] 필수 필드 누락: ${JSON.stringify(a)}`
    );
  }
}

function validateLogRow(
  l: unknown,
  index: number
): asserts l is LegacyAlertLog {
  const row = l as Record<string, unknown>;
  if (
    typeof row["id"] !== "number" ||
    typeof row["alert_id"] !== "number" ||
    typeof row["user_id"] !== "number" ||
    typeof row["stock_code"] !== "string" ||
    typeof row["base_price"] !== "number" ||
    typeof row["current_price"] !== "number" ||
    typeof row["change_rate"] !== "number" ||
    typeof row["threshold_type"] !== "string" ||
    typeof row["sent_at"] !== "string"
  ) {
    throw new Error(
      `[validate] alert-logs[${index}] 필수 필드 누락: ${JSON.stringify(l)}`
    );
  }
}

// ─────────────────────────────────────────────
// main
// ─────────────────────────────────────────────

async function main() {
  const { usersPath, alertsPath, logsPath, isDryRun } = parseArgs(process.argv);

  console.log(`[migrate] mode=${isDryRun ? "dry-run" : "apply"}`);

  // 1. JSON 파일 로드
  const [usersRaw, alertsRaw, logsRaw] = await Promise.all([
    readFile(usersPath, "utf-8"),
    readFile(alertsPath, "utf-8"),
    readFile(logsPath, "utf-8"),
  ]);

  const rawUsers = JSON.parse(usersRaw) as unknown[];
  const rawAlerts = JSON.parse(alertsRaw) as unknown[];
  const rawLogs = JSON.parse(logsRaw) as unknown[];

  console.log(`[input] users.json: ${rawUsers.length} rows`);
  console.log(`[input] alerts.json: ${rawAlerts.length} rows`);
  console.log(`[input] alert-logs.json: ${rawLogs.length} rows`);

  // 2. 입력 검증
  rawUsers.forEach((u, i) => validateUserRow(u, i));
  rawAlerts.forEach((a, i) => validateAlertRow(a, i));
  rawLogs.forEach((l, i) => validateLogRow(l, i));

  const legacyUsers = rawUsers as LegacyUser[];
  const legacyAlerts = rawAlerts as LegacyAlert[];
  const legacyLogs = rawLogs as LegacyAlertLog[];

  // 3. alertId → stock_name 매핑 dict
  const alertStockNameByLegacyId = new Map<number, string>();
  for (const a of legacyAlerts) {
    alertStockNameByLegacyId.set(a.id, a.stock_name);
  }

  const prisma = createPrismaClient();

  // 트랜잭션 내부에서 수집된 데이터를 외부로 전달하기 위한 mutable 객체
  const scenarioA: Array<{ legacyId: number; email: string; v2Id: string }> =
    [];
  const scenarioB: Array<{ legacyId: number; email: string; v2Id: string }> =
    [];
  const counts = { User: 0, Alert: 0, AlertLog: 0 };

  try {
    await prisma.$transaction(async (tx) => {
      // Pre-guard: Alert / AlertLog가 비어있는지 확인
      const preAlertCount = await tx.alert.count();
      const preAlertLogCount = await tx.alertLog.count();
      const guardOk = preAlertCount === 0 && preAlertLogCount === 0;
      console.log(
        `[guard] v2 Alert preCount=${preAlertCount} AlertLog preCount=${preAlertLogCount}${guardOk ? " ✓" : ""}`
      );

      if (!guardOk) {
        throw new Error(
          `v2 Alert (${preAlertCount}) 또는 AlertLog (${preAlertLogCount})가 비어있지 않습니다. 마이그레이션 전에 비워주세요.`
        );
      }

      // 5. User 처리
      const userIdByLegacyId = new Map<number, string>();

      for (const u of legacyUsers) {
        const existing = await tx.user.findUnique({
          where: { email: u.email },
        });

        if (existing) {
          // 시나리오 A — 기존 row 보존. update 절대 없음
          userIdByLegacyId.set(u.id, existing.id);
          scenarioA.push({ legacyId: u.id, email: u.email, v2Id: existing.id });
          console.log(
            `[user] scenario A — match existing v2 user: legacy_id=${u.id} email=${u.email} v2_id=${existing.id}`
          );
        } else {
          // 시나리오 B — 신규 생성
          const created = await tx.user.create({
            data: {
              email: u.email,
              nickname: u.email.split("@")[0],
              image: null,
              googleId: null,
              createdAt: parseLegacyKstDate(u.created_at),
            },
          });
          userIdByLegacyId.set(u.id, created.id);
          scenarioB.push({
            legacyId: u.id,
            email: u.email,
            v2Id: created.id,
          });
          console.log(
            `[user] scenario B — create new v2 user: legacy_id=${u.id} email=${u.email} v2_id=${created.id}`
          );
        }
      }

      const mappingObj: Record<string, string> = {};
      for (const [k, v] of userIdByLegacyId.entries()) {
        mappingObj[String(k)] = v;
      }
      console.log(`[user] mapping: ${JSON.stringify(mappingObj)}`);

      // 6. Alert 처리
      const alertIdByLegacyId = new Map<number, string>();

      for (const a of legacyAlerts) {
        const v2UserId = userIdByLegacyId.get(a.user_id);
        if (!v2UserId) {
          throw new Error(
            `[alert] orphan: legacy alert.id=${a.id} references unknown legacy user_id=${a.user_id}`
          );
        }

        const created = await tx.alert.create({
          data: {
            userId: v2UserId,
            stockCode: a.stock_code,
            stockName: a.stock_name,
            basePrice: Math.round(a.base_price),
            thresholdUpper: a.threshold_upper,
            thresholdLower: a.threshold_lower,
            status: a.status,
            createdAt: parseLegacyKstDate(a.created_at),
          },
        });

        alertIdByLegacyId.set(a.id, created.id);
      }

      console.log(`[alert] created ${alertIdByLegacyId.size} alerts`);

      // 7. AlertLog 처리
      for (const l of legacyLogs) {
        const v2UserId = userIdByLegacyId.get(l.user_id);
        if (!v2UserId) {
          throw new Error(
            `[log] orphan user: legacy log.id=${l.id} user_id=${l.user_id}`
          );
        }

        const v2AlertId = alertIdByLegacyId.get(l.alert_id);
        if (!v2AlertId) {
          throw new Error(
            `[log] orphan alert: legacy log.id=${l.id} alert_id=${l.alert_id}`
          );
        }

        const stockName = alertStockNameByLegacyId.get(l.alert_id);
        if (!stockName) {
          throw new Error(
            `[log] missing stockName from legacy alerts: alert_id=${l.alert_id}`
          );
        }

        await tx.alertLog.create({
          data: {
            alertId: v2AlertId,
            userId: v2UserId,
            stockCode: l.stock_code,
            stockName,
            basePrice: Math.round(l.base_price),
            triggeredPrice: Math.round(l.current_price),
            changeRate: l.change_rate,
            thresholdType: l.threshold_type,
            emailSent: Boolean(l.email_sent),
            createdAt: parseLegacyKstDate(l.sent_at),
          },
        });
      }

      console.log(`[log] created ${legacyLogs.length} alert logs`);

      // 8. 카운트 검증
      counts.User = await tx.user.count();
      counts.Alert = await tx.alert.count();
      counts.AlertLog = await tx.alertLog.count();
      console.log(
        `[counts] User=${counts.User} Alert=${counts.Alert} AlertLog=${counts.AlertLog}`
      );

      // 9. dry-run 분기
      if (isDryRun) {
        throw new DryRunRollback();
      }
    });

    // --apply 정상 commit
    const summary = {
      mode: "apply",
      scenarioA,
      scenarioB,
      imported: {
        users: scenarioB.length,
        alerts: legacyAlerts.length,
        alertLogs: legacyLogs.length,
      },
      totals: counts,
    };
    console.log(`[summary] ${JSON.stringify(summary, null, 2)}`);
    console.log("[apply] transaction committed ✓");
  } catch (err) {
    if (err instanceof DryRunRollback) {
      // dry-run 정상 종료 — 롤백 확인
      const summary = {
        mode: "dry-run",
        scenarioA,
        scenarioB,
        imported: {
          users: scenarioB.length,
          alerts: legacyAlerts.length,
          alertLogs: legacyLogs.length,
        },
        totals: counts,
      };
      console.log(`[summary] ${JSON.stringify(summary, null, 2)}`);
      console.log("[dry-run] transaction rolled back ✓");
    } else {
      console.error("[migrate] 오류:", err);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[migrate] 치명적 오류:", error);
  process.exit(1);
});
