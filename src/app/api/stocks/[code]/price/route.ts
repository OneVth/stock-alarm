import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stockCodeSchema } from "@/lib/validations";
import { getCurrentPrice, StockServiceError } from "@/services/stock";

/**
 * GET /api/stocks/:code/price
 *
 * 단일 종목의 현재가를 조회합니다.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const parsed = stockCodeSchema.safeParse({ code });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  try {
    const price = await getCurrentPrice(parsed.data.code);
    return NextResponse.json(price);
  } catch (error) {
    if (error instanceof StockServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "주가 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
