import type { StockPrice, MarketIndex, OHLCVData } from "@/types/stock";

const NAVER_STOCK_API = "https://m.stock.naver.com/api";
const NAVER_FCHART_API = "https://fchart.stock.naver.com/sise.nhn";
const FETCH_TIMEOUT = 5000;
const BATCH_CONCURRENCY = 5;
const BATCH_DELAY_MS = 100;
const CACHE_TTL_MS = 60_000;

/**
 * 현재가 인메모리 캐시 (TTL: 60초)
 */
const priceCache = new Map<string, { data: StockPrice; expiresAt: number }>();

/**
 * 지정된 시간만큼 대기합니다.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 주식 서비스 전용 에러 클래스
 */
export class StockServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "StockServiceError";
  }
}

/**
 * 네이버 API 숫자 문자열을 파싱합니다.
 *
 * @param str - 콤마가 포함된 숫자 문자열 (예: "72,300")
 * @returns 파싱된 숫자
 */
export function parseNaverNumber(str: string): number {
  if (typeof str !== "string") return Number(str) || 0;
  return Number(str.replace(/,/g, "")) || 0;
}

/**
 * 네이버 API 공통 fetch 함수 (타임아웃, User-Agent 포함)
 *
 * @param url - 요청 URL
 * @returns 파싱된 JSON 응답
 */
async function naverFetch<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new StockServiceError(
        `네이버 API 응답 오류: ${res.status}`,
        "NAVER_API_ERROR",
        res.status
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof StockServiceError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new StockServiceError(
        "네이버 API 요청 타임아웃",
        "TIMEOUT",
        408
      );
    }
    throw new StockServiceError(
      "네이버 API 요청 실패",
      "FETCH_ERROR",
      500
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 네이버 API 기본 응답 타입 (현재가 조회)
 */
interface NaverStockBasic {
  stockName?: string;
  closePrice?: string;
  compareToPreviousClosePrice?: string;
  fluctuationsRatio?: string;
}

/**
 * 단일 종목의 현재가를 조회합니다.
 *
 * @param code - 종목 코드 (6자리)
 * @returns 현재가 정보
 *
 * @example
 * ```ts
 * const price = await getCurrentPrice("005930");
 * // { code: "005930", name: "삼성전자", price: 72300, change: -200, changeRate: -0.28 }
 * ```
 */
export async function getCurrentPrice(code: string): Promise<StockPrice> {
  const cached = priceCache.get(code);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await naverFetch<NaverStockBasic>(
    `${NAVER_STOCK_API}/stock/${code}/basic`
  );

  if (!data.closePrice) {
    throw new StockServiceError(
      `종목 ${code}의 가격 정보를 찾을 수 없습니다`,
      "NOT_FOUND",
      404
    );
  }

  const result: StockPrice = {
    code,
    name: data.stockName ?? code,
    price: parseNaverNumber(data.closePrice),
    change: parseNaverNumber(data.compareToPreviousClosePrice ?? "0"),
    changeRate: parseFloat(data.fluctuationsRatio ?? "0") || 0,
  };

  priceCache.set(code, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

  return result;
}

/**
 * 여러 종목의 현재가를 배치로 조회합니다.
 *
 * @param codes - 종목 코드 배열
 * @returns 성공한 가격 정보와 실패한 에러 목록
 *
 * @example
 * ```ts
 * const { prices, errors } = await getBatchPrices(["005930", "035720"]);
 * ```
 */
export async function getBatchPrices(codes: string[]): Promise<{
  prices: StockPrice[];
  errors: { code: string; message: string }[];
}> {
  const prices: StockPrice[] = [];
  const errors: { code: string; message: string }[] = [];

  // BATCH_CONCURRENCY개씩 청크로 나누어 순차 실행
  for (let i = 0; i < codes.length; i += BATCH_CONCURRENCY) {
    const chunk = codes.slice(i, i + BATCH_CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map((code) => getCurrentPrice(code))
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        prices.push(result.value);
      } else {
        errors.push({
          code: chunk[idx],
          message:
            result.reason instanceof Error
              ? result.reason.message
              : "알 수 없는 오류",
        });
      }
    });

    // 마지막 청크가 아니면 딜레이
    if (i + BATCH_CONCURRENCY < codes.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return { prices, errors };
}

/**
 * 네이버 API 시장 지수 응답 타입
 */
interface NaverIndexBasic {
  closePrice?: string;
  compareToPreviousPrice?: { price?: string };
  fluctuationsRatio?: string;
}

/**
 * 시장 지수를 조회합니다.
 *
 * @param market - 시장 코드 ("KOSPI" | "KOSDAQ")
 * @returns 시장 지수 정보
 */
export async function getMarketIndex(market: string): Promise<MarketIndex> {
  const data = await naverFetch<NaverIndexBasic>(
    `${NAVER_STOCK_API}/index/${market}/basic`
  );

  return {
    name: market,
    price: parseNaverNumber(data.closePrice ?? "0"),
    change: parseNaverNumber(data.compareToPreviousPrice?.price ?? "0"),
    changeRate: parseFloat(data.fluctuationsRatio ?? "0") || 0,
  };
}

/**
 * 종목의 OHLCV 차트 데이터를 조회합니다.
 *
 * fchart.stock.naver.com XML API를 사용합니다.
 * 응답 형식: `<item data="20260313|72300|73000|71500|72800|15000000" />`
 * 필드 순서: date|open|high|low|close|volume
 *
 * @param code - 종목 코드 (6자리)
 * @param days - 조회 일수 (기본값: 90)
 * @returns OHLCV 데이터 배열
 */
export async function getOHLCV(
  code: string,
  days: number = 90
): Promise<OHLCVData[]> {
  const url = `${NAVER_FCHART_API}?symbol=${code}&timeframe=day&count=${days}&requestType=0`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  let text: string;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new StockServiceError(
        `네이버 차트 API 응답 오류: ${res.status}`,
        "NAVER_API_ERROR",
        res.status
      );
    }

    text = await res.text();
  } catch (error) {
    if (error instanceof StockServiceError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new StockServiceError("네이버 차트 API 요청 타임아웃", "TIMEOUT", 408);
    }
    throw new StockServiceError("네이버 차트 API 요청 실패", "FETCH_ERROR", 500);
  } finally {
    clearTimeout(timeout);
  }

  // XML에서 item data 속성 파싱
  const itemRegex = /<item\s+data="([^"]+)"\s*\/>/g;
  const results: OHLCVData[] = [];
  let match;

  while ((match = itemRegex.exec(text)) !== null) {
    const parts = match[1].split("|");
    if (parts.length < 6) continue;

    const [dateStr, open, high, low, close, volume] = parts;
    results.push({
      date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
      open: Number(open) || 0,
      high: Number(high) || 0,
      low: Number(low) || 0,
      close: Number(close) || 0,
      volume: Number(volume) || 0,
    });
  }

  if (results.length === 0) {
    throw new StockServiceError(
      `종목 ${code}의 차트 데이터를 찾을 수 없습니다`,
      "NOT_FOUND",
      404
    );
  }

  return results;
}
