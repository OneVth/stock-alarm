import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LogFilterBar } from "@/components/admin/log-filter-bar";
import { SystemLogTable } from "@/components/admin/system-log-table";
import { AdminPagination } from "@/components/admin/admin-pagination";

import type { LogLevel, Prisma } from "@/generated/prisma/client";
import type { AdminSystemLog } from "@/types/admin";

export const metadata: Metadata = {
  title: "시스템 로그 | Stock Alarm",
};

const PAGE_SIZE = 20;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; level?: string; category?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { page: pageParam, level, category } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const where: Prisma.SystemLogWhereInput = {};
  if (level && ["ERROR", "WARN", "INFO"].includes(level)) {
    where.level = level as LogLevel;
  }
  if (category) {
    where.category = category;
  }

  const [logs, totalCount, categoryResults] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      include: {
        user: { select: { nickname: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.systemLog.count({ where }),
    prisma.systemLog.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const categories = categoryResults.map((c) => c.category);

  const mapped: AdminSystemLog[] = logs.map((log) => ({
    id: log.id,
    level: log.level,
    category: log.category,
    message: log.message,
    metadata: log.metadata,
    userId: log.userId,
    createdAt: log.createdAt.toISOString(),
    user: log.user,
  }));

  // 필터 보존을 위한 searchParams
  const filterParams: Record<string, string> = {};
  if (level) filterParams.level = level;
  if (category) filterParams.category = category;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">시스템 로그</h1>
        <Badge variant="secondary">{totalCount}건</Badge>
      </div>

      <LogFilterBar
        currentLevel={level}
        currentCategory={category}
        categories={categories}
      />

      <SystemLogTable logs={mapped} />

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/logs"
        searchParams={filterParams}
      />
    </div>
  );
}
