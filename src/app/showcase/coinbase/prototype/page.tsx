"use client";

import * as React from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Trash2,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// --- 더미 데이터 ---

const dashboardAlerts = [
  {
    id: "1",
    stockName: "삼성전자",
    stockCode: "005930",
    currentPrice: 77200,
    basePrice: 70000,
    changeRate: 10.29,
    upperThreshold: 10,
    lowerThreshold: 10,
    active: true,
  },
  {
    id: "2",
    stockName: "SK하이닉스",
    stockCode: "000660",
    currentPrice: 182000,
    basePrice: 200000,
    changeRate: -9.0,
    upperThreshold: 5,
    lowerThreshold: 10,
    active: true,
  },
  {
    id: "3",
    stockName: "NAVER",
    stockCode: "035420",
    currentPrice: 205000,
    basePrice: 200000,
    changeRate: 2.5,
    upperThreshold: 5,
    lowerThreshold: 5,
    active: false,
  },
];

const alertHistory = [
  { id: "1", stock: "삼성전자", code: "005930", basePrice: "70,000", triggerPrice: "77,200", change: "+10.29%", type: "상승", date: "2026-04-15 14:32" },
  { id: "2", stock: "SK하이닉스", code: "000660", basePrice: "200,000", triggerPrice: "182,000", change: "-9.00%", type: "하락", date: "2026-04-15 11:15" },
  { id: "3", stock: "카카오", code: "035720", basePrice: "60,000", triggerPrice: "54,000", change: "-10.00%", type: "하락", date: "2026-04-14 15:48" },
  { id: "4", stock: "NAVER", code: "035420", basePrice: "200,000", triggerPrice: "210,000", change: "+5.00%", type: "상승", date: "2026-04-13 10:02" },
  { id: "5", stock: "LG에너지솔루션", code: "373220", basePrice: "380,000", triggerPrice: "399,000", change: "+5.00%", type: "상승", date: "2026-04-12 09:30" },
];

