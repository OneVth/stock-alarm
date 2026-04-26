import { User, Database, Info, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SettingsTabId = "profile" | "data" | "app-info" | "account";

export interface SettingsTab {
  id: SettingsTabId;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
}

export const SETTINGS_TABS: readonly SettingsTab[] = [
  { id: "profile",  label: "프로필",          mobileLabel: "프로필",  icon: User },
  { id: "data",     label: "데이터 & 개인정보", mobileLabel: "데이터",  icon: Database },
  { id: "app-info", label: "앱 정보",         mobileLabel: "앱 정보", icon: Info },
  { id: "account",  label: "계정",            mobileLabel: "계정",    icon: UserCircle },
] as const;
