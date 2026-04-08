"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { AdminSystemLog } from "@/types/admin";

interface SystemLogTableProps {
  /** 로그 목록 */
  logs: AdminSystemLog[];
}

const levelVariant = {
  ERROR: "destructive",
  WARN: "outline",
  INFO: "secondary",
} as const;

/**
 * 시스템 로그 테이블
 *
 * 레벨별 Badge 색상과 함께 로그를 표시합니다.
 * 메시지 셀을 클릭하면 전체 내용을 펼쳐서 볼 수 있습니다.
 */
export function SystemLogTable({ logs }: SystemLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>레벨</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>메시지</TableHead>
          <TableHead>사용자</TableHead>
          <TableHead>시간</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              로그가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge variant={levelVariant[log.level]}>
                  {log.level}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {log.category}
              </TableCell>
              <TableCell
                className={`cursor-pointer ${
                  expandedId === log.id
                    ? "whitespace-normal break-all"
                    : "max-w-xs truncate"
                }`}
                title={expandedId !== log.id ? log.message : undefined}
                onClick={() =>
                  setExpandedId(expandedId === log.id ? null : log.id)
                }
              >
                {log.message}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {log.user?.nickname ?? "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(log.createdAt).toLocaleString("ko-KR")}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
