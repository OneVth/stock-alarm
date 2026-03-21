import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertListSkeletonProps {
  /** 스켈레톤 행 개수 (기본값: 5) */
  count?: number;
}

/**
 * 알림 리스트 스켈레톤
 *
 * 알림 목록 로딩 중 표시되는 스켈레톤 UI입니다.
 *
 * @param count - 표시할 스켈레톤 행 개수 (기본값: 5)
 */
export function AlertListSkeleton({ count = 5 }: AlertListSkeletonProps) {
  return (
    <Card className="gap-0 overflow-x-auto py-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex min-w-[600px] items-center justify-between gap-4 px-4 py-3 [&:not(:last-child)]:border-b"
        >
          {/* 좌측: 그래프 + 종목명 + 가격 */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-20 rounded" />
            <div className="w-[120px] shrink-0 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          {/* 우측: 알림조건 + 메뉴 */}
          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Skeleton className="ml-auto h-3 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </Card>
  );
}
