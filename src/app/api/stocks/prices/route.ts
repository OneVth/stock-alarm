import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { batchPriceSchema } from "@/lib/validations";
import { getBatchPrices, StockServiceError } from "@/services/stock";

/**
 * POST /api/stocks/prices
 *
 * 여러 종목의 현재가를 배치로 조회합니다.
 * 대시보드에서 한 번의 요청으로 모든 종목 가격을 조회합니다.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = batchPriceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  try {
    const result = await getBatchPrices(parsed.data.codes);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StockServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "배치 가격 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
