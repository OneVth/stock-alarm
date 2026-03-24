import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { StockDetailClient } from "./stock-detail-client";

export const metadata: Metadata = {
  title: "종목 상세 | Stock Alarm",
};

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const [alert, alertLogs, alertLogCount] = await Promise.all([
    prisma.alert.findFirst({
      where: { id, userId: session.user.id },
    }),
    prisma.alertLog.findMany({
      where: { alertId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.alertLog.count({ where: { alertId: id } }),
  ]);

  if (!alert) {
    notFound();
  }

  return (
    <StockDetailClient
      alert={JSON.parse(JSON.stringify(alert))}
      alertLogs={JSON.parse(JSON.stringify(alertLogs))}
      alertLogCount={alertLogCount}
    />
  );
}
