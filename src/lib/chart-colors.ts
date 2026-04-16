/**
 * CSS 커스텀 프로퍼티 값을 HEX 문자열로 읽어오는 헬퍼.
 * Lightweight Charts는 CSS 변수를 직접 받지 못하므로,
 * 런타임에 computed style에서 실제 값을 추출한다.
 *
 * SSR 안전: window가 있을 때만 호출되어야 하므로 useEffect 내부에서 사용할 것.
 *
 * @param name - CSS 커스텀 프로퍼티 이름 (예: "--price-up")
 * @returns HEX 색상 문자열, SSR 환경에서는 빈 문자열
 */
export function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * 가격 차트에서 사용하는 색상 토큰 묶음.
 * 다크 모드 전환 시 차트가 재생성되면 자동으로 새 값이 반영된다.
 *
 * @returns 상승/하락 색상 HEX 값
 *
 * @example
 * ```ts
 * // useEffect 내부에서만 사용할 것 (SSR 안전)
 * const priceColors = getChartPriceColors();
 * // { up: "#ef4444", down: "#0052ff" }
 * ```
 */
export function getChartPriceColors() {
  return {
    up: getCssVar("--price-up"),
    down: getCssVar("--price-down"),
  };
}
