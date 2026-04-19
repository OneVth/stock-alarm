import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FullAlertHistory } from "@/components/stock/full-alert-history";
import { HistoryPagination } from "@/components/stock/history-pagination";
import { HistoryFilterTabs } from "@/components/stock/history-filter-tabs";
import { HistorySearch } from "@/components/stock/history-search";

export const metadata: Metadata = {
  title: "알림 이력 | Stock Alarm",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; stock?: string; size?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { page: pageParam, type, stock, size } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = [10, 20, 50].includes(Number(size)) ? Number(size) : 20;
  const userId = session.user.id;

  const where = {
    userId,
    ...(type === "upper" || type === "lower" ? { thresholdType: type } : {}),
    ...(stock
      ? { stockName: { contains: stock, mode: "insensitive" as const } }
      : {}),
  };

  const [alertLogs, totalCount, typeCounts] = await Promise.all([
    prisma.alertLog.findMany({
      where,
      include: {
        alert: { select: { stockName: true, stockCode: true } },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.alertLog.count({ where }),
    prisma.alertLog.groupBy({
      by: ["thresholdType"],
      where: { userId },
      _count: true,
    }),
  ]);

  const typeCountMap = Object.fromEntries(
    typeCounts.map((t) => [t.thresholdType, t._count])
  );

  const counts = {
    total: Object.values(typeCountMap).reduce((a, b) => a + b, 0),
    upper: typeCountMap["upper"] ?? 0,
    lower: typeCountMap["lower"] ?? 0,
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold leading-snug tracking-[-0.01em]">알림 이력</h1>
        <Badge variant="secondary">{totalCount}건</Badge>
      </div>

      <HistoryFilterTabs counts={counts} />

      <HistorySearch defaultValue={stock} />

      <FullAlertHistory alertLogs={JSON.parse(JSON.stringify(alertLogs))} />

      <HistoryPagination currentPage={page} totalPages={totalPages} pageSize={pageSize} />
    </div>
  );
}
