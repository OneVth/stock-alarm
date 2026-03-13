import type { Alert, AlertLog } from "@/generated/prisma/client";

/**
 * Alert with alertLogs count
 */
export type AlertWithCount = Alert & {
  _count: {
    alertLogs: number;
  };
};

/**
 * 알림 폼 입력 데이터
 */
export interface AlertFormData {
  stockCode: string;
  stockName: string;
  basePrice: number;
  thresholdUpper?: number | null;
  thresholdLower?: number | null;
  memo?: unknown;
}

/**
 * 종목 검색 결과
 */
/**
 * AlertLog with related Alert info (stockName, stockCode)
 */
export type AlertLogWithAlert = AlertLog & {
  alert: Pick<Alert, "stockName" | "stockCode"> | null;
};

/**
 * 종목 검색 결과
 */
export interface StockSearchResult {
  code: string;
  name: string;
}

/**
 * 대시보드 통계
 */
export interface DashboardStats {
  total: number;
  active: number;
  triggered: number;
  inactive: number;
}

/**
 * 알림 필터 탭 통계
 */
export interface AlertFilterStats {
  total: number;
  active: number;
  inactive: number;
}
