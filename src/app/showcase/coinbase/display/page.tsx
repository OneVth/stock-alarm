"use client";

import * as React from "react";
import { ComponentSection } from "../../_components/component-section";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "1월", alerts: 12, triggered: 5 },
  { month: "2월", alerts: 18, triggered: 8 },
  { month: "3월", alerts: 15, triggered: 11 },
  { month: "4월", alerts: 24, triggered: 9 },
  { month: "5월", alerts: 20, triggered: 14 },
  { month: "6월", alerts: 28, triggered: 17 },
];

/* Coinbase two-blue palette — primary + hover blue, never blue+gray */
const chartConfig = {
  alerts: { label: "등록 알림", color: "#0052ff" },
  triggered: { label: "발동 알림", color: "#578bfa" },
} satisfies ChartConfig;

const stockAlerts = [
  { name: "삼성전자", code: "005930", type: "상승", base: "70,000", current: "77,200", change: "+10.3%" },
  { name: "SK하이닉스", code: "000660", type: "하락", base: "200,000", current: "182,000", change: "-9.0%" },
  { name: "NAVER", code: "035420", type: "상승", base: "200,000", current: "205,000", change: "+2.5%" },
  { name: "카카오", code: "035720", type: "하락", base: "60,000", current: "54,000", change: "-10.0%" },
];

const carouselItems = [
  { title: "삼성전자", code: "005930", price: "77,200", change: "+1.58%", up: true },
  { title: "SK하이닉스", code: "000660", price: "182,000", change: "-1.89%", up: false },
  { title: "NAVER", code: "035420", price: "205,000", change: "+2.50%", up: true },
  { title: "카카오", code: "035720", price: "54,000", change: "-1.82%", up: false },
  { title: "LG에너지솔루션", code: "373220", price: "390,000", change: "+3.12%", up: true },
];

export default function CoinbaseDisplayShowcase() {
  return (
    <div className="space-y-12">
      <div>
        <p className="cb-caption text-muted-foreground">Data Display</p>
        <h1 className="cb-section mt-1">데이터 표시</h1>
        <p className="cb-body mt-2 text-muted-foreground">6 components</p>
      </div>

      <ComponentSection
        title="Table"
        description="데이터 테이블 — 14px/600 헤더, Coinbase Blue 강조"
      >
        <Table>
          <TableCaption className="cb-caption">최근 발동 알림 이력</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="cb-caption">종목</TableHead>
              <TableHead className="cb-caption">유형</TableHead>
              <TableHead className="cb-caption">기준가</TableHead>
              <TableHead className="cb-caption">현재가</TableHead>
              <TableHead className="cb-caption text-right">등락률</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockAlerts.map((item) => (
              <TableRow key={item.code}>
                <TableCell>
                  <div>
                    <p className="cb-body-sm font-semibold">{item.name}</p>
                    <p className="cb-small text-muted-foreground">{item.code}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    style={
                      item.type === "상승"
                        ? {
                            backgroundColor: "rgba(0,82,255,0.1)",
                            color: "#0052ff",
                            border: "none",
                          }
                        : {
                            backgroundColor: "rgba(209,53,32,0.1)",
                            color: "#d13520",
                            border: "none",
                          }
                    }
                  >
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="cb-body-sm">{item.base}</TableCell>
                <TableCell className="cb-body-sm">{item.current}</TableCell>
                <TableCell
                  className="cb-body-sm text-right font-semibold"
                  style={{ color: item.type === "상승" ? "#00b167" : "#d13520" }}
                >
                  {item.change}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ComponentSection>

      <ComponentSection
        title="Avatar"
        description="프로필 이미지 또는 fallback 이니셜"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback style={{ backgroundColor: "#0052ff", color: "#fff" }}>CN</AvatarFallback>
          </Avatar>
          <Avatar className="h-10 w-10">
            <AvatarFallback style={{ backgroundColor: "#0052ff", color: "#fff" }}>SA</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-base" style={{ backgroundColor: "#eef0f3", color: "#0a0b0d" }}>JK</AvatarFallback>
          </Avatar>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl" style={{ backgroundColor: "#eef0f3", color: "#0a0b0d" }}>LG</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs" style={{ backgroundColor: "#0052ff", color: "#fff" }}>홍</AvatarFallback>
            </Avatar>
            <div>
              <p className="cb-body-sm font-semibold">홍길동</p>
              <p className="cb-caption text-muted-foreground">hong@example.com</p>
            </div>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Badge"
        description="상태 또는 카테고리 레이블 — Coinbase Blue 강조"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              style={{
                backgroundColor: "rgba(0,82,255,0.1)",
                color: "#0052ff",
                border: "none",
              }}
            >
              상승 알림
            </Badge>
            <Badge
              style={{
                backgroundColor: "rgba(209,53,32,0.1)",
                color: "#d13520",
                border: "none",
              }}
            >
              하락 알림
            </Badge>
            <Badge variant="secondary">보합</Badge>
            <Badge variant="outline">비활성화</Badge>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Accordion"
        description="접기/펼치기 목록"
      >
        <Accordion className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger className="cb-body-sm font-semibold">Stock Alarm이란?</AccordionTrigger>
            <AccordionContent className="cb-body text-muted-foreground">
              주가를 모니터링하여 등록가 대비 설정한 임계값에 도달하면 이메일로
              알림을 발송하는 서비스입니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="cb-body-sm font-semibold">알림은 어떻게 작동하나요?</AccordionTrigger>
            <AccordionContent className="cb-body text-muted-foreground">
              기준가와 상승/하락 임계값(%)을 설정합니다. 현재가가 임계값을 넘으면
              즉시 이메일이 발송됩니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="cb-body-sm font-semibold">무료인가요?</AccordionTrigger>
            <AccordionContent className="cb-body text-muted-foreground">
              기본 플랜은 무료입니다. 최대 10개 종목을 모니터링하고 이메일 알림을
              받을 수 있습니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ComponentSection>

      <ComponentSection
        title="Carousel"
        description="슬라이드 캐러셀 — 종목 카드"
      >
        <div className="mx-auto w-full max-w-sm">
          <Carousel>
            <CarouselContent>
              {carouselItems.map((item) => (
                <CarouselItem key={item.code}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="cb-body-sm font-semibold">{item.title}</CardTitle>
                      <p className="cb-caption text-muted-foreground">{item.code}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="cb-tile">{item.price}</p>
                      <p
                        className="cb-caption mt-1"
                        style={{ color: item.up ? "#00b167" : "#d13520" }}
                      >
                        {item.change}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Chart"
        description="막대 차트 — Coinbase 2-blue 팔레트 (#0052ff / #578bfa)"
      >
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="alerts" fill="var(--color-alerts)" radius={4} />
            <Bar dataKey="triggered" fill="var(--color-triggered)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ComponentSection>
    </div>
  );
}
