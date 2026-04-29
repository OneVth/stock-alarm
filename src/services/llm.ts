import OpenAI from "openai";
import type { MarketIndex } from "@/types/stock";

/**
 * 알림 코멘트 생성 파라미터
 */
export interface AlertCommentParams {
  /** 종목명 */
  stockName: string;
  /** 변동률 (%) */
  changeRate: number;
  /** 트리거 유형 */
  thresholdType: "upper" | "lower";
  /** KOSPI 지수 */
  kospiIndex?: MarketIndex;
  /** KOSDAQ 지수 */
  kosdaqIndex?: MarketIndex;
}

const MAX_RETRIES = 3;
const MODEL = "gpt-5-nano";

const SYSTEM_PROMPT = `당신은 주식 알림 서비스의 코멘트 작성자입니다.
사용자가 등록한 종목의 가격이 기준가 대비 임계값에 도달했을 때, 간결한 코멘트를 작성합니다.

규칙:
- 한국어로 2문장 이내로 작성
- 투자 조언이나 매수/매도 추천을 하지 않음
- 현재 상황을 객관적으로 요약
- 시장 지수 정보가 있으면 시장 상황도 간단히 언급`;

/**
 * 기본 폴백 코멘트를 생성합니다.
 */
function getDefaultComment(params: AlertCommentParams): string {
  const sign = params.changeRate >= 0 ? "+" : "";
  return `${params.stockName}의 등록가 대비 누적 변동률이 ${sign}${params.changeRate.toFixed(2)}%에 도달했습니다.`;
}

/**
 * 인증 관련 에러인지 확인합니다.
 */
function isAuthError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
}

/**
 * LLM을 사용하여 알림 코멘트를 생성합니다.
 *
 * OpenAI API를 호출하여 종목 상황에 대한 간결한 코멘트를 생성합니다.
 * 실패 시 기본 코멘트를 반환합니다.
 *
 * @param params - 코멘트 생성 파라미터
 * @returns 생성된 코멘트 문자열
 *
 * @example
 * ```ts
 * const comment = await generateAlertComment({
 *   stockName: "삼성전자",
 *   changeRate: 6.0,
 *   thresholdType: "upper",
 * });
 * ```
 */
export async function generateAlertComment(
  params: AlertCommentParams
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

  const direction = params.thresholdType === "upper" ? "상승" : "하락";
  const sign = params.changeRate >= 0 ? "+" : "";

  let marketInfo = "";
  if (params.kospiIndex) {
    const ks = params.kospiIndex;
    const ksSign = ks.change >= 0 ? "+" : "";
    marketInfo += `KOSPI: ${ks.price.toFixed(2)} (${ksSign}${ks.changeRate.toFixed(2)}%)`;
  }
  if (params.kosdaqIndex) {
    const kq = params.kosdaqIndex;
    const kqSign = kq.change >= 0 ? "+" : "";
    if (marketInfo) marketInfo += ", ";
    marketInfo += `KOSDAQ: ${kq.price.toFixed(2)} (${kqSign}${kq.changeRate.toFixed(2)}%)`;
  }

  const userMessage = `종목: ${params.stockName}
변동률: ${sign}${params.changeRate.toFixed(2)}% (${direction})
${marketInfo ? `시장 지수: ${marketInfo}` : ""}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 1000,
        reasoning_effort: "minimal",
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (content) return content;

      return getDefaultComment(params);
    } catch (error) {
      // 인증 오류 시 즉시 폴백
      if (isAuthError(error)) {
        console.error("[llm] 인증 오류, 기본 코멘트 사용:", error);
        return getDefaultComment(params);
      }

      if (attempt < MAX_RETRIES) {
        console.warn(
          `[llm] 코멘트 생성 실패 (${attempt}/${MAX_RETRIES}), 재시도...`
        );
      } else {
        console.error(
          `[llm] 최종 코멘트 생성 실패 (${MAX_RETRIES}회 시도):`,
          error
        );
        return getDefaultComment(params);
      }
    }
  }

  return getDefaultComment(params);
}
