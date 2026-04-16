import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentAlertLogsTableProps {
  /** 최근 알림 발송 로그 목록 */
  logs: {
    id: string;
    changeRate: number;
    thresholdType: string;
    emailSent: boolean;
    createdAt: string;
    alert: {
      stockName: string;
      stockCode: string;
    } | null;
  }[];
}

/**
 * 최근 알림 발송 테이블
 *
 * 최근 발동된 알림 5건을 종목, 변동률, 유형, 이메일 발송 여부, 일시 컬럼으로 표시합니다.
 */
export function RecentAlertLogsTable({ logs }: RecentAlertLogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>종목</TableHead>
            <TableHead className="text-right">변동률</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                알림 발송 이력이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {log.alert
                    ? `${log.alert.stockName} (${log.alert.stockCode})`
                    : "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right text-sm font-medium",
                    log.changeRate > 0
                      ? "text-price-up"
                      : log.changeRate < 0
                        ? "text-price-down"
                        : "text-muted-foreground",
                  )}
                >
                  <span className="inline-flex items-center justify-end gap-0.5">
                    {log.changeRate > 0 ? (
                      <TrendingUpIcon className="size-3" />
                    ) : log.changeRate < 0 ? (
                      <TrendingDownIcon className="size-3" />
                    ) : (
                      <MinusIcon className="size-3" />
                    )}
                    {log.changeRate > 0 ? "+" : ""}
                    {log.changeRate.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={log.thresholdType === "upper" ? "default" : "destructive"}>
                    {log.thresholdType === "upper" ? "상승" : "하락"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={log.emailSent ? "outline" : "secondary"}>
                    {log.emailSent ? "발송" : "미발송"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
