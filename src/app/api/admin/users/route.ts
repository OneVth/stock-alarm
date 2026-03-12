import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const PAGE_SIZE = 20;

/**
 * GET /api/admin/users
 *
 * 사용자 목록을 페이지네이션으로 조회합니다. (admin 전용)
 */
export async function GET(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      include: {
        userRoles: { include: { role: true } },
        _count: { select: { alerts: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.user.count(),
  ]);

  const mapped = users.map((user) => ({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    roles: user.userRoles.map((ur) => ur.role.name),
    _count: user._count,
  }));

  return NextResponse.json({
    users: mapped,
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  });
}
