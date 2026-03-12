import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { changeRoleSchema } from "@/lib/validations";

/**
 * PATCH /api/admin/users/[id]/role
 *
 * 사용자의 admin 역할을 부여하거나 해제합니다.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id: targetUserId } = await params;
  const body = await request.json();
  const parsed = changeRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  const { action } = parsed.data;

  // 자기 자신의 admin 역할 해제 방지
  if (action === "revoke" && targetUserId === result.session.user.id) {
    return NextResponse.json(
      { error: "자기 자신의 관리자 권한은 해제할 수 없습니다" },
      { status: 400 }
    );
  }

  // admin 역할 조회
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    return NextResponse.json(
      { error: "admin 역할이 존재하지 않습니다" },
      { status: 500 }
    );
  }

  // 대상 사용자 존재 확인
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: "사용자를 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  if (action === "grant") {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: targetUserId,
          roleId: adminRole.id,
        },
      },
      create: {
        userId: targetUserId,
        roleId: adminRole.id,
      },
      update: {},
    });
  } else {
    await prisma.userRole.deleteMany({
      where: {
        userId: targetUserId,
        roleId: adminRole.id,
      },
    });
  }

  return NextResponse.json({ success: true });
}
