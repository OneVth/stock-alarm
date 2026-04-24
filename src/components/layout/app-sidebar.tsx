"use client";

import * as React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LayoutDashboardIcon,
  HistoryIcon,
  ShieldIcon,
  LogOutIcon,
  BellIcon,
  ChevronsUpDownIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  SunMoonIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

/** 기본 네비게이션 항목 */
const baseNavItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboardIcon },
  { href: "/history", label: "알림 이력", icon: HistoryIcon },
  { href: "/settings", label: "설정", icon: SettingsIcon },
];

/** 관리자 네비게이션 항목 */
const adminNavItems = [
  { href: "/admin", label: "관리자", icon: ShieldIcon },
];

/**
 * 앱 사이드바
 *
 * 네비게이션, 관리자 메뉴, 유저 프로필을 포함합니다.
 * admin 역할 시 "관리" 그룹을 추가로 표시합니다.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state, toggleSidebar } = useSidebar();

  const router = useRouter();
  const isAdmin = session?.user?.roles?.includes("admin");
  const user = session?.user;
  const isExpanded = state === "expanded";

  const initials = useMemo(
    () => (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase(),
    [user?.name, user?.email]
  );

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1">
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="Stock Alarm"
              className="flex-1"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BellIcon className="size-4" />
              </div>
              <span className="text-base font-semibold">Stock Alarm</span>
            </SidebarMenuButton>
            {isExpanded && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                className="hidden shrink-0 md:inline-flex"
              >
                <PanelLeftCloseIcon className="size-4" />
                <span className="sr-only">사이드바 접기</span>
              </Button>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        {!isExpanded && (
          <div className="hidden justify-center md:flex">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleSidebar}
                  />
                }
              >
                <PanelLeftOpenIcon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right">펼치기</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarMenu>
            {baseNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  tooltip={item.label}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>관리</SidebarGroupLabel>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    tooltip={item.label}
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                    }
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" />}
              >
                <Avatar size="sm">
                  {user?.image && (
                    <AvatarImage src={user.image} alt={user.name ?? ""} />
                  )}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {user?.name && (
                    <span className="truncate font-medium">{user.name}</span>
                  )}
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <SettingsIcon />
                    설정
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <ThemeSubMenu />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => signOut({ redirectTo: "/login" })}
                  >
                    <LogOutIcon />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/** 모드 선택지 */
const modeItems = [
  { value: "light", label: "라이트", icon: SunIcon },
  { value: "dark", label: "다크", icon: MoonIcon },
  { value: "system", label: "시스템", icon: MonitorIcon },
] as const;

/**
 * 테마 서브메뉴
 *
 * 모드(라이트/다크/시스템) 라디오 선택을 표시합니다.
 */
function ThemeSubMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // hydration 전에는 중립 아이콘(SunMoonIcon) 표시 → flash 방지
  const TriggerIcon = !mounted
    ? SunMoonIcon
    : theme === "light"
      ? SunIcon
      : theme === "dark"
        ? MoonIcon
        : theme === "system"
          ? MonitorIcon
          : SunMoonIcon;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <TriggerIcon />
        테마
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>모드</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as string)}
          >
            {modeItems.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
