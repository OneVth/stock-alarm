import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stockCodeSchema, ohlcvQuerySchema } from "@/lib/validations";
import { getOHLCV, StockServiceError } from "@/services/stock";

/**
 * GET /api/stocks/:code/ohlcv?days=90
 *
 * 종목의 OHLCV 차트 데이터를 조회합니다.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const codeParsed = stockCodeSchema.safeParse({ code });
  if (!codeParsed.success) {
    return NextResponse.json(
      { error: codeParsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const queryParsed = ohlcvQuerySchema.safeParse({
    days: searchParams.get("days") ?? undefined,
  });
  if (!queryParsed.success) {
    return NextResponse.json(
      { error: queryParsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  try {
    const ohlcv = await getOHLCV(codeParsed.data.code, queryParsed.data.days);
    return NextResponse.json(ohlcv);
  } catch (error) {
    if (error instanceof StockServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "차트 데이터 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