export default function CoinbasePrototypePage() {
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [memoOpen, setMemoOpen] = React.useState(false);

  return (
    <div className="-mx-4">

      {/* ===================================================
          섹션 1 — 대시보드 알림 카드 (#ffffff, light)
      =================================================== */}
      <section className="bg-background px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <p className="cb-caption text-muted-foreground">Dashboard</p>
          <div className="mt-2 flex items-center justify-between">
            <h2 className="cb-section">알림 카드</h2>
            <Button
              size="icon"
              className="rounded-full h-9 w-9"
              style={{ backgroundColor: "#0052ff" }}
            >
              <Plus className="h-4 w-4 text-white" />
            </Button>
          </div>
          <p className="cb-body mt-2 text-muted-foreground">
            3개 알림 등록 중 · 2개 활성
          </p>

          <div className="mt-8 space-y-3">
            {dashboardAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="cb-feature">{alert.stockName}</p>
                        <Badge
                          className="cb-small"
                          style={{
                            backgroundColor: "rgba(91,97,110,0.1)",
                            color: "#5b616e",
                            border: "none",
                          }}
                        >
                          {alert.stockCode}
                        </Badge>
                        {!alert.active && (
                          <Badge
                            className="cb-small"
                            style={{
                              backgroundColor: "#eef0f3",
                              color: "#5b616e",
                              border: "none",
                            }}
                          >
                            비활성
                          </Badge>
                        )}
                      </div>
                      <p
                        className="cb-tile mt-1"
                        style={{
                          color: alert.changeRate >= 0 ? "#00b167" : "#d13520",
                        }}
                      >
                        {alert.currentPrice.toLocaleString()}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <p className="cb-caption text-muted-foreground">
                          기준가 {alert.basePrice.toLocaleString()}
                        </p>
                        <p
                          className="cb-caption"
                          style={{
                            color: alert.changeRate >= 0 ? "#00b167" : "#d13520",
                          }}
                        >
                          {alert.changeRate >= 0 ? "+" : ""}
                          {alert.changeRate.toFixed(2)}%
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="cb-caption text-muted-foreground">
                          ↑ +{alert.upperThreshold}%
                        </span>
                        <span className="cb-caption text-muted-foreground">
                          ↓ -{alert.lowerThreshold}%
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="cb-caption">
                            {alert.stockName}
                          </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 빈 상태 예시 */}
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="cb-feature">알림이 없습니다</p>
            <p className="cb-caption mt-1 text-muted-foreground">
              새 알림을 등록하면 여기에 표시됩니다.
            </p>
            <button className="cb-cta-dark cb-btn-label mt-4">알림 등록하기</button>
          </div>
        </div>
      </section>

      {/* ===================================================
          섹션 2 — 종목 상세 페이지 (#0a0b0d, dark)
      =================================================== */}
      <div className="cb-dark">
        <section className="px-4 py-16">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <h2 className="cb-tile">삼성전자</h2>
                <Badge
                  className="cb-small"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#8a8f9b",
                    border: "none",
                  }}
                >
                  005930
                </Badge>
                <Badge
                  className="cb-small"
                  style={{
                    backgroundColor: "rgba(0,82,255,0.2)",
                    color: "#578bfa",
                    border: "none",
                  }}
                >
                  KOSPI
                </Badge>
              </div>
            </div>

            {/* 현재가 — cb-display (64px/400/line-height 1.00) */}
            <div className="mt-8">
              <p className="cb-caption" style={{ color: "#8a8f9b" }}>현재가</p>
              <p className="cb-display" style={{ color: "#ffffff" }}>77,200</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="cb-tile" style={{ color: "#00b167" }}>+7,200</p>
                <Badge
                  className="cb-caption"
                  style={{
                    backgroundColor: "rgba(0,177,103,0.15)",
                    color: "#00b167",
                    border: "none",
                  }}
                >
                  +10.29%
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="cb-caption" style={{ color: "#8a8f9b" }}>기준가</p>
                  <p className="cb-body-sm font-semibold">70,000</p>
                </div>
                <div>
                  <p className="cb-caption" style={{ color: "#8a8f9b" }}>상승 임계</p>
                  <p className="cb-body-sm font-semibold" style={{ color: "#00b167" }}>+10%</p>
                </div>
                <div>
                  <p className="cb-caption" style={{ color: "#8a8f9b" }}>하락 임계</p>
                  <p className="cb-body-sm font-semibold" style={{ color: "#d13520" }}>-10%</p>
                </div>
              </div>
            </div>

            {/* 달성률 Progress */}
            <div className="mt-6 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <p className="cb-caption" style={{ color: "#8a8f9b" }}>상승 달성률</p>
                  <p className="cb-caption" style={{ color: "#0052ff" }}>100%</p>
                </div>
                <Progress value={100} className="h-1.5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <p className="cb-caption" style={{ color: "#8a8f9b" }}>하락 달성률</p>
                  <p className="cb-caption" style={{ color: "#8a8f9b" }}>0%</p>
                </div>
                <Progress value={0} className="h-1.5" />
              </div>
            </div>

            {/* 차트 placeholder — #282b31 card on #0a0b0d = color-contrast depth */}
            <div className="mt-8 rounded-[16px] bg-card h-48 flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="cb-body" style={{ color: "#8a8f9b" }}>차트 영역</p>
            </div>

            {/* 알림 이력 Collapsible */}
            <div className="mt-6 space-y-2">
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <div
                  className="flex items-center justify-between rounded-[8px] bg-card px-4 py-3"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="cb-body-sm font-semibold">알림 이력</p>
                  <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200"
                      style={{ transform: historyOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-1 space-y-1">
                    {[
                      { type: "상승", date: "2026-04-15 14:32", price: "77,200" },
                      { type: "하락", date: "2026-03-22 09:15", price: "63,000" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-[8px] bg-card px-4 py-3"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        <p className="cb-caption" style={{ color: item.type === "상승" ? "#00b167" : "#d13520" }}>
                          {item.type} 발동
                        </p>
                        <p className="cb-body-sm font-semibold">{item.price}</p>
                        <p className="cb-caption" style={{ color: "#8a8f9b" }}>{item.date}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 메모 Collapsible */}
              <Collapsible open={memoOpen} onOpenChange={setMemoOpen}>
                <div
                  className="flex items-center justify-between rounded-[8px] bg-card px-4 py-3"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p className="cb-body-sm font-semibold">메모</p>
                  <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200"
                      style={{ transform: memoOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div
                    className="mt-1 rounded-[8px] bg-card px-4 py-4"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <p className="cb-body" style={{ color: "#8a8f9b" }}>
                      HBM3E 양산 본격화 예정. 2H26 실적 개선 기대.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================
          섹션 3 — 설정 프로필 카드 (#ffffff, light)
      =================================================== */}
      <section className="bg-background px-4 py-16">
        <div className="mx-auto max-w-md">
          <p className="cb-caption text-muted-foreground">Settings</p>
          <h2 className="cb-section mt-1">프로필 설정</h2>

          <Card className="mt-8">
            <CardContent className="px-6 py-6">
              {/* Avatar + 기본 정보 */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback
                    className="text-xl"
                    style={{ backgroundColor: "#0052ff", color: "#ffffff" }}
                  >
                    홍
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="cb-feature">홍길동</p>
                  <p className="cb-caption text-muted-foreground">hong@gmail.com</p>
                  <p className="cb-caption mt-1" style={{ color: "#0052ff" }}>
                    Google 계정 연결됨
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* 닉네임 */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cb-nickname" className="cb-caption text-muted-foreground">
                    닉네임
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input id="cb-nickname" defaultValue="홍길동" className="flex-1" />
                    <button className="cb-cta-blue cb-caption" style={{ padding: "0.5rem 1rem", borderRadius: "56px" }}>
                      수정
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cb-email-display" className="cb-caption text-muted-foreground">
                    이메일
                  </Label>
                  <Input id="cb-email-display" value="hong@gmail.com" disabled />
                </div>
              </div>

              <Separator className="my-6" />

              {/* 알림 설정 */}
              <div className="space-y-4">
                <p className="cb-caption text-muted-foreground">알림 설정</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="cb-body-sm font-semibold">이메일 알림</p>
                    <p className="cb-caption text-muted-foreground">가격 임계 도달 시</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator className="my-6" />

              {/* 계정 삭제 */}
              <div className="flex justify-end">
                <Button variant="ghost" className="text-destructive hover:text-destructive cb-caption">
                  계정 삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================================================
          섹션 4 — 알림 이력 테이블 (#0a0b0d, dark)
      =================================================== */}
      <div className="cb-dark">
        <section className="px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="cb-caption" style={{ color: "#8a8f9b" }}>Alert History</p>
            <h2 className="cb-section mt-1">알림 이력</h2>
            <p className="cb-body mt-2" style={{ color: "#8a8f9b" }}>
              총 {alertHistory.length}건
            </p>

            {/* 필터 탭 */}
            <Tabs defaultValue="all" className="mt-8">
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="up">상승</TabsTrigger>
                <TabsTrigger value="down">하락</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cb-caption">종목</TableHead>
                        <TableHead className="cb-caption">기준가</TableHead>
                        <TableHead className="cb-caption">발동가</TableHead>
                        <TableHead className="cb-caption">등락률</TableHead>
                        <TableHead className="cb-caption">유형</TableHead>
                        <TableHead className="cb-caption text-right">일시</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="cb-body-sm font-semibold">{item.stock}</p>
                              <p className="cb-small text-muted-foreground">{item.code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="cb-body-sm">{item.basePrice}</TableCell>
                          <TableCell className="cb-body-sm">{item.triggerPrice}</TableCell>
                          <TableCell
                            className="cb-body-sm font-semibold"
                            style={{ color: item.type === "상승" ? "#00b167" : "#d13520" }}
                          >
                            {item.change}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="cb-small"
                              style={
                                item.type === "상승"
                                  ? { backgroundColor: "rgba(0,82,255,0.15)", color: "#578bfa", border: "none" }
                                  : { backgroundColor: "rgba(209,53,32,0.15)", color: "#d13520", border: "none" }
                              }
                            >
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="cb-caption text-right text-muted-foreground">
                            {item.date}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="up">
                <Card className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cb-caption">종목</TableHead>
                        <TableHead className="cb-caption">기준가</TableHead>
                        <TableHead className="cb-caption">발동가</TableHead>
                        <TableHead className="cb-caption text-right">등락률</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertHistory.filter((a) => a.type === "상승").map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="cb-body-sm font-semibold">{item.stock}</TableCell>
                          <TableCell className="cb-body-sm">{item.basePrice}</TableCell>
                          <TableCell className="cb-body-sm">{item.triggerPrice}</TableCell>
                          <TableCell
                            className="cb-body-sm text-right font-semibold"
                            style={{ color: "#00b167" }}
                          >
                            {item.change}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="down">
                <Card className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cb-caption">종목</TableHead>
                        <TableHead className="cb-caption">기준가</TableHead>
                        <TableHead className="cb-caption">발동가</TableHead>
                        <TableHead className="cb-caption text-right">등락률</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertHistory.filter((a) => a.type === "하락").map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="cb-body-sm font-semibold">{item.stock}</TableCell>
                          <TableCell className="cb-body-sm">{item.basePrice}</TableCell>
                          <TableCell className="cb-body-sm">{item.triggerPrice}</TableCell>
                          <TableCell
                            className="cb-body-sm text-right font-semibold"
                            style={{ color: "#d13520" }}
                          >
                            {item.change}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================
          섹션 5 — 로그인 카드 (#eef0f3, cool gray)
      =================================================== */}
      <section className="cb-surface-gray px-4 py-16">
        <div className="flex flex-col items-center">
          {/* Card floats white on gray — classic Coinbase "form on gray" */}
          <Card className="w-full max-w-sm">
            <CardContent className="px-8 py-10">
              <div className="text-center">
                <p className="cb-caption text-muted-foreground">Welcome to</p>
                <h2 className="cb-tile mt-1">Stock Alarm</h2>
                <p className="cb-body mt-3 text-muted-foreground">
                  로그인하여 주식 알림을 관리하세요.
                </p>
              </div>

              <Separator className="my-8" />

              <div className="space-y-3">
                {/* Google OAuth — blue bordered pill */}
                <button className="cb-cta-blue cb-btn-label w-full justify-center">
                  <svg
                    className="mr-2 h-4 w-4 inline-block"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google로 계속하기
                </button>

                {/* Primary login — dark pill */}
                <button className="cb-cta-dark cb-btn-label w-full justify-center">
                  이메일로 로그인
                </button>
              </div>

              <Separator className="my-6" />

              {/* 2FA / OTP — Coinbase는 금융 서비스로 2FA가 핵심 UX */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="cb-caption text-muted-foreground">2단계 인증 코드</p>
                </div>
                <div className="flex justify-center">
                  <InputOTP maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <p className="cb-caption mt-6 text-center text-muted-foreground">
                계정이 없으신가요?{" "}
                <span className="cb-link cursor-pointer">회원가입</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================================================
          섹션 6 — 전체 앱 레이아웃 (#ffffff, light)
      =================================================== */}
      <section className="bg-background px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="cb-caption text-muted-foreground">App Layout</p>
          <h2 className="cb-section mt-1">전체 레이아웃</h2>
          <p className="cb-body mt-2 text-muted-foreground">
            사이드바 + 메인 콘텐츠 구성
          </p>

          {/* NO shadow — depth comes from color contrast only */}
          <div
            className="mt-8 rounded-[16px] overflow-hidden"
            style={{ border: "1px solid rgba(91,97,110,0.2)" }}
          >
            <ResizablePanelGroup orientation="horizontal" className="min-h-[480px]">

              {/* 사이드바 */}
              <ResizablePanel defaultSize={22} minSize={18} maxSize={28}>
                <div className="flex h-full flex-col bg-card">
                  {/* 로고 */}
                  <div
                    className="px-4 py-5"
                    style={{ borderBottom: "1px solid rgba(91,97,110,0.2)" }}
                  >
                    <p className="cb-feature">Stock Alarm</p>
                    <p className="cb-small text-muted-foreground">Beta</p>
                  </div>

                  {/* 네비게이션 */}
                  <ScrollArea className="flex-1 px-3 py-4">
                    <nav className="space-y-1">
                      {[
                        { icon: LayoutDashboard, label: "대시보드", active: true },
                        { icon: Bell, label: "알림 이력", active: false },
                        { icon: Settings, label: "설정", active: false },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2 cb-caption cursor-pointer transition-colors ${
                            item.active
                              ? "font-semibold"
                              : "hover:bg-accent text-foreground"
                          }`}
                          style={
                            item.active
                              ? {
                                  backgroundColor: "rgba(0,82,255,0.08)",
                                  color: "#0052ff",
                                }
                              : {}
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                      ))}
                    </nav>
                  </ScrollArea>

                  {/* 프로필 드롭다운 */}
                  <div
                    className="p-3"
                    style={{ borderTop: "1px solid rgba(91,97,110,0.2)" }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 px-2 cb-caption h-auto py-2"
                          />
                        }
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback
                            className="text-xs"
                            style={{ backgroundColor: "#0052ff", color: "#fff" }}
                          >
                            홍
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-semibold leading-none">홍길동</p>
                          <p className="text-muted-foreground mt-0.5">hong@gmail.com</p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="cb-caption">내 계정</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          프로필
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
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* 메인 콘텐츠 */}
              <ResizablePanel defaultSize={78}>
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="cb-caption text-muted-foreground">2026년 4월 15일</p>
                        <h3 className="cb-tile mt-1">대시보드</h3>
                      </div>
                      <button
                        className="cb-cta-dark cb-caption"
                        style={{ padding: "0.5rem 1rem", borderRadius: "56px" }}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5 inline-block" />
                        알림 등록
                      </button>
                    </div>

                    {/* 요약 카드 */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: "등록 알림", value: "3", sub: "종목" },
                        { label: "오늘 발동", value: "2", sub: "건" },
                        { label: "활성 알림", value: "2 / 3", sub: "" },
                      ].map((stat) => (
                        <Card key={stat.label}>
                          <CardContent className="px-4 py-3">
                            <p className="cb-caption text-muted-foreground">{stat.label}</p>
                            <p className="cb-tile mt-1">
                              {stat.value}
                              {stat.sub && (
                                <span className="cb-caption text-muted-foreground ml-1">
                                  {stat.sub}
                                </span>
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* 알림 카드 목록 (미니) */}
                    <div className="space-y-2">
                      {dashboardAlerts.slice(0, 2).map((alert) => (
                        <Card key={alert.id}>
                          <CardContent className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="cb-body-sm font-semibold">{alert.stockName}</p>
                                  <Badge
                                    className="cb-small"
                                    style={{
                                      backgroundColor: "rgba(91,97,110,0.1)",
                                      color: "#5b616e",
                                      border: "none",
                                    }}
                                  >
                                    {alert.stockCode}
                                  </Badge>
                                </div>
                                <p className="cb-caption mt-0.5 text-muted-foreground">
                                  기준가 {alert.basePrice.toLocaleString()}원
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="cb-body-sm font-semibold">
                                  {alert.currentPrice.toLocaleString()}
                                </p>
                                <p
                                  className="cb-caption"
                                  style={{
                                    color: alert.changeRate >= 0 ? "#00b167" : "#d13520",
                                  }}
                                >
                                  {alert.changeRate >= 0 ? "+" : ""}
                                  {alert.changeRate.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* 스켈레톤 로딩 — cool gray shimmer */}
                      <Card>
                        <CardContent className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="space-y-2 text-right">
                              <Skeleton className="h-4 w-20 ml-auto" />
                              <Skeleton className="h-3 w-12 ml-auto" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </ResizablePanel>

            </ResizablePanelGroup>
          </div>
        </div>
      </section>

    </div>
  );
}
