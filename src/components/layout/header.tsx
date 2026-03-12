"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";

/**
 * 앱 공통 헤더 컴포넌트
 *
 * 로고/타이틀과 ThemeSwitcher를 포함하며,
 * 추후 네비게이션, 사용자 메뉴 등으로 확장 가능합니다.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <span className="text-lg font-semibold">Stock Alarm</span>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
