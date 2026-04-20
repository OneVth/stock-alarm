import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type HealthOk = { status: "ok" };
type HealthDegraded = { status: "degraded" };

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json<HealthOk>({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[health] DB check failed:", error);
    return NextResponse.json<HealthDegraded>({ status: "degraded" }, { status: 503 });
  }
}
