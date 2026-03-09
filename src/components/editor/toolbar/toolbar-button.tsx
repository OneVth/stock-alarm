"use client";

import type { ReactNode } from "react";
import { Toggle } from "@/components/ui/toggle";

/** ToolbarButton Props */
interface ToolbarButtonProps {
  /** 버튼 아이콘 */
  children: ReactNode;
  /** 활성 상태 여부 */
  pressed: boolean;
  /** 상태 변경 시 호출 */
  onPressedChange: () => void;
  /** 접근성 라벨 */
  "aria-label": string;
  /** 비활성 여부 */
  disabled?: boolean;
}

/**
 * 에디터 툴바 버튼 컴포넌트
 *
 * @param props - 버튼 속성
 */
export function ToolbarButton({
  children,
  pressed,
  onPressedChange,
  disabled,
  ...props
}: ToolbarButtonProps) {
  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      {...props}
    >
      {children}
    </Toggle>
  );
}
