import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FullAlertHistory } from "@/components/stock/full-alert-history";
import { HistoryPagination } from "@/components/stock/history-pagination";

export const metadata: Metadata = {
  title: "알림 이력 | Stock Alarm",
};

const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const userId = session.user.id;

  const [alertLogs, totalCount] = await Promise.all([
    prisma.alertLog.findMany({
      where: { userId },
      include: {
        alert: { select: { stockName: true, stockCode: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.alertLog.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">알림 이력</h1>
        <Badge variant="secondary">{totalCount}건</Badge>
      </div>

      <FullAlertHistory
        alertLogs={JSON.parse(JSON.stringify(alertLogs))}
      />

      <HistoryPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
