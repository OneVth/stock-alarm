import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const nickname = body.nickname?.trim();

  if (!nickname || nickname.length < 1 || nickname.length > 20) {
    return NextResponse.json(
      { error: "닉네임은 1~20자로 입력해주세요" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { nickname },
    select: { id: true, email: true, nickname: true },
  });

  return NextResponse.json(user);
}
