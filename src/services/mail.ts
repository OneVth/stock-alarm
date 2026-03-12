import nodemailer from "nodemailer";
import type { MarketIndex } from "@/types/stock";

/**
 * 알림 이메일 파라미터
 */
export interface AlertEmailParams {
  /** 수신자 이메일 */
  to: string;
  /** 종목명 */
  stockName: string;
  /** 종목 코드 */
  stockCode: string;
  /** 기준가 */
  basePrice: number;
  /** 현재가 */
  currentPrice: number;
  /** 변동률 (%) */
  changeRate: number;
  /** 트리거 유형 */
  thresholdType: "upper" | "lower";
  /** KOSPI 지수 */
  kospiIndex?: MarketIndex;
  /** KOSDAQ 지수 */
  kosdaqIndex?: MarketIndex;
  /** LLM 코멘트 */
  llmComment?: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * nodemailer 트랜스포터를 생성합니다.
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env["GMAIL_ADDRESS"],
      pass: process.env["GMAIL_APP_PASSWORD"],
    },
  });
}

/**
 * 숫자를 KRW 형식으로 포맷합니다.
 */
function formatKRW(value: number): string {
  return value.toLocaleString("ko-KR");
}

/**
 * 시장 지수 HTML 행을 생성합니다.
 */
function renderMarketIndexRow(index: MarketIndex): string {
  const sign = index.change >= 0 ? "+" : "";
  const color = index.change >= 0 ? "#e74c3c" : "#3498db";
  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">${index.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">
        ${formatKRW(index.price)}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:${color};">
        ${sign}${index.change.toFixed(2)} (${sign}${index.changeRate.toFixed(2)}%)
      </td>
    </tr>
  `;
}

/**
 * 알림 이메일 HTML 본문을 생성합니다.
 */
function buildEmailHTML(params: AlertEmailParams): string {
  const {
    stockName,
    stockCode,
    basePrice,
    currentPrice,
    changeRate,
    thresholdType,
    kospiIndex,
    kosdaqIndex,
    llmComment,
  } = params;

  const direction = thresholdType === "upper" ? "상승" : "하락";
  const sign = changeRate >= 0 ? "+" : "";
  const changeColor = changeRate >= 0 ? "#e74c3c" : "#3498db";

  const marketIndexRows = [kospiIndex, kosdaqIndex]
    .filter((idx): idx is MarketIndex => idx !== undefined)
    .map(renderMarketIndexRow)
    .join("");

  const marketSection = marketIndexRows
    ? `
    <h3 style="margin:24px 0 12px;color:#333;font-size:16px;">시장 지수</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f8f9fa;">
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #dee2e6;">지수</th>
          <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #dee2e6;">현재</th>
          <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #dee2e6;">변동</th>
        </tr>
      </thead>
      <tbody>${marketIndexRows}</tbody>
    </table>
  `
    : "";

  const commentSection = llmComment
    ? `
    <div style="margin:24px 0;padding:16px;background:#f8f9fa;border-left:4px solid #6c757d;border-radius:4px;">
      <p style="margin:0;color:#495057;font-size:14px;line-height:1.6;">${llmComment}</p>
    </div>
  `
    : "";

  return `
    <div style="max-width:600px;margin:0 auto;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
      <div style="background:#1a1a2e;padding:20px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:20px;">StockAlarm</h1>
        <p style="margin:4px 0 0;color:#a0a0b0;font-size:13px;">${direction} 알림</p>
      </div>

      <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="margin:0 0 16px;color:#333;font-size:18px;">
          ${stockName} (${stockCode})
        </h2>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">기준가</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">
              ${formatKRW(basePrice)}원
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">현재가</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">
              ${formatKRW(currentPrice)}원
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">변동률</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:${changeColor};">
              ${sign}${changeRate.toFixed(2)}%
            </td>
          </tr>
        </table>

        ${marketSection}
        ${commentSection}

        <p style="margin:24px 0 0;color:#999;font-size:12px;text-align:center;">
          이 메일은 StockAlarm에서 자동 발송되었습니다.
        </p>
      </div>
    </div>
  `;
}

/**
 * 인증 관련 에러인지 확인합니다.
 */
function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("invalid login") || msg.includes("authentication");
  }
  return false;
}

/**
 * 알림 이메일을 발송합니다.
 *
 * Gmail SMTP (SSL, port 465)를 사용하며, 실패 시 최대 3회 재시도합니다.
 * 인증 오류 시에는 재시도하지 않습니다.
 *
 * @param params - 이메일 파라미터
 * @returns 발송 성공 여부
 *
 * @example
 * ```ts
 * const sent = await sendAlertEmail({
 *   to: "user@example.com",
 *   stockName: "삼성전자",
 *   stockCode: "005930",
 *   basePrice: 50000,
 *   currentPrice: 53000,
 *   changeRate: 6.0,
 *   thresholdType: "upper",
 * });
 * ```
 */
export async function sendAlertEmail(
  params: AlertEmailParams
): Promise<boolean> {
  const transporter = createTransporter();
  const direction = params.thresholdType === "upper" ? "상승" : "하락";
  const subject = `[StockAlarm] ${params.stockName}(${params.stockCode}) ${direction} 알림`;
  const html = buildEmailHTML(params);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await transporter.sendMail({
        from: `"StockAlarm" <${process.env["GMAIL_ADDRESS"]}>`,
        to: params.to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      // 인증 오류 시 재시도하지 않음
      if (isAuthError(error)) {
        console.error("[mail] 인증 오류, 재시도하지 않음:", error);
        return false;
      }

      if (attempt < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[mail] 발송 실패 (${attempt}/${MAX_RETRIES}), ${delayMs}ms 후 재시도...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(
          `[mail] 최종 발송 실패 (${MAX_RETRIES}회 시도):`,
          error
        );
        return false;
      }
    }
  }

  return false;
}
