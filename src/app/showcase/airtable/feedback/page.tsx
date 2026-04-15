"use client";

import * as React from "react";
import { AlertCircle, Loader2, Terminal } from "lucide-react";
import { toast } from "sonner";
import { ComponentSection } from "../../_components/component-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackShowcase() {
  const [progress, setProgress] = React.useState(30);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-12">
      <div>
        <p className="at-caption text-muted-foreground">Feedback & Status</p>
        <h1 className="at-section mt-1">피드백 & 상태</h1>
        <p className="at-body mt-2 text-muted-foreground">6 components</p>
      </div>

      <ComponentSection
        title="Alert"
        description="정보/경고/에러 알림 메시지"
      >
        <div className="space-y-3">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>알림 등록 완료</AlertTitle>
            <AlertDescription>
              삼성전자(005930) 알림이 등록되었습니다. 기준가 대비 ±5% 도달 시
              이메일로 알림을 발송합니다.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API 요청 한도 초과</AlertTitle>
            <AlertDescription>
              오늘의 주가 조회 한도에 도달했습니다. 내일 자정 이후 다시
              시도하세요.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>알림 발송 실패</AlertTitle>
            <AlertDescription>
              이메일 주소가 유효하지 않거나 발송 서버에 문제가 발생했습니다.
              설정을 확인하세요.
            </AlertDescription>
          </Alert>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Alert Dialog"
        description="확인/취소 다이얼로그"
      >
        <div className="flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" />}
            >
              알림 삭제
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>알림을 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  삼성전자(005930) 알림이 영구적으로 삭제됩니다. 이 작업은
                  되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction>삭제</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="outline" />}
            >
              계정 탈퇴
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말로 탈퇴하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  계정과 모든 알림 데이터가 삭제됩니다. 이 작업은 되돌릴 수
                  없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  탈퇴
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Toast (Sonner)"
        description="토스트 알림 — 버튼 클릭으로 발동"
      >
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast.success("알림 등록 완료", {
                description: "삼성전자(005930) 알림이 등록되었습니다.",
              })
            }
          >
            성공 토스트
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error("알림 발송 실패", {
                description: "이메일 서버 오류가 발생했습니다.",
              })
            }
          >
            에러 토스트
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              toast.info("주가 업데이트", {
                description: "삼성전자 현재가: 77,200원",
              })
            }
          >
            정보 토스트
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast("알림 발동", {
                description: "SK하이닉스가 기준가 대비 -10%에 도달했습니다.",
                action: {
                  label: "확인",
                  onClick: () => {},
                },
              })
            }
          >
            액션 토스트
          </Button>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Progress"
        description="진행률 바 — 애니메이션"
      >
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="at-caption text-muted-foreground">데이터 로딩</p>
              <p className="at-caption text-muted-foreground">{progress}%</p>
            </div>
            <Progress value={progress} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="at-caption text-muted-foreground">알림 한도 사용량</p>
              <p className="at-caption text-muted-foreground">6 / 10</p>
            </div>
            <Progress value={60} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="at-caption text-muted-foreground">오늘 발동률</p>
              <p className="at-caption text-muted-foreground">3 / 5</p>
            </div>
            <Progress value={100} />
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Spinner"
        description="로딩 스피너 — 크기별"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="at-caption text-muted-foreground">Small</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="at-caption text-muted-foreground">Default</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="at-caption text-muted-foreground">Large</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="at-caption text-muted-foreground">Muted</p>
          </div>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            저장 중...
          </Button>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Skeleton"
        description="로딩 스켈레톤 — 카드, 리스트 항목"
      >
        <div className="space-y-6">
          <div>
            <p className="at-caption mb-3 text-muted-foreground">알림 카드 스켈레톤</p>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="at-caption mb-3 text-muted-foreground">프로필 스켈레톤</p>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        </div>
      </ComponentSection>
    </div>
  );
}
