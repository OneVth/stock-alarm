"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { ArrowLeftIcon, SaveIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TiptapEditor } from "@/components/editor";
import { PriceChart } from "@/components/stock/price-chart";
import { AlertHistory } from "@/components/stock/alert-history";
import type { Alert, AlertLog } from "@/generated/prisma/client";
import type { OHLCVData } from "@/types/stock";

/**
 * 종목 상세 클라이언트 컴포넌트 Props
 */
interface StockDetailClientProps {
  /** 알림 데이터 */
  alert: Alert;
  /** 알림 로그 목록 */
  alertLogs: AlertLog[];
}

/**
 * 종목 상세 페이지 클라이언트 컴포넌트
 *
 * 차트, 알림 이력, 메모 편집 기능을 제공합니다.
 */
export function StockDetailClient({
  alert,
  alertLogs,
}: StockDetailClientProps) {
  const router = useRouter();
  const [ohlcvData, setOhlcvData] = useState<OHLCVData[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [memo, setMemo] = useState<JSONContent | undefined>(
    alert.memo ? (alert.memo as JSONContent) : undefined
  );
  const [saving, setSaving] = useState(false);

  // OHLCV 데이터 로드
  useEffect(() => {
    async function fetchOHLCV() {
      try {
        const res = await fetch(`/api/stocks/${alert.stockCode}/ohlcv?days=90`);
        if (res.ok) {
          const data: OHLCVData[] = await res.json();
          setOhlcvData(data);
        }
      } catch {
        // 차트 데이터 로드 실패는 조용히 처리
      } finally {
        setChartLoading(false);
      }
    }
    fetchOHLCV();
  }, [alert.stockCode]);

  // 알림 로그를 차트 마커 형식으로 변환
  const alertLogMarkers = alertLogs.map((log) => ({
    date: new Date(log.createdAt).toISOString().split("T")[0],
    triggeredPrice: log.triggeredPrice,
    thresholdType: log.thresholdType,
  }));

  // 메모 저장
  const handleSaveMemo = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "메모 저장에 실패했습니다");
        return;
      }

      toast.success("메모가 저장되었습니다");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  }, [alert.id, memo, router]);

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard" />}>
          <ArrowLeftIcon />
          <span className="sr-only">뒤로가기</span>
        </Button>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold">{alert.stockName}</h1>
            <p className="text-sm text-muted-foreground">{alert.stockCode}</p>
          </div>
          <StatusBadge status={alert.status} />
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="flex flex-wrap gap-4 rounded-lg border p-4">
        <InfoItem label="기준가" value={`${alert.basePrice.toLocaleString()}원`} />
        {alert.thresholdUpper != null && (
          <InfoItem label="상승 도달" value={`+${alert.thresholdUpper}%`} />
        )}
        {alert.thresholdLower != null && (
          <InfoItem label="하락 도달" value={`${-Math.abs(alert.thresholdLower)}%`} />
        )}
        <InfoItem
          label="등록일"
          value={new Date(alert.createdAt).toLocaleDateString("ko-KR")}
        />
      </div>

      {/* 차트 섹션 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">가격 차트</h2>
        {chartLoading ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <PriceChart
            ohlcvData={ohlcvData}
            basePrice={alert.basePrice}
            thresholdUpper={alert.thresholdUpper}
            thresholdLower={alert.thresholdLower}
            alertLogs={alertLogMarkers}
          />
        )}
      </section>

      {/* 알림 이력 섹션 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          알림 이력
          {alertLogs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({alertLogs.length}건)
            </span>
          )}
        </h2>
        <AlertHistory alertLogs={alertLogs} />
      </section>

      {/* 메모 섹션 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">메모</h2>
          <Button size="sm" onClick={handleSaveMemo} disabled={saving}>
            {saving ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4" />
            )}
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
        <TiptapEditor
          content={memo}
          onChange={setMemo}
          placeholder="메모를 작성해보세요..."
        />
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="default">활성</Badge>;
    case "triggered":
      return <Badge variant="destructive">트리거</Badge>;
    case "inactive":
      return <Badge variant="secondary">비활성</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
