import { describe, it, expect } from "vitest";
import { checkAlertTrigger } from "@/lib/alert-trigger";

describe("checkAlertTrigger", () => {
  // 상승 도달
  describe("상승 도달", () => {
    it("현재가가 상승 임계값 이상이면 upper 트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 10, thresholdLower: -10 },
        110_000
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("upper");
      expect(result.changeRate).toBeCloseTo(10);
    });

    it("현재가가 상승 임계값을 초과해도 upper 트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 10, thresholdLower: -10 },
        120_000
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("upper");
      expect(result.changeRate).toBeCloseTo(20);
    });
  });

  // 하락 도달
  describe("하락 도달", () => {
    it("현재가가 하락 임계값 이하이면 lower 트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 10, thresholdLower: -10 },
        90_000
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("lower");
      expect(result.changeRate).toBeCloseTo(-10);
    });

    it("현재가가 하락 임계값 미만이어도 lower 트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 10, thresholdLower: -10 },
        80_000
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("lower");
      expect(result.changeRate).toBeCloseTo(-20);
    });
  });

  // 미도달
  describe("미도달", () => {
    it("현재가가 임계값 범위 내이면 미트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 10, thresholdLower: -10 },
        105_000
      );
      expect(result.triggered).toBe(false);
      expect(result.type).toBeNull();
      expect(result.changeRate).toBeCloseTo(5);
    });

    it("현재가가 기준가와 동일하면 미트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 10, thresholdLower: -10 },
        100_000
      );
      expect(result.triggered).toBe(false);
      expect(result.type).toBeNull();
      expect(result.changeRate).toBe(0);
    });
  });

  // 엣지 케이스
  describe("엣지 케이스", () => {
    it("정확히 상승 임계값에 도달하면 upper 트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 50_000, thresholdUpper: 5, thresholdLower: -3 },
        52_500
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("upper");
      expect(result.changeRate).toBeCloseTo(5);
    });

    it("정확히 하락 임계값에 도달하면 lower 트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 50_000, thresholdUpper: 5, thresholdLower: -3 },
        48_500
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("lower");
      expect(result.changeRate).toBeCloseTo(-3);
    });

    it("둘 다 도달 시 upper 우선", () => {
      // thresholdUpper: 0, thresholdLower: 0 → 어떤 변동이든 둘 다 도달
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 0, thresholdLower: 0 },
        100_000
      );
      expect(result.triggered).toBe(true);
      expect(result.type).toBe("upper");
    });

    it("basePrice가 0이면 미트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 0, thresholdUpper: 10, thresholdLower: -10 },
        50_000
      );
      expect(result.triggered).toBe(false);
      expect(result.type).toBeNull();
      expect(result.changeRate).toBe(0);
    });

    it("thresholdUpper만 설정 (thresholdLower: null)", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: 5, thresholdLower: null },
        90_000
      );
      expect(result.triggered).toBe(false);
      expect(result.type).toBeNull();
      expect(result.changeRate).toBeCloseTo(-10);
    });

    it("thresholdLower만 설정 (thresholdUpper: null)", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: null, thresholdLower: -5 },
        110_000
      );
      expect(result.triggered).toBe(false);
      expect(result.type).toBeNull();
      expect(result.changeRate).toBeCloseTo(10);
    });

    it("둘 다 null이면 항상 미트리거", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: null, thresholdLower: null },
        200_000
      );
      expect(result.triggered).toBe(false);
      expect(result.type).toBeNull();
    });
  });

  // changeRate 계산 정확성
  describe("changeRate 계산 정확성", () => {
    it("양수 변동률을 정확히 계산한다", () => {
      const result = checkAlertTrigger(
        { basePrice: 80_000, thresholdUpper: 50, thresholdLower: null },
        100_000
      );
      expect(result.changeRate).toBeCloseTo(25);
    });

    it("음수 변동률을 정확히 계산한다", () => {
      const result = checkAlertTrigger(
        { basePrice: 100_000, thresholdUpper: null, thresholdLower: -50 },
        75_000
      );
      expect(result.changeRate).toBeCloseTo(-25);
    });

    it("소수점 변동률을 정확히 계산한다", () => {
      const result = checkAlertTrigger(
        { basePrice: 72_300, thresholdUpper: null, thresholdLower: null },
        73_100
      );
      // ((73100 - 72300) / 72300) * 100 ≈ 1.1070...
      expect(result.changeRate).toBeCloseTo(1.107, 2);
    });
  });
});
