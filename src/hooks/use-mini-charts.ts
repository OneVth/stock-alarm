"use client";

import { useState, useEffect, useCallback } from "react";

/** 종목 코드 → 종가 배열 맵 */
export type MiniChartMap = Record<string, number[]>;

/**
 * 여러 종목의 미니차트 데이터(종가 배열)를 배치로 조회하는 훅
 *
 * @param codes - 종목 코드 배열
 * @param days - 조회 일수 (기본값: 30)
 * @returns 차트 데이터 맵, 로딩 상태, 에러 메시지
 *
 * @example
 * ```tsx
 * const { charts, isLoading } = useMiniCharts(["005930", "035720"]);
 * // charts["005930"] → [72300, 72500, ...]
 * ```
 */
export function useMiniCharts(codes: string[], days = 30) {
  const [charts, setCharts] = useState<MiniChartMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codesKey = codes.slice().sort().join(",");

  const fetchCharts = useCallback(async () => {
    if (codes.length === 0) {
      setCharts({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stocks/mini-charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes, days }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "차트 데이터 조회에 실패했습니다");
        return;
      }

      const data: { data: MiniChartMap; errors: { code: string; message: string }[] } =
        await res.json();

      setCharts(data.data);
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [codesKey, days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  return { charts, isLoading, error };
}
