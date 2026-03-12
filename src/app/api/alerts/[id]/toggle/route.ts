import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/alerts/[id]/toggle
 *
 * 알림 상태를 토글합니다 (active ↔ inactive).
 */
export async function PATCH(
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

  const newStatus = existing.status === "active" ? "inactive" : "active";

  const alert = await prisma.alert.update({
    where: { id },
    data: { status: newStatus },
    include: { _count: { select: { alertLogs: true } } },
  });

  return NextResponse.json(alert);
}
