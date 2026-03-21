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

  // ─── Alert 시딩 ───
  await seedAlerts();

  // ─── AlertLog 시딩 ───
  await seedAlertLogs();

  console.log("Seed completed.");
}

const dummyAlerts = [
  { stockCode: "005930", stockName: "삼성전자", basePrice: 58000 },
  { stockCode: "000660", stockName: "SK하이닉스", basePrice: 182000 },
  { stockCode: "207940", stockName: "삼성바이오로직스", basePrice: 1050000 },
  { stockCode: "005490", stockName: "POSCO홀딩스", basePrice: 310000 },
  { stockCode: "051910", stockName: "LG화학", basePrice: 210000 },
  { stockCode: "035420", stockName: "NAVER", basePrice: 168000 },
  { stockCode: "035720", stockName: "카카오", basePrice: 42000 },
  { stockCode: "000270", stockName: "기아", basePrice: 88000 },
  { stockCode: "005380", stockName: "현대차", basePrice: 185000 },
  { stockCode: "068270", stockName: "셀트리온", basePrice: 145000 },
  { stockCode: "105560", stockName: "KB금융", basePrice: 82000 },
  { stockCode: "055550", stockName: "신한지주", basePrice: 50000 },
  { stockCode: "086790", stockName: "하나금융지주", basePrice: 65000 },
  { stockCode: "316140", stockName: "우리금융지주", basePrice: 15000 },
  { stockCode: "032830", stockName: "삼성생명", basePrice: 95000 },
  { stockCode: "003550", stockName: "LG", basePrice: 72000 },
  { stockCode: "096770", stockName: "SK이노베이션", basePrice: 98000 },
  { stockCode: "017670", stockName: "SK텔레콤", basePrice: 52000 },
  { stockCode: "030200", stockName: "KT", basePrice: 40000 },
  { stockCode: "015760", stockName: "한국전력", basePrice: 22000 },
  { stockCode: "033780", stockName: "KT&G", basePrice: 98000 },
  { stockCode: "036570", stockName: "엔씨소프트", basePrice: 165000 },
  { stockCode: "251270", stockName: "넷마블", basePrice: 52000 },
  { stockCode: "112040", stockName: "위메이드", basePrice: 28000 },
  { stockCode: "263750", stockName: "펄어비스", basePrice: 32000 },
  { stockCode: "041510", stockName: "에스엠", basePrice: 72000 },
  { stockCode: "352820", stockName: "하이브", basePrice: 158000 },
  { stockCode: "034020", stockName: "두산에너빌리티", basePrice: 18000 },
  { stockCode: "006400", stockName: "삼성SDI", basePrice: 198000 },
  { stockCode: "373220", stockName: "LG에너지솔루션", basePrice: 295000 },
];

/**
 * Alert 더미 데이터 30건을 생성합니다.
 * 기존 데이터가 20건 이상이면 스킵합니다.
 */
async function seedAlerts() {
  const user = await prisma.user.findUnique({
    where: { email: "okayha1726@gmail.com" },
  });

  if (!user) {
    console.warn("⚠ Alert 시딩 스킵: okayha1726@gmail.com 사용자를 찾을 수 없습니다.");
    return;
  }

  const existingCount = await prisma.alert.count({
    where: { userId: user.id },
  });

  if (existingCount >= 20) {
    console.log(`Alert 시딩 스킵: 이미 ${existingCount}건의 데이터가 존재합니다.`);
    return;
  }

  // 상승/하락 임계값 프리셋 (대칭, 비대칭, 단방향 혼합)
  const thresholdPresets = [
    { thresholdUpper: 5,    thresholdLower: -5    },  // 소폭 대칭
    { thresholdUpper: 10,   thresholdLower: -10   },  // 중폭 대칭
    { thresholdUpper: 15,   thresholdLower: -15   },  // 대폭 대칭
    { thresholdUpper: 3,    thresholdLower: -3    },  // 미세 대칭
    { thresholdUpper: 20,   thresholdLower: -20   },  // 장기 대칭
    { thresholdUpper: 7,    thresholdLower: -12   },  // 비대칭 (하락 폭 큰)
    { thresholdUpper: 12,   thresholdLower: -7    },  // 비대칭 (상승 폭 큰)
    { thresholdUpper: 8,    thresholdLower: null  },  // 상승 단방향
    { thresholdUpper: null, thresholdLower: -8    },  // 하락 단방향
    { thresholdUpper: 6,    thresholdLower: -15   },  // 비대칭 (하락 주의)
  ] as const;

  const data = dummyAlerts.map((alert, index) => ({
    userId: user.id,
    stockCode: alert.stockCode,
    stockName: alert.stockName,
    basePrice: alert.basePrice,
    ...thresholdPresets[index % thresholdPresets.length],
    status: index % 5 === 0 ? "inactive" : "active",
  }));

  await prisma.alert.createMany({ data });
  console.log(`Alert ${dummyAlerts.length}건 생성 완료.`);
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
