"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alert } from "@/generated/prisma/client";
import type { StockPrice } from "@/types/stock";

/**
 * 종목 현재가 Hero Props
 */
interface StockPriceHeroProps {
  /** 알림 데이터 */
  alert: Alert;
}

const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

const inputCls =
  "w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/**
 * 로딩 중 스켈레톤
 */
function StockPriceHeroSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

/**
 * 종목 현재가 Hero 컴포넌트
 *
 * 현재가/변동률, 기준가, 임계값 표시 및 인라인 편집 기능을 제공합니다.
 */
export function StockPriceHero({ alert }: StockPriceHeroProps) {
  const router = useRouter();
  const [priceData, setPriceData] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 편집 입력값
  const [basePriceVal, setBasePriceVal] = useState(String(alert.basePrice));
  const [upperVal, setUpperVal] = useState(
    alert.thresholdUpper != null ? String(alert.thresholdUpper) : "",
  );
  const [lowerVal, setLowerVal] = useState(
    alert.thresholdLower != null ? String(Math.abs(alert.thresholdLower)) : "",
  );

  // 현재가 조회
  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(`/api/stocks/${alert.stockCode}/price`);
        if (res.ok) {
          const data: StockPrice = await res.json();
          setPriceData(data);
        }
      } catch {
        // 가격 로드 실패는 조용히 처리
      } finally {
        setLoading(false);
      }
    }
    fetchPrice();
  }, [alert.stockCode]);

  // 편집 취소 — 원래 값 복원
  const handleCancel = useCallback(() => {
    setBasePriceVal(String(alert.basePrice));
    setUpperVal(alert.thresholdUpper != null ? String(alert.thresholdUpper) : "");
    setLowerVal(
      alert.thresholdLower != null ? String(Math.abs(alert.thresholdLower)) : "",
    );
    setIsEditing(false);
  }, [alert.basePrice, alert.thresholdUpper, alert.thresholdLower]);

  // 저장
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        basePrice: Number(basePriceVal),
      };
      if (upperVal !== "") body.thresholdUpper = Number(upperVal);
      if (lowerVal !== "") body.thresholdLower = -Math.abs(Number(lowerVal));

      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "저장에 실패했습니다");
        return;
      }

      toast.success("알림 설정이 저장되었습니다");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  }, [alert.id, basePriceVal, upperVal, lowerVal, router]);

  if (loading) {
    return <StockPriceHeroSkeleton />;
  }

  const isPositive = priceData ? priceData.changeRate > 0 : false;
  const changeSign = isPositive ? "+" : "";

  // 도달가 계산
  const upperPrice =
    alert.thresholdUpper != null
      ? Math.round(alert.basePrice * (1 + alert.thresholdUpper / 100))
      : null;
  const lowerPrice =
    alert.thresholdLower != null
      ? Math.round(alert.basePrice * (1 + alert.thresholdLower / 100))
      : null;

  return (
    <div>
      {/* 현재가 + 변동률 */}
      {priceData ? (
        <>
          <p className="text-3xl font-bold">{formatPrice(priceData.price)}</p>
          <p
            className={`mt-1 text-base font-medium ${
              isPositive ? "text-success" : "text-destructive"
            }`}
          >
            {changeSign}
            {priceData.changeRate.toFixed(2)}% ({changeSign}
            {formatPrice(priceData.change)})
          </p>
        </>
      ) : (
        <p className="text-3xl font-bold text-muted-foreground">--</p>
      )}

      {isEditing ? (
        /* 편집 모드 */
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <label className="w-20 shrink-0 text-sm text-muted-foreground">
              기준가 (원)
            </label>
            <Input
              type="number"
              value={basePriceVal}
              onChange={(e) => setBasePriceVal(e.target.value)}
              className={inputCls}
            />
          </div>
          {alert.thresholdUpper != null && (
            <div className="flex items-center gap-3">
              <label className="w-20 shrink-0 text-sm text-muted-foreground">
                상승 (%)
              </label>
              <Input
                type="number"
                value={upperVal}
                onChange={(e) => setUpperVal(e.target.value)}
                className={inputCls}
              />
            </div>
          )}
          {alert.thresholdLower != null && (
            <div className="flex items-center gap-3">
              <label className="w-20 shrink-0 text-sm text-muted-foreground">
                하락 (%)
              </label>
              <Input
                type="number"
                value={lowerVal}
                onChange={(e) => setLowerVal(e.target.value)}
                className={inputCls}
              />
            </div>
          )}
          <div className="mt-2 flex items-center gap-3">
            <div className="w-20 shrink-0" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                취소
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* 읽기 모드 */
        <>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              기준 {formatPrice(alert.basePrice)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </Button>
          </div>
          {(alert.thresholdUpper != null || alert.thresholdLower != null) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              {alert.thresholdUpper != null && upperPrice != null && (
                <span className="text-sm">
                  <span className="font-medium text-success">
                    상승 +{alert.thresholdUpper}%
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({formatPrice(upperPrice)})
                  </span>
                </span>
              )}
              {alert.thresholdUpper != null && alert.thresholdLower != null && (
                <span className="text-sm text-muted-foreground">·</span>
              )}
              {alert.thresholdLower != null && lowerPrice != null && (
                <span className="text-sm">
                  <span className="font-medium text-destructive">
                    하락 -{Math.abs(alert.thresholdLower)}%
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({formatPrice(lowerPrice)})
                  </span>
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
