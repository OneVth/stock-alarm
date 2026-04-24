"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StockSearchCombobox } from "./stock-search-combobox";
import { Loader2 } from "lucide-react";
import type { AlertWithCount, StockSearchResult } from "@/types/alert";

interface AlertFormProps {
  /** 수정할 알림 (없으면 생성 모드) */
  alert?: AlertWithCount;
  /** 폼 제출 성공 시 호출 */
  onSuccess?: () => void;
}

/**
 * 알림 생성/수정 폼
 *
 * alert prop이 있으면 수정 모드, 없으면 생성 모드로 동작합니다.
 */
export function AlertForm({ alert, onSuccess }: AlertFormProps) {
  const router = useRouter();
  const isEdit = !!alert;

  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(
    alert ? { code: alert.stockCode, name: alert.stockName } : null
  );
  const [basePrice, setBasePrice] = useState(
    alert ? String(alert.basePrice) : ""
  );
  const [thresholdUpper, setThresholdUpper] = useState(
    alert?.thresholdUpper != null ? String(alert.thresholdUpper) : ""
  );
  const [thresholdLower, setThresholdLower] = useState(
    alert?.thresholdLower != null ? String(Math.abs(alert.thresholdLower)) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isEdit) return;
    if (!selectedStock) {
      setBasePrice("");
      setPriceLoading(false);
      setPriceError(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPriceLoading(true);
    setPriceError(false);
    setBasePrice("");

    fetch(`/api/stocks/${selectedStock.code}/price`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("price fetch failed");
        const data = await res.json();
        if (controller.signal.aborted) return;
        setBasePrice(String(Math.round(data.price)));
        setPriceLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPriceError(true);
        setPriceLoading(false);
      });

    return () => controller.abort();
  }, [selectedStock, isEdit, retryKey]);

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!selectedStock) {
      newErrors.stock = "종목을 선택해주세요";
    }

    const price = parseInt(basePrice, 10);
    if (!basePrice || isNaN(price) || price < 1) {
      newErrors.basePrice = "기준가는 1원 이상이어야 합니다";
    }

    const upper = thresholdUpper ? parseFloat(thresholdUpper) : null;
    const lower = thresholdLower ? parseFloat(thresholdLower) : null;

    if (upper != null && (upper < 0.1 || upper > 100)) {
      newErrors.thresholdUpper = "0.1 ~ 100 사이의 값을 입력해주세요";
    }
    if (lower != null && (lower < 0.1 || lower > 100)) {
      newErrors.thresholdLower = "0.1 ~ 100 사이의 값을 입력해주세요";
    }
    if (!upper && !lower) {
      newErrors.thresholdUpper = "상승 또는 하락 임계값 중 하나는 필수입니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const upper = thresholdUpper ? parseFloat(thresholdUpper) : null;
    const lower = thresholdLower ? -Math.abs(parseFloat(thresholdLower)) : null;

    const body = {
      stockCode: selectedStock!.code,
      stockName: selectedStock!.name,
      basePrice: parseInt(basePrice, 10),
      thresholdUpper: upper,
      thresholdLower: lower,
    };

    try {
      const url = isEdit ? `/api/alerts/${alert.id}` : "/api/alerts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "오류가 발생했습니다");
        return;
      }

      toast.success(isEdit ? "알림이 수정되었습니다" : "알림이 등록되었습니다");
      router.refresh();
      onSuccess?.();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="stock">종목</Label>
        <StockSearchCombobox
          value={selectedStock}
          onSelect={setSelectedStock}
          disabled={isEdit}
        />
        {errors.stock && (
          <p className="text-xs text-destructive">{errors.stock}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="basePrice">기준가 (원)</Label>
        {isEdit ? (
          <Input
            id="basePrice"
            type="number"
            min={1}
            placeholder="예: 70000"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        ) : (
          <div className="relative">
            <Input
              id="basePrice"
              type="text"
              disabled
              placeholder={!selectedStock ? "종목을 먼저 선택해주세요" : ""}
              value={basePrice ? Number(basePrice).toLocaleString() : ""}
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {priceLoading && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground"
                aria-label="현재가 조회 중"
              />
            )}
          </div>
        )}
        {!isEdit && priceError && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-destructive">현재가 조회에 실패했습니다</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRetryKey((k) => k + 1)}
            >
              다시 시도
            </Button>
          </div>
        )}
        {!isEdit && selectedStock && !priceLoading && !priceError && basePrice && (
          <p className="text-xs text-muted-foreground">현재가 기준으로 등록됩니다</p>
        )}
        {errors.basePrice && (
          <p className="text-xs text-destructive">{errors.basePrice}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="thresholdUpper">상승 임계값 (%)</Label>
          <Input
            id="thresholdUpper"
            type="number"
            step="0.1"
            min={0.1}
            max={100}
            placeholder="예: 5"
            value={thresholdUpper}
            onChange={(e) => setThresholdUpper(e.target.value)}
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {errors.thresholdUpper && (
            <p className="text-xs text-destructive">{errors.thresholdUpper}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="thresholdLower">하락 임계값 (%)</Label>
          <Input
            id="thresholdLower"
            type="number"
            step="0.1"
            min={0.1}
            max={100}
            placeholder="예: 3"
            value={thresholdLower}
            onChange={(e) => setThresholdLower(e.target.value)}
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {errors.thresholdLower && (
            <p className="text-xs text-destructive">{errors.thresholdLower}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting || (!isEdit && (priceLoading || priceError))}
        className="w-full"
      >
        {submitting
          ? isEdit
            ? "수정 중..."
            : "등록 중..."
          : isEdit
            ? "알림 수정"
            : "알림 등록"}
      </Button>
    </form>
  );
}
