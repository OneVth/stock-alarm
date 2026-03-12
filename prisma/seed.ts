import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

/**
 * Role 테이블에 초기 데이터를 삽입합니다.
 * upsert를 사용하여 중복 실행에도 안전합니다.
 */
async function main() {
  // ─── Role 시딩 ───
  const roles = [
    { name: "user", description: "일반 사용자" },
    { name: "admin", description: "관리자" },
  ];

  for (const role of roles) {
    const result = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
    console.log(`Role upserted: ${result.name} (${result.id})`);
  }

  // ─── AlertLog 시딩 ───
  await seedAlertLogs();

  console.log("Seed completed.");
}

/**
 * AlertLog 더미 데이터 28건을 생성합니다.
 * 기존 User와 Alert 데이터를 기반으로 생성하며, Alert가 없으면 스킵합니다.
 */
async function seedAlertLogs() {
  const user = await prisma.user.findUnique({
    where: { email: "okayha1726@gmail.com" },
  });

  if (!user) {
    console.warn("⚠ AlertLog 시딩 스킵: okayha1726@gmail.com 사용자를 찾을 수 없습니다.");
    return;
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: user.id },
  });

  if (alerts.length === 0) {
    console.warn("⚠ AlertLog 시딩 스킵: 해당 사용자의 Alert가 없습니다.");
    return;
  }

  // 기존 AlertLog가 이미 있으면 스킵
  const existingCount = await prisma.alertLog.count({
    where: { userId: user.id },
  });

  if (existingCount > 0) {
    console.log(`AlertLog 시딩 스킵: 이미 ${existingCount}건의 데이터가 존재합니다.`);
    return;
  }

  const TOTAL = 28;
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const logs = Array.from({ length: TOTAL }, (_, i) => {
    const alert = alerts[i % alerts.length];
    const isUpper = Math.random() > 0.5;
    const thresholdType = isUpper ? "upper" : "lower";

    // ±2~8% 변동률
    const rateAbs = 2 + Math.random() * 6;
    const changeRate = isUpper ? rateAbs : -rateAbs;
    const triggeredPrice = Math.round(alert.basePrice * (1 + changeRate / 100));

    // 최근 30일 내 랜덤 날짜
    const createdAt = new Date(now - Math.random() * THIRTY_DAYS_MS);

    return {
      alertId: alert.id,
      userId: user.id,
      stockCode: alert.stockCode,
      basePrice: alert.basePrice,
      triggeredPrice,
      changeRate: Math.round(changeRate * 100) / 100,
      thresholdType,
      emailSent: Math.random() < 0.7,
      createdAt,
    };
  });

  await prisma.alertLog.createMany({ data: logs });
  console.log(`AlertLog ${TOTAL}건 생성 완료.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
