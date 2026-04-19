/**
 * Cron 알림 체크 스크립트
 *
 * 활성 알림의 현재가를 조회하고, 임계값 도달 시 이메일을 발송합니다.
 *
 * 실행: pnpm run check-alerts
 * 크론탭: 35 11 * * 1-5 (평일 11:35)
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getBatchPrices, getMarketIndex } from "../src/services/stock";
import { checkAlertTrigger } from "../src/lib/alert-trigger";
import { sendAlertEmail } from "../src/services/mail";
import { generateAlertComment } from "../src/services/llm";
import type { MarketIndex } from "../src/types/stock";

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

interface ProcessResult {
  alertId: string;
  stockCode: string;
  stockName: string;
  success: boolean;
  emailSent: boolean;
  error?: string;
}

async function main() {
  const startTime = Date.now();
  console.log(`[check-alerts] 시작: ${new Date().toISOString()}`);

  const prisma = createPrismaClient();

  try {
    // 1. 활성 알림 조회
    const alerts = await prisma.alert.findMany({
      where: { status: "active" },
      include: { user: true },
    });

    if (alerts.length === 0) {
      console.log("[check-alerts] 활성 알림 없음");
      return;
    }

    console.log(`[check-alerts] 활성 알림 ${alerts.length}건 조회`);

    // 2. 종목 코드 중복 제거 → 배치 가격 조회
    const uniqueCodes = [...new Set(alerts.map((a) => a.stockCode))];
    const { prices, errors: priceErrors } = await getBatchPrices(uniqueCodes);

    if (priceErrors.length > 0) {
      console.warn(
        `[check-alerts] 가격 조회 실패 ${priceErrors.length}건:`,
        priceErrors
      );
    }

    // 가격 맵 생성
    const priceMap = new Map(prices.map((p) => [p.code, p]));

    // 3. 트리거 체크
    const triggeredAlerts: {
      alert: (typeof alerts)[number];
      currentPrice: number;
      changeRate: number;
      thresholdType: "upper" | "lower";
    }[] = [];

    for (const alert of alerts) {
      const stockPrice = priceMap.get(alert.stockCode);
      if (!stockPrice) {
        console.warn(
          `[check-alerts] ${alert.stockCode} 가격 없음, 건너뜀`
        );
        continue;
      }

      const result = checkAlertTrigger(
        {
          basePrice: alert.basePrice,
          thresholdUpper: alert.thresholdUpper,
          thresholdLower: alert.thresholdLower,
        },
        stockPrice.price
      );

      if (result.triggered && result.type) {
        triggeredAlerts.push({
          alert,
          currentPrice: stockPrice.price,
          changeRate: result.changeRate,
          thresholdType: result.type,
        });
      }
    }

    if (triggeredAlerts.length === 0) {
      console.log("[check-alerts] 트리거된 알림 없음");
      return;
    }

    console.log(
      `[check-alerts] 트리거된 알림 ${triggeredAlerts.length}건 처리 시작`
    );

    // 4. 시장 지수 조회 (1회만)
    let kospiIndex: MarketIndex | undefined;
    let kosdaqIndex: MarketIndex | undefined;

    try {
      [kospiIndex, kosdaqIndex] = await Promise.all([
        getMarketIndex("KOSPI"),
        getMarketIndex("KOSDAQ"),
      ]);
    } catch (error) {
      console.warn("[check-alerts] 시장 지수 조회 실패:", error);
    }

    // 5. 트리거된 알림 병렬 처리
    const results = await Promise.allSettled(
      triggeredAlerts.map(async (triggered): Promise<ProcessResult> => {
        const { alert, currentPrice, changeRate, thresholdType } = triggered;

        try {
          // LLM 코멘트 생성
          const llmComment = await generateAlertComment({
            stockName: alert.stockName,
            changeRate,
            thresholdType,
            kospiIndex,
            kosdaqIndex,
          });

          // 이메일 발송
          const emailSent = await sendAlertEmail({
            to: alert.user.email,
            stockName: alert.stockName,
            stockCode: alert.stockCode,
            basePrice: alert.basePrice,
            currentPrice,
            changeRate,
            thresholdType,
            kospiIndex,
            kosdaqIndex,
            llmComment,
          });

          // DB 트랜잭션: AlertLog 생성 + basePrice 업데이트
          await prisma.$transaction([
            prisma.alertLog.create({
              data: {
                alertId: alert.id,
                userId: alert.userId,
                stockCode: alert.stockCode,
                stockName: alert.stockName,
                basePrice: alert.basePrice,
                triggeredPrice: currentPrice,
                changeRate,
                thresholdType,
                emailSent,
              },
            }),
            prisma.alert.update({
              where: { id: alert.id },
              data: { basePrice: currentPrice },
            }),
          ]);

          return {
            alertId: alert.id,
            stockCode: alert.stockCode,
            stockName: alert.stockName,
            success: true,
            emailSent,
          };
        } catch (error) {
          console.error(
            `[check-alerts] 알림 처리 실패 (${alert.stockCode}):`,
            error
          );
          return {
            alertId: alert.id,
            stockCode: alert.stockCode,
            stockName: alert.stockName,
            success: false,
            emailSent: false,
            error: error instanceof Error ? error.message : "알 수 없는 오류",
          };
        }
      })
    );

    // 6. 결과 요약
    const processResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : {
            alertId: "unknown",
            stockCode: "unknown",
            stockName: "unknown",
            success: false,
            emailSent: false,
            error: r.reason?.message ?? "Promise rejected",
          }
    );

    const successCount = processResults.filter((r) => r.success).length;
    const emailCount = processResults.filter((r) => r.emailSent).length;
    const failCount = processResults.filter((r) => !r.success).length;

    console.log("\n[check-alerts] === 결과 요약 ===");
    console.log(`  활성 알림: ${alerts.length}건`);
    console.log(`  트리거 발생: ${triggeredAlerts.length}건`);
    console.log(`  처리 성공: ${successCount}건`);
    console.log(`  이메일 발송: ${emailCount}건`);
    console.log(`  처리 실패: ${failCount}건`);

    if (failCount > 0) {
      console.log("\n[check-alerts] 실패 상세:");
      processResults
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.stockName}(${r.stockCode}): ${r.error}`);
        });
    }
  } finally {
    await prisma.$disconnect();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[check-alerts] 완료 (${elapsed}s)`);
  }
}

main().catch((error) => {
  console.error("[check-alerts] 치명적 오류:", error);
  process.exit(1);
});
