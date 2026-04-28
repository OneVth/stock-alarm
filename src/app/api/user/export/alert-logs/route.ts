import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function csvEscape(value: string): string {
  if (/[,"\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.alertLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const filename = `stock-alarm-history-${today}.csv`;

  const rows = logs.map((log) => {
    const datetime = log.createdAt
      .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
      .replace("T", " ");
    const direction = log.thresholdType === "upper" ? "상승" : "하락";
    return [
      csvEscape(datetime),
      csvEscape(log.stockName),
      csvEscape(log.stockCode),
      String(log.triggeredPrice),
      String(log.basePrice),
      log.changeRate.toFixed(2),
      direction,
    ].join(",");
  });

  const header = "﻿발송일시,종목명,종목코드,발송 시점 가격,등록가,변동률(%),방향\n";
  const csv = header + rows.join("\n") + (rows.length > 0 ? "\n" : "");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
