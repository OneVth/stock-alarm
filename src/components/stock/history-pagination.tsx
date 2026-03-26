"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 알림 이력 페이지네이션 Props
 */
interface HistoryPaginationProps {
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지당 항목 수 */
  pageSize: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * 알림 이력 페이지네이션 컴포넌트
 *
 * URL `?page=N` 파라미터로 페이지를 이동하고,
 * 페이지당 항목 수 Select로 `?size=N`을 변경합니다.
 * type, stock 파라미터는 유지됩니다.
 *
 * @param currentPage - 현재 페이지 번호
 * @param totalPages - 전체 페이지 수
 * @param pageSize - 페이지당 항목 수
 */
export function HistoryPagination({
  currentPage,
  totalPages,
  pageSize,
}: HistoryPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildHref(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `/history?${params.toString()}`;
  }

  function handleSizeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/history?${query}` : "/history");
  }

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>페이지당</span>
        <Select
          value={String(pageSize)}
          onValueChange={handleSizeChange}
        >
          <SelectTrigger size="sm" className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>개</span>
      </div>

      {totalPages > 1 && (
        <Pagination className="w-auto flex-none mx-0 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildHref(currentPage - 1)}
                text="이전"
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pages.map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href={buildHref(p)}
                    isActive={p === currentPage}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={buildHref(currentPage + 1)}
                text="다음"
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

/**
 * 페이지 번호 목록을 생성합니다.
 *
 * @param current - 현재 페이지
 * @param total - 전체 페이지 수
 * @returns 페이지 번호 또는 "ellipsis" 배열
 */
function buildPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
