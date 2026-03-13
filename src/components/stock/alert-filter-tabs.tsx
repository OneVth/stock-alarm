"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AlertFilterStats } from "@/types/alert";

interface AlertFilterTabsProps {
  counts: AlertFilterStats;
}

/**
 * 알림 필터 탭
 *
 * 전체/활성/비활성 탭으로 알림 목록을 필터링합니다.
 * URL searchParams로 필터 상태를 관리합니다.
 *
 * @param counts - 각 상태별 알림 개수
 */
export function AlertFilterTabs({ counts }: AlertFilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") ?? "all";

  function handleFilterChange(value: unknown) {
    const filter = value as string;
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }
    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  }

  return (
    <Tabs value={currentFilter} onValueChange={handleFilterChange}>
      <TabsList variant="line">
        <TabsTrigger value="all">전체 ({counts.total})</TabsTrigger>
        <TabsTrigger value="active">활성 ({counts.active})</TabsTrigger>
        <TabsTrigger value="inactive">비활성 ({counts.inactive})</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
