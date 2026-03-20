import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { batchMiniChartSchema } from "@/lib/validations";
import { getOHLCV, StockServiceError } from "@/services/stock";

const BATCH_CONCURRENCY = 5;
const BATCH_DELAY_MS = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/stocks/mini-charts
 *
 * 여러 종목의 종가 배열을 배치로 조회합니다.
 * 대시보드 알림 카드의 미니차트에 사용됩니다.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = batchMiniChartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청" },
      { status: 400 }
    );
  }

  const { codes, days } = parsed.data;
  const data: Record<string, number[]> = {};
  const errors: { code: string; message: string }[] = [];

  for (let i = 0; i < codes.length; i += BATCH_CONCURRENCY) {
    const chunk = codes.slice(i, i + BATCH_CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map((code) => getOHLCV(code, days))
    );

    results.forEach((result, idx) => {
      const code = chunk[idx];
      if (result.status === "fulfilled") {
        data[code] = result.value.map((d) => d.close);
      } else {
        data[code] = [];
        errors.push({
          code,
          message:
            result.reason instanceof Error
              ? result.reason.message
              : "알 수 없는 오류",
        });
      }
    });

    if (i + BATCH_CONCURRENCY < codes.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return NextResponse.json({ data, errors });
}
