/**
 * AlertLog.stockName 백필 스크립트 (1회성 마이그레이션용)
 *
 * 실행 시점: alertlog_stockname_not_null 마이그레이션 이전
 * 이후 재실행 시 stockName이 이미 설정된 행은 idempotent하게 덮어쓰기
 *
 * 우선순위:
 *   (a) krx-stocks.json에서 stockCode로 종목명 조회
 *   (b) 연결된 Alert.stockName 사용
 *   (c) 둘 다 없으면 "(삭제된 종목)" 기록
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"]!,
  });
  return new PrismaClient({ adapter, log: ["error"] });
}

async function main() {
  const prisma = createPrismaClient();

  try {
    // 1. krx-stocks.json 로드
    const jsonPath = join(process.cwd(), "src/data/krx-stocks.json");
    const stocks: { code: string; name: string; market: string }[] = JSON.parse(
      readFileSync(jsonPath, "utf-8")
    );
    const stockMap = new Map<string, string>(stocks.map((s) => [s.code, s.name]));
    console.log(`종목 마스터 로드: ${stockMap.size}개`);

    // 2. 전체 AlertLog 조회 (Alert 정보 포함)
    const logs = await prisma.alertLog.findMany({
      include: {
        alert: { select: { stockName: true } },
      },
    });

    console.log(`AlertLog 전체: ${logs.length}건`);

    if (logs.length === 0) {
      console.log("처리할 행이 없습니다. 종료.");
      return;
    }

    let countA = 0;
    let countB = 0;
    let countC = 0;
    const missingCodes: string[] = [];

    const updates = logs.map((log) => {
      let stockName: string;

      if (stockMap.has(log.stockCode)) {
        // (a) JSON 마스터에서 찾음
        stockName = stockMap.get(log.stockCode)!;
        countA++;
      } else if (log.alert?.stockName) {
        // (b) 연결된 Alert에서 찾음
        stockName = log.alert.stockName;
        countB++;
      } else {
        // (c) 두 경로 모두 실패
        stockName = "(삭제된 종목)";
        countC++;
        missingCodes.push(log.stockCode);
      }

      return prisma.alertLog.update({
        where: { id: log.id },
        data: { stockName },
      });
    });

    // 3. 트랜잭션으로 일괄 업데이트
    await prisma.$transaction(updates);

    console.log("\n=== 처리 결과 ===");
    console.log(`총 처리: ${logs.length}건`);
    console.log(`(a) 종목 마스터(JSON): ${countA}건`);
    console.log(`(b) 연결 Alert: ${countB}건`);
    console.log(`(c) "(삭제된 종목)": ${countC}건`);

    if (missingCodes.length > 0) {
      console.log(`\n⚠ 마스터/Alert 모두 없는 종목 코드: ${[...new Set(missingCodes)].join(", ")}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("백필 실패:", e);
  process.exit(1);
});
