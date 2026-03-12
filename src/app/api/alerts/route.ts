import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAlertSchema } from "@/lib/validations";

/**
 * GET /api/alerts
 *
 * 현재 사용자의 알림 목록을 조회합니다.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { alertLogs: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

/**
 * POST /api/alerts
 *
 * 새 알림을 생성합니다.
 * 동일 종목에 대한 중복 알림은 허용하지 않습니다.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createAlertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  const { stockCode, stockName, basePrice, thresholdUpper, thresholdLower, memo } =
    parsed.data;

  // 중복 체크
  const existing = await prisma.alert.findFirst({
    where: { userId: session.user.id, stockCode },
  });

  if (existing) {
    return NextResponse.json(
      { error: "이미 등록된 종목입니다" },
      { status: 409 }
    );
  }

  const alert = await prisma.alert.create({
    data: {
      userId: session.user.id,
      stockCode,
      stockName,
      basePrice,
      thresholdUpper: thresholdUpper ?? null,
      thresholdLower: thresholdLower ?? null,
      memo: memo ?? undefined,
    },
    include: { _count: { select: { alertLogs: true } } },
  });

  return NextResponse.json(alert, { status: 201 });
}
