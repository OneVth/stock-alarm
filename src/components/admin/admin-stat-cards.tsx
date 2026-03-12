import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersIcon, BellIcon, MailIcon } from "lucide-react";

import type { AdminStats } from "@/types/admin";

interface AdminStatCardsProps {
  stats: AdminStats;
}

const statItems = [
  {
    key: "totalUsers" as const,
    label: "전체 사용자",
    icon: UsersIcon,
  },
  {
    key: "totalAlerts" as const,
    label: "전체 알림",
    icon: BellIcon,
  },
  {
    key: "todaySentAlerts" as const,
    label: "오늘 발송",
    icon: MailIcon,
  },
];

/**
 * 관리자 대시보드 통계 카드 (3열 그리드)
 */
export function AdminStatCards({ stats }: AdminStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} size="sm">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats[item.key]}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
