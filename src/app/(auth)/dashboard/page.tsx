import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AlertFormDialog } from "@/components/dashboard/alert-form-dialog";
import { AlertList } from "@/components/dashboard/alert-list";
import { AlertFilterTabs } from "@/components/stock/alert-filter-tabs";
import { AlertSearch } from "@/components/dashboard/alert-search";
import { AlertPagination } from "@/components/dashboard/alert-pagination";
import type { AlertFilterStats } from "@/types/alert";

export const metadata: Metadata = {
  title: "대시보드 | Stock Alarm",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string; q?: string; size?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { filter, page, q, size } = await searchParams;

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = [10, 20, 50].includes(Number(size)) ? Number(size) : 10;

  const where = {
    userId,
    ...(filter === "active" || filter === "inactive" ? { status: filter } : {}),
    ...(q
      ? {
          OR: [
            { stockName: { contains: q, mode: "insensitive" as const } },
            { stockCode: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [alerts, totalCount, statusCounts] = await Promise.all([
    prisma.alert.findMany({
      where,
      include: { _count: { select: { alertLogs: true } } },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.alert.count({ where }),
    prisma.alert.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  );

  const counts: AlertFilterStats = {
    total: Object.values(countMap).reduce((a, b) => a + b, 0),
    active: countMap["active"] ?? 0,
    inactive: countMap["inactive"] ?? 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">내 알림</h2>
        <AlertFormDialog />
      </div>

      <AlertFilterTabs counts={counts} />

      <AlertSearch defaultValue={q} />

      <AlertList alerts={alerts} />

      <AlertPagination totalCount={totalCount} page={pageNum} pageSize={pageSize} />
    </div>
  );
}
