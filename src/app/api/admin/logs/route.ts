import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { LogLevel, Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 20;

/**
 * GET /api/admin/logs
 *
 * 시스템 로그를 필터 + 페이지네이션으로 조회합니다. (admin 전용)
 */
export async function GET(request: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const level = searchParams.get("level") as LogLevel | null;
  const category = searchParams.get("category");

  const where: Prisma.SystemLogWhereInput = {};
  if (level && ["ERROR", "WARN", "INFO"].includes(level)) {
    where.level = level;
  }
  if (category) {
    where.category = category;
  }

  const [logs, totalCount, categoryResults] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      include: {
        user: { select: { nickname: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.systemLog.count({ where }),
    prisma.systemLog.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return NextResponse.json({
    logs: logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    categories: categoryResults.map((c) => c.category),
  });
}
