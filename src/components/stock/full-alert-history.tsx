"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AlertLogWithAlert } from "@/types/alert";

/**
 * 전체 알림 이력 테이블 Props
 */
interface FullAlertHistoryProps {
  /** 알림 로그 목록 (alert 정보 포함) */
  alertLogs: AlertLogWithAlert[];
}

/**
 * 전체 알림 이력 테이블 컴포넌트
 *
 * 종목명 컬럼이 포함된 전체 이력 테이블입니다.
 */
export function FullAlertHistory({ alertLogs }: FullAlertHistoryProps) {
  if (alertLogs.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-8">
        <p className="text-sm text-muted-foreground">알림 이력이 없습니다</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>종목명</TableHead>
          <TableHead className="text-right">기준가</TableHead>
          <TableHead className="text-right">발동가</TableHead>
          <TableHead className="text-right">변동률</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>발송일시</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alertLogs.map((log) => {
          const rateFormatted = `${log.changeRate >= 0 ? "+" : ""}${log.changeRate.toFixed(2)}%`;
          const stockLabel = log.alert?.stockName ?? log.alertId ?? "-";

          return (
            <TableRow key={log.id}>
              <TableCell className="text-sm font-medium">
                {log.alertId ? (
                  <Link
                    href={`/dashboard/${log.alertId}`}
                    className="text-primary hover:underline"
                  >
                    {stockLabel}
                  </Link>
                ) : (
                  stockLabel
                )}
              </TableCell>
              <TableCell className="text-right">
                {log.basePrice.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {log.triggeredPrice.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    log.changeRate > 0
                      ? "text-red-500"
                      : log.changeRate < 0
                        ? "text-blue-500"
                        : "text-muted-foreground"
                  }
                >
                  {rateFormatted}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    log.thresholdType === "upper" ? "destructive" : "default"
                  }
                >
                  {log.thresholdType === "upper" ? "상승" : "하락"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={log.emailSent ? "outline" : "secondary"}>
                  {log.emailSent ? "발송" : "미발송"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(log.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
