"use client";

import * as React from "react";
import {
  Bell,
  CreditCard,
  LogOut,
  Mail,
  MoreHorizontal,
  Pencil,
  Settings,
  Trash2,
  User,
  ExternalLink,
} from "lucide-react";
import { ComponentSection } from "../../_components/component-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function CoinbaseOverlayShowcase() {
  return (
    <div className="space-y-12">
      <div>
        <p className="cb-caption text-muted-foreground">Overlay & Popup</p>
        <h1 className="cb-section mt-1">오버레이 & 팝업</h1>
        <p className="cb-body mt-2 text-muted-foreground">7 components</p>
      </div>

      <ComponentSection
        title="Dialog"
        description="모달 다이얼로그 — 알림 등록"
      >
        <Dialog>
          <DialogTrigger render={<Button className="!rounded-[56px] cb-btn-label" />}>
            알림 등록
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="cb-body-sm font-semibold">새 알림 등록</DialogTitle>
              <DialogDescription className="cb-caption">
                모니터링할 종목과 임계값을 설정하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cb-stock-code" className="cb-caption">종목 코드</Label>
                <Input id="cb-stock-code" placeholder="예: 005930" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cb-base-price" className="cb-caption">기준가 (원)</Label>
                <Input id="cb-base-price" type="number" placeholder="예: 70000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cb-upper" className="cb-caption">상승 임계값 (%)</Label>
                  <Input id="cb-upper" type="number" placeholder="예: 10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cb-lower" className="cb-caption">하락 임계값 (%)</Label>
                  <Input id="cb-lower" type="number" placeholder="예: 10" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="!rounded-[56px]">취소</Button>
              <Button className="!rounded-[56px]">등록</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ComponentSection>

      <ComponentSection
        title="Sheet"
        description="사이드 패널 — 설정 패널"
      >
        <div className="flex flex-wrap gap-3">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="!rounded-[56px]" />}>
              오른쪽 패널
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="cb-body-sm font-semibold">알림 설정</SheetTitle>
                <SheetDescription className="cb-caption">
                  알림 방식과 임계값을 설정합니다.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label className="cb-caption">이메일 주소</Label>
                  <Input placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <Label className="cb-caption">기본 임계값</Label>
                  <Input type="number" defaultValue={5} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="!rounded-[56px]" />}>
              왼쪽 패널
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="cb-body-sm font-semibold">Stock Alarm</SheetTitle>
                <SheetDescription className="cb-caption">메뉴</SheetDescription>
              </SheetHeader>
              <nav className="mt-6 space-y-1">
                {["대시보드", "알림 이력", "설정"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[8px] px-3 py-2 cb-body-sm hover:bg-accent cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Popover"
        description="팝오버 — 추가 정보 표시"
      >
        <Popover>
          <PopoverTrigger render={<Button variant="outline" className="!rounded-[56px]" />}>
            종목 정보
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-3">
              <div>
                <p className="cb-body-sm font-semibold">삼성전자</p>
                <p className="cb-caption text-muted-foreground">005930 · KOSPI</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="cb-caption text-muted-foreground">현재가</p>
                  <p className="cb-body-sm font-semibold">77,200</p>
                </div>
                <div>
                  <p className="cb-caption text-muted-foreground">등락률</p>
                  <p className="cb-body-sm font-semibold" style={{ color: "#00b167" }}>
                    +1.58%
                  </p>
                </div>
                <div>
                  <p className="cb-caption text-muted-foreground">기준가</p>
                  <p className="cb-body-sm font-semibold">70,000</p>
                </div>
                <div>
                  <p className="cb-caption text-muted-foreground">임계값</p>
                  <p className="cb-body-sm font-semibold">±5%</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </ComponentSection>

      <ComponentSection
        title="Tooltip"
        description="툴팁 — 아이콘 버튼 설명"
      >
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon" className="!rounded-full" />}>
                <Bell className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>알림 목록</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon" className="!rounded-full" />}>
                <Settings className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>설정</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon" className="!rounded-full" />}>
                <Mail className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>이메일 알림 설정</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon" className="!rounded-full" />}>
                <ExternalLink className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom">새 탭에서 열기</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </ComponentSection>

      <ComponentSection
        title="Dropdown Menu"
        description="드롭다운 메뉴 — 액션 메뉴"
      >
        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="!rounded-[56px]" />}>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              알림 메뉴
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="cb-caption">삼성전자 (005930)</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                알림 수정
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                알림 비활성화
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                알림 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="!rounded-[56px]" />}>
              <User className="mr-2 h-4 w-4" />
              계정
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="cb-caption">내 계정</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                프로필
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                플랜 관리
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Context Menu"
        description="우클릭 컨텍스트 메뉴"
      >
        <ContextMenu>
          <ContextMenuTrigger
            className="flex h-24 w-full items-center justify-center rounded-[16px] cb-body text-muted-foreground cursor-default select-none"
            style={{ border: "1px dashed rgba(91,97,110,0.4)" }}
          >
            여기를 우클릭하세요
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              알림 수정
            </ContextMenuItem>
            <ContextMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              알림 비활성화
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              알림 삭제
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ComponentSection>

      <ComponentSection
        title="Hover Card"
        description="호버 카드 — 호버 시 상세 정보 표시"
      >
        <div className="flex flex-wrap gap-4">
          {[
            { name: "삼성전자", code: "005930", price: "77,200", change: "+1.58%", up: true, alerts: 2 },
            { name: "SK하이닉스", code: "000660", price: "182,000", change: "-1.89%", up: false, alerts: 1 },
          ].map((item) => (
            <HoverCard key={item.code}>
              <HoverCardTrigger
                render={
                  <Button
                    variant="link"
                    className="p-0 h-auto cb-body font-semibold"
                    style={{ color: "#0052ff" }}
                  />
                }
              >
                {item.name}
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="cb-body-sm font-semibold">{item.name}</p>
                      <p className="cb-caption text-muted-foreground">
                        {item.code} · KOSPI
                      </p>
                    </div>
                    <Badge
                      style={
                        item.up
                          ? { backgroundColor: "rgba(0,82,255,0.1)", color: "#0052ff", border: "none" }
                          : { backgroundColor: "rgba(209,53,32,0.1)", color: "#d13520", border: "none" }
                      }
                    >
                      {item.up ? "상승" : "하락"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="cb-caption text-muted-foreground">현재가</p>
                      <p className="cb-body-sm font-semibold">{item.price}</p>
                    </div>
                    <div>
                      <p className="cb-caption text-muted-foreground">등락률</p>
                      <p
                        className="cb-body-sm font-semibold"
                        style={{ color: item.up ? "#00b167" : "#d13520" }}
                      >
                        {item.change}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-3 w-3 text-muted-foreground" />
                    <p className="cb-caption text-muted-foreground">
                      활성 알림 {item.alerts}개
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </ComponentSection>
    </div>
  );
}
