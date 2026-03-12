import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stockSearchSchema } from "@/lib/validations";
import type { StockSearchResult } from "@/types/alert";
import krxStocks from "@/data/krx-stocks.json";

const stocks: StockSearchResult[] = krxStocks;

/**
 * GET /api/stocks/search?q=삼성
 *
 * 정적 KRX 종목 목록에서 종목 코드/이름으로 검색합니다.
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
  const results = stocks
    .filter(
      (stock) =>
        stock.code.startsWith(query) ||
        stock.name.toLowerCase().includes(query)
    )
    .slice(0, 10);

  return NextResponse.json(results);
}
