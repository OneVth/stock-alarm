"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface LogFilterBarProps {
  /** 현재 선택된 레벨 필터 */
  currentLevel?: string;
  /** 현재 선택된 카테고리 필터 */
  currentCategory?: string;
  /** 사용 가능한 카테고리 목록 */
  categories: string[];
}

const LOG_LEVELS = ["ERROR", "WARN", "INFO"] as const;

/**
 * 시스템 로그 필터 바
 *
 * 레벨과 카테고리 필터를 Select로 제공합니다.
 */
export function LogFilterBar({
  currentLevel,
  currentCategory,
  categories,
}: LogFilterBarProps) {
  const router = useRouter();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    // 기존 필터 유지
    if (currentLevel && key !== "level") params.set("level", currentLevel);
    if (currentCategory && key !== "category")
      params.set("category", currentCategory);
    // 새 필터 설정
    if (value) params.set(key, value);
    // page를 1로 리셋
    params.set("page", "1");

    router.push(`/admin/logs?${params.toString()}`);
  };

  return (
    <div className="flex gap-3">
      <Select
        value={currentLevel ?? ""}
        onValueChange={(value) =>
          updateFilter("level", value || null)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="레벨 전체" />
        </SelectTrigger>
        <SelectContent>
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
        onValueChange={(value) =>
          updateFilter("category", value || null)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="카테고리 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">전체</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
