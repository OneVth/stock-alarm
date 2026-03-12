"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ProfileDropdown } from "./profile-dropdown";

/** 인증 영역 네비게이션 링크 */
const navLinks = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/history", label: "알림 이력" },
] as const;

/**
 * 인증된 사용자용 앱 헤더
 *
 * 로고, 네비게이션, 프로필 드롭다운, 테마 스위처를 포함합니다.
 */
export function AuthHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <Link
          href="/dashboard"
          className="text-lg font-semibold whitespace-nowrap"
        >
          Stock Alarm
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
                pathname.startsWith(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
