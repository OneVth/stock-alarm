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

interface AdminPaginationProps {
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 기본 경로 (예: "/admin/users") */
  basePath: string;
  /** 필터 등 추가 searchParams (페이지네이션 시 보존) */
  searchParams?: Record<string, string>;
  /** 페이지당 항목 수 — 지정 시 크기 선택 Select 표시 */
  pageSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * 관리자 페이지네이션 컴포넌트
 *
 * basePath와 searchParams를 조합하여 필터를 보존한 URL을 생성합니다.
 * pageSize prop을 전달하면 페이지당 항목 수 Select가 함께 표시됩니다.
 *
 * @param currentPage - 현재 페이지 번호
 * @param totalPages - 전체 페이지 수
 * @param basePath - 기본 경로
 * @param searchParams - 추가 검색 파라미터
 * @param pageSize - 페이지당 항목 수 (있으면 크기 Select 표시)
 */
export function AdminPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
  pageSize,
}: AdminPaginationProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const handleSizeChange = (value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("size", value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  const pages = buildPageNumbers(currentPage, totalPages);

  const paginationNode = totalPages > 1 ? (
    <Pagination className={pageSize !== undefined ? "w-auto flex-none mx-0 justify-end" : ""}>
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
  ) : null;

  if (pageSize === undefined) {
    return paginationNode;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>페이지당</span>
        <Select value={String(pageSize)} onValueChange={handleSizeChange}>
          <SelectTrigger size="sm" className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>개</span>
      </div>

      {paginationNode}
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
