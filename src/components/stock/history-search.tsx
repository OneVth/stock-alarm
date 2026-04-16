"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

/**
 * 알림 이력 검색 컴포넌트 Props
 */
interface HistorySearchProps {
  /** 초기 검색어 */
  defaultValue?: string;
}

/**
 * 알림 이력 종목명 검색 컴포넌트
 *
 * 입력 후 300ms debounce로 URL `?stock=` 파라미터를 갱신합니다.
 * 검색 시 `page` 파라미터를 초기화하고, 기존 `type`·`size` 파라미터는 유지합니다.
 *
 * @param defaultValue - 초기 검색어
 */
export function HistorySearch({ defaultValue }: HistorySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useState(defaultValue ?? "");

  // 외부 URL 변경(필터 탭 전환 등)으로 defaultValue가 바뀌면 동기화
  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValue(val);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
          params.set("stock", val);
        } else {
          params.delete("stock");
        }
        params.delete("page");
        const query = params.toString();
        router.push(query ? `/history?${query}` : "/history");
      }, 300);
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <label htmlFor="history-search" className="sr-only">
        종목명 검색
      </label>
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="history-search"
        type="search"
        placeholder="종목명 검색"
        value={value}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  );
}
