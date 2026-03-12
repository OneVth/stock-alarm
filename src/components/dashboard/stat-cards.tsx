import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/types/alert";
import {
  BellIcon,
  BellRingIcon,
  BellOffIcon,
  ActivityIcon,
} from "lucide-react";

interface StatCardsProps {
  stats: DashboardStats;
}

const statItems = [
  {
    key: "total" as const,
    label: "전체 알림",
    icon: BellIcon,
  },
  {
    key: "active" as const,
    label: "활성",
    icon: ActivityIcon,
  },
  {
    key: "triggered" as const,
    label: "트리거됨",
    icon: BellRingIcon,
  },
  {
    key: "inactive" as const,
    label: "비활성",
    icon: BellOffIcon,
  },
];

/**
 * 대시보드 통계 카드 (4개 그리드)
 */
export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
