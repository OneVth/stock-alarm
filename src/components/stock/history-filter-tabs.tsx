"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 알림 이력 필터 탭 Props
 */
interface HistoryFilterTabsProps {
  counts: {
    /** 전체 이력 건수 */
    total: number;
    /** 상승 알림 건수 */
    upper: number;
    /** 하락 알림 건수 */
    lower: number;
  };
}

/**
 * 알림 이력 유형 필터 탭
 *
 * 전체/상승/하락 탭으로 알림 이력을 필터링합니다.
 * URL searchParams로 필터 상태를 관리합니다.
 *
 * @param counts - 각 유형별 이력 건수
 */
export function HistoryFilterTabs({ counts }: HistoryFilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") ?? "all";

  function handleTypeChange(value: unknown) {
    const type = value as string;
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/history?${query}` : "/history");
  }

  return (
    <Tabs value={currentType} onValueChange={handleTypeChange}>
      <TabsList variant="line">
        <TabsTrigger value="all">전체 ({counts.total})</TabsTrigger>
        <TabsTrigger value="upper">상승 ({counts.upper})</TabsTrigger>
        <TabsTrigger value="lower">하락 ({counts.lower})</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
