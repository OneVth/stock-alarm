import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminStatCards } from "@/components/admin/admin-stat-cards";
import { RecentUsersTable } from "@/components/admin/recent-users-table";
import { RecentAlertLogsTable } from "@/components/admin/recent-alert-logs-table";
import { Button } from "@/components/ui/button";
import { UsersIcon, ScrollTextIcon } from "lucide-react";

import type { AdminStats } from "@/types/admin";

export const metadata: Metadata = {
  title: "관리자 대시보드 | Stock Alarm",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalUsers, totalAlerts, todaySentAlerts, recentUsers, recentAlertLogs] = await Promise.all([
    prisma.user.count(),
    prisma.alert.count(),
    prisma.alertLog.count({
      where: {
        createdAt: { gte: todayStart },
        emailSent: true,
      },
    }),
    prisma.user.findMany({
      include: { _count: { select: { alerts: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.alertLog.findMany({
      include: { alert: { select: { stockName: true, stockCode: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats: AdminStats = { totalUsers, totalAlerts, todaySentAlerts };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <AdminStatCards stats={stats} />

      <div className="flex gap-3">
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/users" />}>
          <UsersIcon />
          사용자 관리
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/logs" />}>
          <ScrollTextIcon />
          시스템 로그
        </Button>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">최근 가입 사용자</h2>
        <RecentUsersTable users={JSON.parse(JSON.stringify(recentUsers))} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">최근 알림 발송</h2>
        <RecentAlertLogsTable logs={JSON.parse(JSON.stringify(recentAlertLogs))} />
      </section>
    </div>
  );
}
