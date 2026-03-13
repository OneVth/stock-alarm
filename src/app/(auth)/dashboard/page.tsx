import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AlertFormDialog } from "@/components/dashboard/alert-form-dialog";
import { AlertTable } from "@/components/dashboard/alert-table";
import { AlertFilterTabs } from "@/components/stock/alert-filter-tabs";
import type { AlertFilterStats } from "@/types/alert";

export const metadata: Metadata = {
  title: "대시보드 | Stock Alarm",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { filter } = await searchParams;

  // 카운트: 항상 전체 (필터 무관, 탭 숫자 표시용)
  const [allAlerts, statusCounts] = await Promise.all([
    prisma.alert.findMany({
      where: { userId },
      include: { _count: { select: { alertLogs: true } } },
      orderBy: { createdAt: "desc" },
    }),
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
    total: allAlerts.length,
    active: countMap["active"] ?? 0,
    inactive: countMap["inactive"] ?? 0,
  };

  // 필터 적용
  const filteredAlerts =
    filter === "active" || filter === "inactive"
      ? allAlerts.filter((a) => a.status === filter)
      : allAlerts;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">내 알림</h2>
        <AlertFormDialog />
      </div>

      <AlertFilterTabs counts={counts} />

      <AlertTable alerts={filteredAlerts} />
    </div>
  );
}
