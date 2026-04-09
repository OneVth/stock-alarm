"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldIcon, ShieldOffIcon } from "lucide-react";
import { RoleChangeDialog } from "./role-change-dialog";

import type { AdminUser } from "@/types/admin";

interface UserManagementTableProps {
  /** 사용자 목록 */
  users: AdminUser[];
  /** 현재 로그인한 사용자 ID (자기 자신 보호용) */
  currentUserId: string;
}

/**
 * 사용자 관리 테이블
 *
 * 사용자 목록을 표시하고 역할 변경 기능을 제공합니다.
 */
export function UserManagementTable({
  users,
  currentUserId,
}: UserManagementTableProps) {
  const [dialogUser, setDialogUser] = useState<AdminUser | null>(null);
  const [dialogAction, setDialogAction] = useState<"grant" | "revoke">("grant");

  const openDialog = (user: AdminUser, action: "grant" | "revoke") => {
    setDialogUser(user);
    setDialogAction(action);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>사용자</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead className="text-right">알림 수</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                사용자가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isAdmin = user.roles.includes("admin");
              const isSelf = user.id === currentUserId;
              const initials = (user.nickname || user.email)
                .charAt(0)
                .toUpperCase();

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.nickname} />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-base font-medium">
                          {user.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={role === "admin" ? "default" : "secondary"}
                        className="mr-1"
                      >
                        {role}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {user._count.alerts}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => openDialog(user, "revoke")}
                      >
                        <ShieldOffIcon />
                        해제
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(user, "grant")}
                      >
                        <ShieldIcon />
                        부여
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <RoleChangeDialog
        user={dialogUser}
        action={dialogAction}
        onClose={() => setDialogUser(null)}
      />
    </>
  );
}
