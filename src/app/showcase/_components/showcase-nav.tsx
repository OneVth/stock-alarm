"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";

const categories = [
  { href: "/showcase/layout", label: "Layout" },
  { href: "/showcase/navigation", label: "Navigation" },
  { href: "/showcase/forms", label: "Forms" },
  { href: "/showcase/display", label: "Display" },
  { href: "/showcase/feedback", label: "Feedback" },
  { href: "/showcase/overlay", label: "Overlay" },
];

export function ShowcaseNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/showcase" className="font-semibold whitespace-nowrap">
          UI Showcase
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {categories.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                pathname === href
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
