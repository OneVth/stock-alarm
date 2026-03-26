import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface RecentUsersTableProps {
  /** 최근 가입 사용자 목록 */
  users: {
    id: string;
    email: string;
    nickname: string;
    createdAt: string;
    _count: { alerts: number };
  }[];
}

/**
 * 최근 가입 사용자 테이블
 *
 * 최근 가입한 사용자 5명을 이메일, 닉네임, 알림 수, 가입일 컬럼으로 표시합니다.
 */
export function RecentUsersTable({ users }: RecentUsersTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이메일</TableHead>
              <TableHead>닉네임</TableHead>
              <TableHead className="text-right">알림</TableHead>
              <TableHead>가입일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  가입한 사용자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">{user.nickname}</TableCell>
                  <TableCell className="text-right text-sm">
                    {user._count.alerts}개
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-right">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          전체 보기 →
        </Link>
      </div>
    </div>
  );
}
