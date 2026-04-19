import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/alerts/[id]/history
 *
 * 알림 발동 이력을 조회합니다.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Alert 소유권 확인
  const alert = await prisma.alert.findUnique({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!alert) {
    return NextResponse.json(
      { error: "알림을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const skip = Math.max(0, Number(searchParams.get("skip")) || 0);
  const take = Math.min(100, Math.max(1, Number(searchParams.get("take")) || 5));

  const logs = await prisma.alertLog.findMany({
    where: { alertId: id },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return NextResponse.json({ logs });
}
