"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LogFilterBarProps {
  /** 현재 선택된 레벨 필터 */
  currentLevel?: string;
  /** 현재 선택된 카테고리 필터 */
  currentCategory?: string;
  /** 사용 가능한 카테고리 목록 */
  categories: string[];
  /** 현재 시작일 필터 (YYYY-MM-DD) */
  currentFrom?: string;
  /** 현재 종료일 필터 (YYYY-MM-DD) */
  currentTo?: string;
}

const LOG_LEVELS = ["ERROR", "WARN", "INFO"] as const;

const DATE_PRESETS = [
  { label: "오늘", days: 0 },
  { label: "7일", days: 7 },
  { label: "30일", days: 30 },
  { label: "90일", days: 90 },
] as const;

const getToday = () => new Date().toISOString().split("T")[0];
const getDaysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

/**
 * 시스템 로그 필터 바
 *
 * 레벨/카테고리 Select와 날짜 범위 필터(프리셋 버튼 + 네이티브 date input)를 제공합니다.
 */
export function LogFilterBar({
  currentLevel,
  currentCategory,
  categories,
  currentFrom,
  currentTo,
}: LogFilterBarProps) {
  const router = useRouter();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    if (currentLevel && key !== "level") params.set("level", currentLevel);
    if (currentCategory && key !== "category")
      params.set("category", currentCategory);
    if (currentFrom && key !== "from") params.set("from", currentFrom);
    if (currentTo && key !== "to") params.set("to", currentTo);
    if (value) params.set(key, value);
    params.set("page", "1");
    router.push(`/admin/logs?${params.toString()}`);
  };

  const handlePreset = (days: number) => {
    const today = getToday();
    const from = days === 0 ? today : getDaysAgo(days);
    const params = new URLSearchParams();
    if (currentLevel) params.set("level", currentLevel);
    if (currentCategory) params.set("category", currentCategory);
    params.set("from", from);
    params.set("to", today);
    params.set("page", "1");
    router.push(`/admin/logs?${params.toString()}`);
  };

  const handleDateChange = (key: "from" | "to", value: string) => {
    const params = new URLSearchParams();
    if (currentLevel) params.set("level", currentLevel);
    if (currentCategory) params.set("category", currentCategory);
    if (key === "from") {
      if (value) params.set("from", value);
      if (currentTo) params.set("to", currentTo);
    } else {
      if (currentFrom) params.set("from", currentFrom);
      if (value) params.set("to", value);
    }
    params.set("page", "1");
    router.push(`/admin/logs?${params.toString()}`);
  };

  const isPresetActive = (days: number) => {
    if (!currentFrom || !currentTo) return false;
    const today = getToday();
    const expectedFrom = days === 0 ? today : getDaysAgo(days);
    return currentFrom === expectedFrom && currentTo === today;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 레벨 / 카테고리 Select */}
      <div className="flex gap-3">
        <Select
          value={currentLevel ?? ""}
          onValueChange={(value) => updateFilter("level", value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="레벨 전체" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="">전체</SelectItem>
            {LOG_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentCategory ?? ""}
          onValueChange={(value) => updateFilter("category", value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 전체" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="">전체</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 날짜 프리셋 버튼 + 날짜 Input */}
      <div className="flex items-center gap-2 flex-wrap">
        {DATE_PRESETS.map(({ label, days }) => (
          <Button
            key={days}
            variant={isPresetActive(days) ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset(days)}
          >
            {label}
          </Button>
        ))}

        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-muted-foreground">시작일</span>
          <input
            type="date"
            value={currentFrom ?? ""}
            onChange={(e) => handleDateChange("from", e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-sm text-muted-foreground">종료일</span>
          <input
            type="date"
            value={currentTo ?? ""}
            onChange={(e) => handleDateChange("to", e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
