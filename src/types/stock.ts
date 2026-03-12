/**
 * 주식 현재가 정보
 */
export interface StockPrice {
  /** 종목 코드 (6자리) */
  code: string;
  /** 종목명 */
  name: string;
  /** 현재가 (KRW) */
  price: number;
  /** 전일대비 변동액 */
  change: number;
  /** 전일대비 변동률 (%) */
  changeRate: number;
}

/**
 * 종목 코드별 현재가 맵
 */
export interface StockPriceMap {
  [code: string]: StockPrice;
}

/**
 * 시장 지수 정보
 */
export interface MarketIndex {
  /** 시장명 ("KOSPI" | "KOSDAQ") */
  name: string;
  /** 현재 지수 */
  price: number;
  /** 전일대비 변동 */
  change: number;
  /** 전일대비 변동률 (%) */
  changeRate: number;
}

/**
 * OHLCV 차트 데이터
 */
export interface OHLCVData {
  /** 날짜 ("2026-03-13") */
  date: string;
  /** 시가 */
  open: number;
  /** 고가 */
  high: number;
  /** 저가 */
  low: number;
  /** 종가 */
  close: number;
  /** 거래량 */
  volume: number;
}
