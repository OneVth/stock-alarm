import { describe, it, expect } from "vitest";
import { parseNaverNumber } from "@/services/stock";

describe("parseNaverNumber", () => {
  // 1. 콤마 포함 정수
  it("콤마 포함 정수를 파싱한다", () => {
    expect(parseNaverNumber("1,234")).toBe(1234);
  });

  // 2. 콤마 포함 소수
  it("콤마 포함 소수를 파싱한다", () => {
    expect(parseNaverNumber("56,789.12")).toBe(56789.12);
  });

  // 3. 콤마 없는 정수
  it("콤마 없는 정수를 파싱한다", () => {
    expect(parseNaverNumber("100")).toBe(100);
  });

  // 4. 빈 문자열 → 0
  it("빈 문자열은 0을 반환한다", () => {
    expect(parseNaverNumber("")).toBe(0);
  });

  // 5. 큰 숫자 (억 단위)
  it("큰 숫자를 파싱한다", () => {
    expect(parseNaverNumber("1,234,567,890")).toBe(1234567890);
  });

  // 6. 음수
  it("음수를 파싱한다", () => {
    expect(parseNaverNumber("-1,200")).toBe(-1200);
  });

  // 7. 소수점만 있는 문자열
  it("소수점만 있는 문자열을 파싱한다", () => {
    expect(parseNaverNumber("0.75")).toBe(0.75);
  });

  // 8. null → 0 (방어적 처리)
  it("null이 전달되면 0을 반환한다", () => {
    expect(parseNaverNumber(null as unknown as string)).toBe(0);
  });

  // 9. undefined → 0 (방어적 처리)
  it("undefined가 전달되면 0을 반환한다", () => {
    expect(parseNaverNumber(undefined as unknown as string)).toBe(0);
  });

  // 10. 숫자 타입이 전달되면 그대로 반환
  it("숫자 타입이 전달되면 그대로 반환한다", () => {
    expect(parseNaverNumber(72300 as unknown as string)).toBe(72300);
  });

  // 11. 숫자가 아닌 문자열 → 0
  it("숫자가 아닌 문자열은 0을 반환한다", () => {
    expect(parseNaverNumber("abc")).toBe(0);
  });
});
