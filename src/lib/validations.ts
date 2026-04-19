import { z } from "zod";

/**
 * 알림 생성 스키마
 *
 * thresholdUpper/Lower 중 최소 하나는 필수입니다.
 */
export const createAlertSchema = z
  .object({
    stockCode: z.string().min(1, "종목 코드를 입력해주세요"),
    stockName: z.string().min(1, "종목명을 입력해주세요"),
    basePrice: z.number().int().min(1, "기준가는 1원 이상이어야 합니다"),
    thresholdUpper: z
      .number()
      .min(0.1, "상승 임계값은 0.1% 이상이어야 합니다")
      .max(100, "상승 임계값은 100% 이하여야 합니다")
      .nullable()
      .optional(),
    thresholdLower: z
      .number()
      .min(-100, "하락 임계값은 -100% 이상이어야 합니다")
      .max(-0.1, "하락 임계값은 -0.1% 이하여야 합니다")
      .nullable()
      .optional(),
    memo: z
      .unknown()
      .refine(
        (val) => val == null || (typeof val === "object" && !Array.isArray(val)),
        { message: "메모는 객체 형태여야 합니다" }
      )
      .refine(
        (val) => val == null || JSON.stringify(val).length <= 10_000,
        { message: "메모 크기는 10KB를 초과할 수 없습니다" }
      )
      .optional(),
  })
  .refine(
    (data) =>
      (data.thresholdUpper != null && data.thresholdUpper !== 0) ||
      (data.thresholdLower != null && data.thresholdLower !== 0),
    {
      message: "상승 또는 하락 임계값 중 하나는 반드시 입력해야 합니다",
      path: ["thresholdUpper"],
    }
  );

/**
 * 알림 수정 스키마
 */
export const updateAlertSchema = z
  .object({
    stockCode: z.string().min(1).optional(),
    stockName: z.string().min(1).optional(),
    basePrice: z.number().int().min(1).optional(),
    thresholdUpper: z.number().min(0.1).max(100).nullable().optional(),
    thresholdLower: z.number().min(-100).max(-0.1).nullable().optional(),
    memo: z
      .unknown()
      .refine(
        (val) => val == null || (typeof val === "object" && !Array.isArray(val)),
        { message: "메모는 객체 형태여야 합니다" }
      )
      .refine(
        (val) => val == null || JSON.stringify(val).length <= 10_000,
        { message: "메모 크기는 10KB를 초과할 수 없습니다" }
      )
      .optional(),
  })
  .refine(
    (data) => {
      // 둘 다 제공되지 않으면 기존 값 유지이므로 통과
      if (data.thresholdUpper === undefined && data.thresholdLower === undefined)
        return true;
      // 둘 다 null이면 실패
      if (data.thresholdUpper === null && data.thresholdLower === null)
        return false;
      return true;
    },
    {
      message: "상승 또는 하락 임계값 중 하나는 반드시 입력해야 합니다",
      path: ["thresholdUpper"],
    }
  );

/**
 * 종목 검색 쿼리 스키마
 */
export const stockSearchSchema = z.object({
  q: z.string().min(1, "검색어를 입력해주세요").max(20, "검색어가 너무 깁니다"),
});

/**
 * 종목 코드 스키마 (6자리 숫자)
 */
export const stockCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "유효한 종목 코드가 아닙니다"),
});

/**
 * OHLCV 조회 쿼리 스키마
 */
export const ohlcvQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
});

/**
 * 배치 가격 조회 스키마
 */
export const batchPriceSchema = z.object({
  codes: z.array(z.string().regex(/^\d{6}$/)).min(1).max(50),
});

/**
 * 배치 미니차트 조회 스키마
 */
export const batchMiniChartSchema = z.object({
  codes: z.array(z.string().regex(/^\d{6}$/)).min(1).max(50),
  days: z.coerce.number().int().min(5).max(90).default(30),
});

/**
 * 역할 변경 스키마
 */
export const changeRoleSchema = z.object({
  action: z.enum(["grant", "revoke"], {
    message: "action은 grant 또는 revoke여야 합니다",
  }),
});

/**
 * 시스템 로그 필터 스키마
 */
export const logFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  level: z.enum(["ERROR", "WARN", "INFO"]).optional(),
  category: z.string().optional(),
});
