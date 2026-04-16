"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface AlertSearchProps {
  /** 초기 검색어 */
  defaultValue?: string;
}

/**
 * 알림 검색 컴포넌트
 *
 * 입력 후 300ms debounce로 URL `?q=` 파라미터를 갱신합니다.
 * 검색 시 `page` 파라미터를 초기화하고, 기존 `filter` 파라미터는 유지합니다.
 *
 * @param defaultValue - 초기 검색어
 */
export function AlertSearch({ defaultValue }: AlertSearchProps) {
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
          params.set("q", val);
        } else {
          params.delete("q");
        }
        params.delete("page");
        const query = params.toString();
        router.push(query ? `/dashboard?${query}` : "/dashboard");
      }, 300);
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <label htmlFor="alert-search" className="sr-only">
        종목명 또는 종목코드 검색
      </label>
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="alert-search"
        type="search"
        placeholder="종목명 또는 종목코드 검색"
        value={value}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  );
}
