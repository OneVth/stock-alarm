"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { AlertLog } from "@/generated/prisma/client";

/**
 * 알림 이력 섹션 Props
 */
interface AlertHistorySectionProps {
  /** 알림 ID */
  alertId: string;
  /** 전체 이력 건수 */
  totalCount: number;
  /** 초기 이력 목록 (서버에서 전달, 최대 5건) */
  initialLogs: AlertLog[];
}

const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

const formatDateTime = (iso: string | Date) =>
  new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * 알림 이력 섹션 컴포넌트
 *
 * 기본 접힘 상태로 시작하며, 펼치면 최근 5건을 보여줍니다.
 * 더보기 버튼으로 5건씩 추가 로드합니다.
 */
export function AlertHistorySection({
  alertId,
  totalCount,
  initialLogs,
}: AlertHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [logs, setLogs] = useState<AlertLog[]>(initialLogs);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/alerts/${alertId}/history?skip=${logs.length}&take=5`,
      );
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [...prev, ...(data.logs as AlertLog[])]);
      }
    } catch {
      // 오류는 조용히 처리
    } finally {
      setLoadingMore(false);
    }
  }, [alertId, logs.length]);

  return (
    <div className="border-t pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between py-1 hover:opacity-70">
          <p className="font-medium">알림 이력 ({totalCount}건)</p>
          {isOpen ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">알림 이력이 없습니다</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">일시</th>
                        <th className="py-2 pr-4 font-medium">기준가</th>
                        <th className="py-2 pr-4 font-medium">발동가</th>
                        <th className="py-2 pr-4 font-medium">변동률</th>
                        <th className="py-2 pr-4 font-medium">유형</th>
                        <th className="py-2 font-medium">이메일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 text-muted-foreground">
                            {formatDateTime(log.createdAt)}
                          </td>
                          <td className="py-2 pr-4">{formatPrice(log.basePrice)}</td>
                          <td className="py-2 pr-4">
                            {formatPrice(log.triggeredPrice)}
                          </td>
                          <td
                            className={cn(
                              "py-2 pr-4 font-medium",
                              log.changeRate > 0 ? "text-price-up" : "text-price-down",
                            )}
                          >
                            {log.changeRate > 0 ? "+" : ""}
                            {log.changeRate.toFixed(2)}%
                          </td>
                          <td className="py-2 pr-4">
                            <Badge
                              variant={
                                log.thresholdType === "upper"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {log.thresholdType === "upper" ? "상승" : "하락"}
                            </Badge>
                          </td>
                          <td className="py-2">
                            <Badge
                              variant={log.emailSent ? "outline" : "secondary"}
                            >
                              {log.emailSent ? "발송" : "미발송"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {logs.length < totalCount && (
                  <div className="mt-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? "로딩 중..."
                        : `더보기 (${totalCount - logs.length}건 더)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
