"use client";

import type { Alert, AlertLog } from "@/generated/prisma/client";
import { DetailHeader } from "@/components/stock/detail-header";
import { StockPriceHero } from "@/components/stock/stock-price-hero";
import { ChartSection } from "@/components/stock/chart-section";
import { AlertHistorySection } from "@/components/stock/alert-history-section";
import { MemoSection } from "@/components/stock/memo-section";

/**
 * 종목 상세 클라이언트 컴포넌트 Props
 */
interface StockDetailClientProps {
  /** 알림 데이터 */
  alert: Alert;
  /** 초기 알림 로그 목록 (최대 5건) */
  alertLogs: AlertLog[];
  /** 전체 알림 로그 건수 */
  alertLogCount: number;
}

/**
 * 종목 상세 페이지 클라이언트 컴포넌트
 *
 * 레이아웃 셸 역할만 담당하며 각 섹션 컴포넌트를 조합합니다.
 */
export function StockDetailClient({
  alert,
  alertLogs,
  alertLogCount,
}: StockDetailClientProps) {
  const alertLogMarkers = alertLogs.map((log) => ({
    date: new Date(log.createdAt).toISOString().split("T")[0],
    triggeredPrice: log.triggeredPrice,
    thresholdType: log.thresholdType,
  }));

  return (
    <div className="flex flex-col gap-6">
      <DetailHeader alert={alert} />
      <StockPriceHero alert={alert} />
      <div className="mt-2">
        <ChartSection alert={alert} alertLogs={alertLogMarkers} />
      </div>
      <AlertHistorySection
        alertId={alert.id}
        totalCount={alertLogCount}
        initialLogs={alertLogs}
      />
      <MemoSection alert={alert} />
    </div>
  );
}
