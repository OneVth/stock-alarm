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

interface AlertPaginationProps {
  /** 전체 알림 개수 */
  totalCount: number;
  /** 현재 페이지 번호 (1부터 시작) */
  page: number;
  /** 페이지당 항목 수 */
  pageSize: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * 알림 페이지네이션 컴포넌트
 *
 * URL `?page=N` 파라미터로 페이지를 이동하고,
 * 페이지당 항목 수 Select로 `?size=N`을 변경합니다.
 * filter, q 파라미터는 유지됩니다.
 *
 * @param totalCount - 전체 알림 개수
 * @param page - 현재 페이지 번호 (1부터 시작)
 * @param pageSize - 페이지당 항목 수
 */
export function AlertPagination({
  totalCount,
  page,
  pageSize,
}: AlertPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1 && PAGE_SIZE_OPTIONS.includes(pageSize) && totalCount <= PAGE_SIZE_OPTIONS[0]) {
    return null;
  }

  function buildHref(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `/dashboard?${params.toString()}`;
  }

  function handleSizeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  }

  const pageNumbers = getPageNumbers(page, totalPages);

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
                href={buildHref(page - 1)}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                text="이전"
              />
            </PaginationItem>

            {pageNumbers.map((num, i) =>
              num === null ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={num}>
                  <PaginationLink href={buildHref(num)} isActive={num === page}>
                    {num}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={buildHref(page + 1)}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
                text="다음"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

/**
 * 표시할 페이지 번호 배열을 생성합니다. null은 ellipsis를 나타냅니다.
 */
function getPageNumbers(
  current: number,
  total: number
): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push(null);
  }

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push(null);
  }

  pages.push(total);

  return pages;
}
