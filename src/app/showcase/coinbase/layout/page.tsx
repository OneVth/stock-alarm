"use client";

import * as React from "react";
import { ComponentSection } from "../../_components/component-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const stockItems = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `종목 ${i + 1}`,
  code: `0${String(i).padStart(5, "0")}`,
}));

export default function CoinbaseLayoutShowcase() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-12">
      <div>
        <p className="cb-caption text-muted-foreground">Layout & Structure</p>
        <h1 className="cb-section mt-1">레이아웃</h1>
        <p className="cb-body mt-2 text-muted-foreground">6 components</p>
      </div>

      <ComponentSection
        title="Card"
        description="기본 카드 컴포넌트 — 1px border, 16px radius, 그림자 없음"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="cb-body-sm font-semibold">삼성전자</CardTitle>
              <CardDescription className="cb-caption">005930 · KOSPI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="cb-tile">77,200</p>
              <p className="cb-caption mt-1" style={{ color: "#00b167" }}>
                +1,200 (+1.58%)
              </p>
            </CardContent>
            <CardFooter>
              <p className="cb-caption text-muted-foreground">
                기준가 70,000원
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="cb-body-sm font-semibold">SK하이닉스</CardTitle>
              <CardDescription className="cb-caption">000660 · KOSPI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="cb-tile">182,000</p>
              <p className="cb-caption mt-1" style={{ color: "#d13520" }}>
                -3,500 (-1.89%)
              </p>
            </CardContent>
            <CardFooter>
              <p className="cb-caption text-muted-foreground">
                기준가 150,000원
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="cb-body-sm font-semibold">NAVER</CardTitle>
              <CardDescription className="cb-caption">035420 · KOSPI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="cb-tile">205,000</p>
              <p className="cb-caption mt-1" style={{ color: "#00b167" }}>
                +5,000 (+2.50%)
              </p>
            </CardContent>
            <CardFooter>
              <p className="cb-caption text-muted-foreground">
                기준가 200,000원
              </p>
            </CardFooter>
          </Card>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Separator"
        description="가로/세로 구분선"
      >
        <div className="space-y-6">
          <div>
            <p className="cb-caption mb-3 text-muted-foreground">가로 구분선</p>
            <div>
              <p className="cb-body">Stock Alarm</p>
              <Separator className="my-3" />
              <div className="flex items-center gap-4">
                <p className="cb-caption text-muted-foreground">대시보드</p>
                <Separator orientation="vertical" className="h-4" />
                <p className="cb-caption text-muted-foreground">알림 이력</p>
                <Separator orientation="vertical" className="h-4" />
                <p className="cb-caption text-muted-foreground">설정</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Aspect Ratio"
        description="비율 고정 컨테이너 — 16:9, 4:3, 1:1"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {([
            { label: "16:9", ratio: "16/9" },
            { label: "4:3", ratio: "4/3" },
            { label: "1:1", ratio: "1/1" },
          ] as const).map(({ label, ratio }) => (
            <div key={label}>
              <p className="cb-caption mb-2 text-muted-foreground">{label}</p>
              <div
                className="rounded-[16px] bg-secondary flex items-center justify-center"
                style={{ aspectRatio: ratio }}
              >
                <span className="cb-caption text-muted-foreground">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </ComponentSection>

      <ComponentSection
        title="Scroll Area"
        description="스크롤 가능 영역 — 세로/가로"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="cb-caption mb-2 text-muted-foreground">세로 스크롤</p>
            <ScrollArea className="h-48 rounded-[16px] bg-secondary p-4">
              <div className="space-y-2">
                {stockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="cb-body-sm">{item.name}</span>
                    <span className="cb-caption text-muted-foreground">
                      {item.code}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <p className="cb-caption mb-2 text-muted-foreground">가로 스크롤</p>
            <ScrollArea className="rounded-[16px] bg-secondary p-4">
              <div className="flex gap-3 pb-2">
                {stockItems.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 rounded-[8px] bg-card px-3 py-2"
                    style={{ border: "1px solid rgba(91,97,110,0.2)" }}
                  >
                    <p className="cb-caption whitespace-nowrap">{item.name}</p>
                    <p className="cb-small text-muted-foreground">
                      {item.code}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Resizable"
        description="크기 조절 가능 패널"
      >
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-48 rounded-[16px] border border-border overflow-hidden"
        >
          <ResizablePanel defaultSize={25} minSize={15}>
            <div className="flex h-full flex-col p-4">
              <p className="cb-caption text-muted-foreground mb-3">
                사이드바
              </p>
              <div className="space-y-1">
                {["대시보드", "알림 이력", "설정"].map((item) => (
                  <div
                    key={item}
                    className="rounded-[8px] px-3 py-2 cb-caption hover:bg-accent cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-4">
              <p className="cb-body text-muted-foreground">메인 콘텐츠</p>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={15}>
            <div className="flex h-full items-center justify-center p-4">
              <p className="cb-caption text-muted-foreground">상세 패널</p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ComponentSection>

      <ComponentSection
        title="Collapsible"
        description="접기/펼치기 영역"
      >
        <div className="w-full max-w-md space-y-3">
          <Collapsible open={open} onOpenChange={setOpen}>
            <div
              className="flex items-center justify-between rounded-[16px] bg-secondary px-4 py-3"
            >
              <p className="cb-body-sm font-semibold">알림 이력</p>
              <CollapsibleTrigger render={<Button variant="ghost" size="icon" />}>
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-200"
                  style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="mt-1 space-y-1">
                {[
                  { stock: "삼성전자", type: "상승", time: "14:32" },
                  { stock: "SK하이닉스", type: "하락", time: "11:15" },
                  { stock: "NAVER", type: "상승", time: "09:45" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[8px] bg-secondary px-4 py-3"
                  >
                    <span className="cb-body-sm">{item.stock}</span>
                    <span
                      className="cb-caption"
                      style={{
                        color: item.type === "상승" ? "#00b167" : "#d13520",
                      }}
                    >
                      {item.type}
                    </span>
                    <span className="cb-caption text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ComponentSection>
    </div>
  );
}
