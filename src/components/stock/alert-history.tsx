"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AlertLog } from "@/generated/prisma/client";

/**
 * 알림 이력 테이블 Props
 */
interface AlertHistoryProps {
  /** 알림 로그 목록 (createdAt DESC) */
  alertLogs: AlertLog[];
}

/**
 * 알림 이력 테이블 컴포넌트
 *
 * 알림 발동 이력을 테이블로 표시합니다.
 */
export function AlertHistory({ alertLogs }: AlertHistoryProps) {
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
          <TableHead>일시</TableHead>
          <TableHead className="text-right">기준가</TableHead>
          <TableHead className="text-right">발동가</TableHead>
          <TableHead className="text-right">변동률</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>이메일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alertLogs.map((log) => {
          const rateFormatted = `${log.changeRate >= 0 ? "+" : ""}${log.changeRate.toFixed(2)}%`;
          return (
            <TableRow key={log.id}>
              <TableCell className="text-sm">
                {new Date(log.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
                    log.thresholdType === "upper" ? "default" : "destructive"
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
