import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "설정 | Stock Alarm",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, nickname: true, image: true },
  });

  if (!user) redirect("/login");

  return <SettingsClient user={JSON.parse(JSON.stringify(user))} />;
}
