import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

/**
 * 필수 시드 데이터를 삽입합니다.
 * 인증 로직에 필요한 Role 데이터만 포함합니다.
 * upsert를 사용하여 중복 실행에도 안전합니다.
 */
async function main() {
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

  console.log("Essential seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
