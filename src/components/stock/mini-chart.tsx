"use client";

const PADDING = 4;

/**
 * MiniChart Props
 */
interface MiniChartProps {
  /** 종가 배열 (시간순) */
  data: number[];
  /** SVG 너비 (px, 기본값: 80) */
  width?: number;
  /** SVG 높이 (px, 기본값: 40) */
  height?: number;
}

/**
 * SVG Area 스파크라인 미니차트 컴포넌트
 *
 * 외부 라이브러리 없이 순수 SVG로 구현합니다.
 * 상승 → success 색상, 하락 → destructive 색상, 동일 → muted 색상으로 표시합니다.
 *
 * @param data - 종가 배열 (최소 2개 이상의 유효값 필요)
 * @param width - SVG 너비
 * @param height - SVG 높이
 */
export function MiniChart({ data, width = 80, height = 40 }: MiniChartProps) {
  const valid = data.filter((v) => Number.isFinite(v) && v > 0);

  if (valid.length < 2) {
    return <div className="h-10 w-20 shrink-0 rounded bg-muted" />;
  }

  const n = valid.length;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min;

  const x = (i: number) => (i / (n - 1)) * width;
  const y = (v: number) =>
    range === 0
      ? height / 2
      : PADDING + (1 - (v - min) / range) * (height - 2 * PADDING);

  const first = valid[0];
  const last = valid[n - 1];

  let strokeClass: string;
  let fillClass: string;
  if (last > first) {
    strokeClass = "stroke-success";
    fillClass = "fill-success/15";
  } else if (last < first) {
    strokeClass = "stroke-destructive";
    fillClass = "fill-destructive/15";
  } else {
    strokeClass = "stroke-muted-foreground";
    fillClass = "fill-muted-foreground/10";
  }

  const points = valid.map((v, i) => `${x(i)},${y(v)}`).join(" L ");
  const linePath = `M ${points}`;
  const areaPath = `M ${x(0)},${height} L ${points} L ${x(n - 1)},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden="true"
    >
      <path d={areaPath} className={fillClass} strokeWidth={0} />
      <path d={linePath} className={strokeClass} fill="none" strokeWidth={1.5} />
    </svg>
  );
}
