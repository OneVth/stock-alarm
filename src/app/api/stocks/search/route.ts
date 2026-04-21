import { NextResponse } from "next/server";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { auth } from "@/lib/auth";
import { stockSearchSchema } from "@/lib/validations";
import type { StockSearchResult } from "@/types/alert";

const KRX_STOCKS_PATH = join(process.cwd(), "src", "data", "krx-stocks.json");
const CACHE_TTL_MS = 5 * 60 * 1000;

interface StocksCache {
  stocks: StockSearchResult[];
  mtimeMs: number;
  checkedAt: number;
}

let cache: StocksCache | null = null;

/**
 * KRX 종목 목록을 파일시스템에서 읽어 반환한다.
 *
 * 캐시 정책:
 * - 5분 TTL: checkedAt 기준 5분 경과 시에만 mtime 재확인
 * - mtime 변경 감지: 파일이 갱신되었을 때만 재파싱 (readFileSync + JSON.parse)
 * - 갱신 없으면 stat만 하고 기존 캐시 유지
 *
 * @returns 종목 배열
 */
function loadStocks(): StockSearchResult[] {
  const now = Date.now();

  if (cache && now - cache.checkedAt < CACHE_TTL_MS) {
    return cache.stocks;
  }

  const stat = statSync(KRX_STOCKS_PATH);

  if (cache && cache.mtimeMs === stat.mtimeMs) {
    cache.checkedAt = now;
    return cache.stocks;
  }

  const raw = readFileSync(KRX_STOCKS_PATH, "utf-8");
  const stocks: StockSearchResult[] = JSON.parse(raw);

  cache = {
    stocks,
    mtimeMs: stat.mtimeMs,
    checkedAt: now,
  };

  return stocks;
}

/**
 * GET /api/stocks/search?q=삼성
 *
 * KRX 종목 목록에서 종목 코드/이름으로 검색합니다.
 * 최대 10건 반환.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = stockSearchSchema.safeParse({ q: searchParams.get("q") });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  const query = parsed.data.q.toLowerCase();
  const stocks = loadStocks();
  const results = stocks
    .filter(
      (stock) =>
        stock.code.startsWith(query) ||
        stock.name.toLowerCase().includes(query)
    )
    .slice(0, 10);

  return NextResponse.json(results);
}
