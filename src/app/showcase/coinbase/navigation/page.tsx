"use client";

import * as React from "react";
import { ComponentSection } from "../../_components/component-section";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { LayoutDashboard, History, Settings, Search } from "lucide-react";

export default function CoinbaseNavigationShowcase() {
  return (
    <div className="space-y-12">
      <div>
        <p className="cb-caption text-muted-foreground">Navigation</p>
        <h1 className="cb-section mt-1">내비게이션</h1>
        <p className="cb-body mt-2 text-muted-foreground">5 components</p>
      </div>

      <ComponentSection
        title="Breadcrumb"
        description="경로 탐색 — 현재 위치를 계층 구조로 표시"
      >
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/showcase/coinbase">Coinbase Showcase</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/showcase/coinbase/navigation">Navigation</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">대시보드</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">알림 이력</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>삼성전자 005930</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Tabs"
        description="탭 전환 — 기본 variant"
      >
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="up">상승</TabsTrigger>
            <TabsTrigger value="down">하락</TabsTrigger>
            <TabsTrigger value="hold">보합</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="mt-4 space-y-2">
              {[
                { name: "삼성전자", change: "+1.58%", up: true },
                { name: "SK하이닉스", change: "-1.89%", up: false },
                { name: "NAVER", change: "+2.50%", up: true },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-[8px] bg-secondary px-4 py-3"
                >
                  <span className="cb-body-sm font-semibold">{item.name}</span>
                  <span
                    className="cb-caption"
                    style={{ color: item.up ? "#00b167" : "#d13520" }}
                  >
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="up">
            <div className="mt-4 space-y-2">
              {[
                { name: "삼성전자", change: "+1.58%" },
                { name: "NAVER", change: "+2.50%" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-[8px] bg-secondary px-4 py-3"
                >
                  <span className="cb-body-sm font-semibold">{item.name}</span>
                  <span className="cb-caption" style={{ color: "#00b167" }}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="down">
            <div className="mt-4">
              <div className="flex items-center justify-between rounded-[8px] bg-secondary px-4 py-3">
                <span className="cb-body-sm font-semibold">SK하이닉스</span>
                <span className="cb-caption" style={{ color: "#d13520" }}>
                  -1.89%
                </span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="hold">
            <div className="mt-4 flex flex-col items-center py-8">
              <p className="cb-body text-muted-foreground">보합 종목 없음</p>
            </div>
          </TabsContent>
        </Tabs>
      </ComponentSection>

      <ComponentSection
        title="Pagination"
        description="페이지 네비게이션"
      >
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </ComponentSection>

      <ComponentSection
        title="Menubar"
        description="메뉴바 — File / Edit / View"
      >
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New Alert <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Export CSV <MenubarShortcut>⌘E</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Settings <MenubarShortcut>⌘,</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Select All <MenubarShortcut>⌘A</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Delete Selected</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>알림 카드 보기</MenubarCheckboxItem>
              <MenubarCheckboxItem>테이블 보기</MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>정렬 기준</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarRadioGroup value="name">
                    <MenubarRadioItem value="name">종목명</MenubarRadioItem>
                    <MenubarRadioItem value="change">등락률</MenubarRadioItem>
                    <MenubarRadioItem value="date">등록일</MenubarRadioItem>
                  </MenubarRadioGroup>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </ComponentSection>

      <ComponentSection
        title="Command"
        description="검색 / 커맨드 팔레트"
      >
        <div
          className="max-w-md rounded-[16px] overflow-hidden"
          style={{ border: "1px solid rgba(91,97,110,0.2)" }}
        >
          <Command>
            <CommandInput placeholder="종목명 또는 코드 검색..." />
            <CommandList>
              <CommandEmpty className="cb-caption">검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="종목">
                <CommandItem>
                  <Search className="mr-2 h-4 w-4" />
                  <span>삼성전자</span>
                  <CommandShortcut>005930</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Search className="mr-2 h-4 w-4" />
                  <span>SK하이닉스</span>
                  <CommandShortcut>000660</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Search className="mr-2 h-4 w-4" />
                  <span>NAVER</span>
                  <CommandShortcut>035420</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="이동">
                <CommandItem>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>대시보드</span>
                </CommandItem>
                <CommandItem>
                  <History className="mr-2 h-4 w-4" />
                  <span>알림 이력</span>
                </CommandItem>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </ComponentSection>
    </div>
  );
}
