/**
 * 알림 트리거 입력 타입
 */
export interface AlertTriggerInput {
  /** 기준가 */
  basePrice: number;
  /** 상한 임계값 (%, 양수 또는 null) */
  thresholdUpper: number | null;
  /** 하한 임계값 (%, 음수 또는 null) */
  thresholdLower: number | null;
}

/**
 * 알림 트리거 결과 타입
 */
export interface AlertTriggerResult {
  /** 트리거 발생 여부 */
  triggered: boolean;
  /** 트리거 유형 ("upper" | "lower" | null) */
  type: "upper" | "lower" | null;
  /** 변동률 (%) - ((currentPrice - basePrice) / basePrice) * 100 */
  changeRate: number;
}

/**
 * 현재가가 알림 임계값에 도달했는지 확인합니다.
 *
 * Upper를 먼저 체크하며, 둘 다 도달 시 upper를 반환합니다.
 * thresholdLower는 음수로 저장됩니다 (예: -3.0).
 *
 * @param alert - 알림 트리거 입력 (기준가, 상한/하한 임계값)
 * @param currentPrice - 현재가
 * @returns 트리거 결과 (발생 여부, 유형, 변동률)
 *
 * @example
 * ```ts
 * const result = checkAlertTrigger(
 *   { basePrice: 50000, thresholdUpper: 5.0, thresholdLower: -3.0 },
 *   53000
 * );
 * // { triggered: true, type: "upper", changeRate: 6.0 }
 * ```
 */
export function checkAlertTrigger(
  alert: AlertTriggerInput,
  currentPrice: number
): AlertTriggerResult {
  if (alert.basePrice === 0) {
    return { triggered: false, type: null, changeRate: 0 };
  }

  const changeRate =
    ((currentPrice - alert.basePrice) / alert.basePrice) * 100;

  // Upper 우선 체크
  if (alert.thresholdUpper !== null && changeRate >= alert.thresholdUpper) {
    return { triggered: true, type: "upper", changeRate };
  }

  // Lower 체크 (thresholdLower는 음수, changeRate도 음수일 때 비교)
  if (alert.thresholdLower !== null && changeRate <= alert.thresholdLower) {
    return { triggered: true, type: "lower", changeRate };
  }

  return { triggered: false, type: null, changeRate };
}
