import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAlertSchema } from "@/lib/validations";

/**
 * GET /api/alerts/[id]
 *
 * 알림 상세 조회 (소유권 체크 포함)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const alert = await prisma.alert.findUnique({
    where: { id, userId: session.user.id },
    include: { _count: { select: { alertLogs: true } } },
  });

  if (!alert) {
    return NextResponse.json({ error: "알림을 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json(alert);
}

/**
 * PUT /api/alerts/[id]
 *
 * 알림 수정 (소유권 체크 포함)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateAlertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  const existing = await prisma.alert.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "알림을 찾을 수 없습니다" }, { status: 404 });
  }

  const { stockCode, stockName, basePrice, thresholdUpper, thresholdLower, memo } =
    parsed.data;

  const alert = await prisma.alert.update({
    where: { id },
    data: {
      ...(stockCode !== undefined && { stockCode }),
      ...(stockName !== undefined && { stockName }),
      ...(basePrice !== undefined && { basePrice }),
      ...(thresholdUpper !== undefined && { thresholdUpper }),
      ...(thresholdLower !== undefined && { thresholdLower }),
      ...(memo !== undefined && { memo: memo ?? undefined }),
    },
    include: { _count: { select: { alertLogs: true } } },
  });

  return NextResponse.json(alert);
}

/**
 * DELETE /api/alerts/[id]
 *
 * 알림 삭제 (소유권 체크 포함)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.alert.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "알림을 찾을 수 없습니다" }, { status: 404 });
  }

  await prisma.alert.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
