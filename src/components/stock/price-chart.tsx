"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  LineSeries,
  CandlestickSeries,
  LineStyle,
  createSeriesMarkers,
} from "lightweight-charts";
import type { OHLCVData } from "@/types/stock";

/**
 * 알림 로그 마커 데이터
 */
interface AlertLogMarker {
  /** 발동 날짜 ("2026-03-13") */
  date: string;
  /** 발동 가격 */
  triggeredPrice: number;
  /** 도달 유형 ("upper" | "lower") */
  thresholdType: string;
}

/**
 * 가격 차트 Props
 */
interface PriceChartProps {
  /** OHLCV 차트 데이터 */
  ohlcvData: OHLCVData[];
  /** 기준가 */
  basePrice: number;
  /** 상승 도달 임계값 (%) */
  thresholdUpper?: number | null;
  /** 하락 도달 임계값 (%) */
  thresholdLower?: number | null;
  /** 알림 로그 마커 */
  alertLogs?: AlertLogMarker[];
  /** 차트 유형 ("line" | "candle") */
  chartType?: "line" | "candle";
  /** 차트 높이 (px) */
  height?: number;
}

/**
 * Lightweight Charts 기반 가격 차트 컴포넌트
 *
 * 종가 라인 또는 캔들스틱, 기준가 수평선, 도달선, 알림 마커를 표시합니다.
 */
export function PriceChart({
  ohlcvData,
  basePrice,
  thresholdUpper,
  thresholdLower,
  alertLogs,
  chartType = "line",
  height = 400,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | ISeriesApi<"Candlestick"> | null>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!containerRef.current || ohlcvData.length === 0) return;

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: isDark ? "#a1a1aa" : "#71717a",
      },
      grid: {
        vertLines: { color: isDark ? "#27272a" : "#f4f4f5" },
        horzLines: { color: isDark ? "#27272a" : "#f4f4f5" },
      },
      rightPriceScale: {
        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
      },
      timeScale: {
        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
        timeVisible: false,
      },
      crosshair: {
        horzLine: {
          color: isDark ? "#52525b" : "#d4d4d8",
        },
        vertLine: {
          color: isDark ? "#52525b" : "#d4d4d8",
        },
      },
    });

    chartRef.current = chart;

    let mainSeries: ISeriesApi<"Line"> | ISeriesApi<"Candlestick">;

    if (chartType === "candle") {
      // 캔들스틱 시리즈
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#ef4444",
        downColor: "#3b82f6",
        borderUpColor: "#ef4444",
        borderDownColor: "#3b82f6",
        wickUpColor: "#ef4444",
        wickDownColor: "#3b82f6",
      });

      const candleData = ohlcvData.map((d) => ({
        time: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candleSeries.setData(candleData as Parameters<typeof candleSeries.setData>[0]);
      mainSeries = candleSeries;
    } else {
      // 종가 라인 시리즈
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        priceLineVisible: false,
      });

      const lineData = ohlcvData.map((d) => ({
        time: d.date,
        value: d.close,
      }));

      lineSeries.setData(lineData as Parameters<typeof lineSeries.setData>[0]);
      mainSeries = lineSeries;
    }

    seriesRef.current = mainSeries;

    // 기준가 수평선
    mainSeries.createPriceLine({
      price: basePrice,
      color: "#6366f1",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "기준가",
    });

    // 상승 도달선
    if (thresholdUpper != null && thresholdUpper > 0) {
      const upperPrice = Math.round(basePrice * (1 + thresholdUpper / 100));
      mainSeries.createPriceLine({
        price: upperPrice,
        color: "#ef4444",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: `+${thresholdUpper}%`,
      });
    }

    // 하락 도달선
    if (thresholdLower != null) {
      const absLower = Math.abs(thresholdLower);
      const lowerPrice = Math.round(basePrice * (1 - absLower / 100));
      mainSeries.createPriceLine({
        price: lowerPrice,
        color: "#3b82f6",
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: `-${absLower}%`,
      });
    }

    // 알림 마커
    if (alertLogs && alertLogs.length > 0) {
      const markers = alertLogs
        .filter((log) => {
          const firstDate = ohlcvData[0]?.date;
          const lastDate = ohlcvData[ohlcvData.length - 1]?.date;
          return firstDate && lastDate && log.date >= firstDate && log.date <= lastDate;
        })
        .map((log) => ({
          time: log.date,
          position: log.thresholdType === "upper" ? "belowBar" as const : "aboveBar" as const,
          shape: log.thresholdType === "upper" ? "arrowUp" as const : "arrowDown" as const,
          color: log.thresholdType === "upper" ? "#ef4444" : "#22c55e",
          size: 1,
          text: "",
        }))
        .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

      if (markers.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createSeriesMarkers(mainSeries, markers as any);
      }
    }

    chart.timeScale().fitContent();

    // 반응형 너비 대응
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [ohlcvData, basePrice, thresholdUpper, thresholdLower, alertLogs, isDark, chartType, height]);

  if (ohlcvData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">차트 데이터가 없습니다</p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
