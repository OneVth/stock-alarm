import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminUserSearch } from "@/components/admin/admin-user-search";

import type { AdminUser } from "@/types/admin";

export const metadata: Metadata = {
  title: "사용자 관리 | Stock Alarm",
};

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { nickname: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        userRoles: { include: { role: true } },
        _count: { select: { alerts: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const mapped: AdminUser[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    roles: user.userRoles.map((ur) => ur.role.name),
    _count: user._count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <Badge variant="secondary">{totalCount}명</Badge>
      </div>

      <AdminUserSearch defaultValue={q} />

      <UserManagementTable
        users={mapped}
        currentUserId={session.user.id}
      />

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/users"
        searchParams={q ? { q } : undefined}
      />
    </div>
  );
}
