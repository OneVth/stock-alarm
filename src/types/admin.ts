import type { LogLevel } from "@/generated/prisma/client";

/**
 * 관리자 대시보드 통계
 */
export interface AdminStats {
  /** 전체 사용자 수 */
  totalUsers: number;
  /** 전체 알림 수 */
  totalAlerts: number;
  /** 오늘 발송된 알림 수 */
  todaySentAlerts: number;
}

/**
 * 관리자 사용자 목록 항목
 */
export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  image: string | null;
  createdAt: string;
  roles: string[];
  _count: {
    alerts: number;
  };
}

/**
 * 관리자 시스템 로그 항목
 */
export interface AdminSystemLog {
  id: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata: unknown;
  userId: string | null;
  createdAt: string;
  user: {
    nickname: string;
    email: string;
  } | null;
}
