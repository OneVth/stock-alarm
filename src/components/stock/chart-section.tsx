"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceChart } from "@/components/stock/price-chart";
import type { Alert } from "@/generated/prisma/client";
import type { OHLCVData } from "@/types/stock";

/**
 * 알림 로그 마커 데이터
 */
interface AlertLogMarker {
  date: string;
  triggeredPrice: number;
  thresholdType: string;
}

/**
 * 차트 섹션 Props
 */
interface ChartSectionProps {
  /** 알림 데이터 */
  alert: Alert;
  /** 알림 로그 마커 목록 */
  alertLogs: AlertLogMarker[];
}

type Period = "30d" | "90d" | "1y";
type ChartType = "line" | "candle";

const PERIOD_DAYS: Record<Period, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

const PERIOD_LABELS: Record<Period, string> = {
  "30d": "30일",
  "90d": "90일",
  "1y": "1년",
};

/**
 * 가격 차트 섹션 컴포넌트
 *
 * 기간 탭과 차트 타입 토글을 제공하며 실제 PriceChart를 렌더링합니다.
 */
export function ChartSection({ alert, alertLogs }: ChartSectionProps) {
  const [period, setPeriod] = useState<Period>("90d");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [ohlcvData, setOhlcvData] = useState<OHLCVData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOHLCV() {
      setLoading(true);
      try {
        const days = PERIOD_DAYS[period];
        const res = await fetch(
          `/api/stocks/${alert.stockCode}/ohlcv?days=${days}`,
        );
        if (res.ok) {
          const data: OHLCVData[] = await res.json();
          setOhlcvData(data);
        }
      } catch {
        // 차트 데이터 로드 실패는 조용히 처리
      } finally {
        setLoading(false);
      }
    }
    fetchOHLCV();
  }, [alert.stockCode, period]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">가격 차트</p>
        <div className="flex flex-wrap gap-2">
          {/* 차트 타입 토글 */}
          <div className="flex rounded-md border">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none border-0"
              onClick={() => setChartType("line")}
            >
              라인
            </Button>
            <Button
              variant={chartType === "candle" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none border-0 border-l"
              onClick={() => setChartType("candle")}
            >
              캔들
            </Button>
          </div>
          {/* 기간 탭 */}
          <div className="flex rounded-md border">
            {(["30d", "90d", "1y"] as const).map((p, i) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className={`border-0 ${
                  i === 0
                    ? "rounded-r-none"
                    : i === 2
                      ? "rounded-l-none"
                      : "rounded-none border-x"
                }`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[300px] w-full md:h-[400px]" />
      ) : (
        <>
          <PriceChart
            ohlcvData={ohlcvData}
            basePrice={alert.basePrice}
            thresholdUpper={alert.thresholdUpper}
            thresholdLower={alert.thresholdLower}
            alertLogs={alertLogs}
            chartType={chartType}
          />
          {alertLogs.length > 0 && (
            <div className="mt-2 flex items-center justify-end gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ef4444]" />
                상승 알림
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]" />
                하락 알림
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
