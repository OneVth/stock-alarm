import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * 앱 공통 헤더 컴포넌트
 *
 * 로고/타이틀과 로그인 버튼(또는 주입된 슬롯)을 포함하며,
 * 추후 네비게이션, 사용자 메뉴 등으로 확장 가능합니다.
 */
interface HeaderProps {
  /**
   * 로그인 버튼 영역에 주입할 커스텀 요소.
   * 제공되지 않으면 `/login` 링크 버튼이 기본 렌더됩니다.
   */
  loginSlot?: ReactNode;
}

export function Header({ loginSlot }: HeaderProps = {}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <span className="text-lg font-semibold">Stock Alarm</span>
        <div className="ms-auto">
          {loginSlot ?? (
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
