import { Bell } from "lucide-react";
import { AlertFormDialog } from "@/components/dashboard/alert-form-dialog";

/**
 * 알림 빈 상태 컴포넌트
 *
 * 등록된 알림이 없을 때 표시됩니다.
 * 알림 추가 버튼을 포함합니다.
 */
export function AlertEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">등록된 알림이 없습니다</p>
        <p className="mt-1 text-sm text-muted-foreground">
          종목을 추가하고 가격 알림을 설정해보세요
        </p>
      </div>
      <AlertFormDialog />
    </div>
  );
}
