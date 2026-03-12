"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockPrice, StockPriceMap } from "@/types/stock";

/**
 * 여러 종목의 현재가를 배치로 조회하는 훅
 *
 * @param codes - 종목 코드 배열
 * @returns 가격 맵, 로딩 상태, 에러 메시지
 *
 * @example
 * ```tsx
 * const { prices, isLoading, error } = useStockPrices(["005930", "035720"]);
 * // prices["005930"]?.price → 72300
 * ```
 */
export function useStockPrices(codes: string[]) {
  const [prices, setPrices] = useState<StockPriceMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codesKey = codes.slice().sort().join(",");

  const fetchPrices = useCallback(async () => {
    if (codes.length === 0) {
      setPrices({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stocks/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "가격 조회에 실패했습니다");
        return;
      }

      const data: { prices: StockPrice[]; errors: { code: string; message: string }[] } =
        await res.json();

      const priceMap: StockPriceMap = {};
      for (const price of data.prices) {
        priceMap[price.code] = price;
      }
      setPrices(priceMap);
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [codesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, isLoading, error };
}
