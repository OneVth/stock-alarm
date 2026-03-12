import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCards } from "@/components/dashboard/stat-cards";
import { AlertFormDialog } from "@/components/dashboard/alert-form-dialog";
import { AlertTable } from "@/components/dashboard/alert-table";
import type { DashboardStats } from "@/types/alert";

export const metadata: Metadata = {
  title: "대시보드 | Stock Alarm",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [alerts, statusCounts] = await Promise.all([
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

  const stats: DashboardStats = {
    total: alerts.length,
    active: countMap["active"] ?? 0,
    triggered: countMap["triggered"] ?? 0,
    inactive: countMap["inactive"] ?? 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <StatCards stats={stats} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">내 알림</h2>
        <AlertFormDialog />
      </div>

      <AlertTable alerts={alerts} />
    </div>
  );
}
