"use client";

import * as React from "react";
import {
  Bell,
  BellOff,
  ChevronRight,
  Clock,
  Download,
  Home,
  BarChart2,
  LogOut,
  Mail,
  Pencil,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  TrendingUp,
  User,
  Check,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// ─── 더미 데이터 ─────────────────────────────────────────────────────────────

const USER = {
  name: "홍길동",
  email: "hong@gmail.com",
  avatarUrl: "",
  plan: "무료",
  joinDate: "2025년 11월",
  alertCount: 8,
  maxAlerts: 10,
};

const LOGIN_SESSIONS = [
  { device: "Chrome · macOS", location: "서울, KR", time: "지금", current: true },
  { device: "모바일 Safari · iOS", location: "서울, KR", time: "어제 오후 3:12" },
  { device: "Chrome · Windows", location: "부산, KR", time: "3일 전" },
];

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

/**
 * 설정 행 — 레이블 + 설명 + 오른쪽 액션 슬롯
 */
function SettingRow({
  icon: Icon,
  label,
  description,
  action,
  danger = false,
}: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  action?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5 min-h-[44px]">
      {Icon && (
        <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
          <Icon
            className={cn(
              "size-4",
              danger ? "text-destructive" : "text-muted-foreground"
            )}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            danger ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * 섹션 헤더
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground px-1 mb-2">
      {children}
    </p>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeNav, setActiveNav] = React.useState(3); // 설정 탭 활성
  const [editingNickname, setEditingNickname] = React.useState(false);
  const [nickname, setNickname] = React.useState(USER.name);
  const [nicknameDraft, setNicknameDraft] = React.useState(USER.name);

  // 알림 설정
  const [emailAlert, setEmailAlert] = React.useState(true);
  const [dailySummary, setDailySummary] = React.useState(true);
  const [marketOpen, setMarketOpen] = React.useState(false);
  const [quietHours, setQuietHours] = React.useState(true);
  const [alertCooldown, setAlertCooldown] = React.useState("60");

  // 알림 임계값 기본값
  const [defaultThreshold, setDefaultThreshold] = React.useState([5]);

  const navItems = [
    { icon: Home, label: "홈" },
    { icon: Bell, label: "알림" },
    { icon: BarChart2, label: "시장" },
    { icon: Settings, label: "설정" },
  ] as const;

  function handleNicknameSave() {
    setNickname(nicknameDraft.trim() || nickname);
    setEditingNickname(false);
  }

  function handleNicknameCancel() {
    setNicknameDraft(nickname);
    setEditingNickname(false);
  }

  return (
    <div className="relative mx-auto max-w-[430px] min-h-screen bg-muted/40">

      {/* ── TopBar ── */}
      <header className="sticky top-0 z-30 bg-muted/40 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-6 h-14">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            설정
          </h1>
          <Badge
            className="text-[10px] font-semibold tracking-wide"
            style={{
              backgroundColor: "rgba(0,82,255,0.1)",
              color: "var(--brand)",
              border: "none",
            }}
          >
            {USER.plan} 플랜
          </Badge>
        </div>
      </header>

      {/* ── 콘텐츠 ── */}
      <div className="space-y-6 pt-3 pb-28">

        {/* ── 프로필 카드 ── */}
        <div className="mx-6">
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* 프로필 헤더 — brand gradient strip */}
            <div
              className="h-2 w-full"
              style={{ background: "linear-gradient(90deg, #0052ff 0%, #578bfa 100%)" }}
            />
            <div className="px-6 py-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 ring-2 ring-[--brand]/20">
                  <AvatarImage src={USER.avatarUrl} alt={nickname} />
                  <AvatarFallback
                    className="text-xl font-bold"
                    style={{ backgroundColor: "var(--brand)", color: "#ffffff" }}
                  >
                    {nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {editingNickname ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nicknameDraft}
                        onChange={(e) => setNicknameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleNicknameSave();
                          if (e.key === "Escape") handleNicknameCancel();
                        }}
                        autoFocus
                        className="h-8 text-sm font-semibold"
                        maxLength={20}
                      />
                      <button
                        onClick={handleNicknameSave}
                        aria-label="저장"
                        className="flex items-center justify-center size-8 rounded-lg bg-[--brand] text-white hover:opacity-90 transition-opacity flex-shrink-0"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        onClick={handleNicknameCancel}
                        aria-label="취소"
                        className="flex items-center justify-center size-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex-shrink-0"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-foreground truncate">
                        {nickname}
                      </p>
                      <button
                        onClick={() => {
                          setNicknameDraft(nickname);
                          setEditingNickname(true);
                        }}
                        aria-label="닉네임 수정"
                        className="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Pencil className="size-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {USER.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="size-1.5 rounded-full bg-[--brand]" />
                    <p className="text-[10px] font-semibold text-[--brand]">
                      Google 계정 연결됨
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* 알림 사용량 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    알림 사용량
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {USER.alertCount} / {USER.maxAlerts}개
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[--brand] transition-all"
                    style={{ width: `${(USER.alertCount / USER.maxAlerts) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {USER.joinDate} 가입 · 무료 플랜은 최대 10개 알림
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 알림 설정 ── */}
        <div className="mx-6">
          <SectionLabel>알림</SectionLabel>
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 overflow-hidden">
            <SettingRow
              icon={Mail}
              label="이메일 알림"
              description="임계가 도달 시 즉시 발송"
              action={
                <Switch
                  checked={emailAlert}
                  onCheckedChange={setEmailAlert}
                  aria-label="이메일 알림 토글"
                />
              }
            />
            <Separator />
            <SettingRow
              icon={TrendingUp}
              label="일일 요약 이메일"
              description="장 마감 후 알림 현황 요약"
              action={
                <Switch
                  checked={dailySummary}
                  onCheckedChange={setDailySummary}
                  aria-label="일일 요약 토글"
                />
              }
            />
            <Separator />
            <SettingRow
              icon={Bell}
              label="장 시작 알림"
              description="오전 9시 시장 개장 알림"
              action={
                <Switch
                  checked={marketOpen}
                  onCheckedChange={setMarketOpen}
                  aria-label="장 시작 알림 토글"
                />
              }
            />
            <Separator />
            <SettingRow
              icon={BellOff}
              label="방해금지 모드"
              description="오후 6시 ~ 오전 8시"
              action={
                <Switch
                  checked={quietHours}
                  onCheckedChange={setQuietHours}
                  aria-label="방해금지 모드 토글"
                />
              }
            />
            <Separator />
            {/* 알림 재발송 간격 */}
            <div className="py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
                  <Clock className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    알림 재발송 간격
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    같은 종목 중복 알림 방지
                  </p>
                </div>
                <Select
                  value={alertCooldown}
                  onValueChange={(v) => v && setAlertCooldown(v)}
                >
                  <SelectTrigger
                    aria-label="재발송 간격 선택"
                    className="w-[90px] h-8 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="60">1시간</SelectItem>
                    <SelectItem value="180">3시간</SelectItem>
                    <SelectItem value="360">6시간</SelectItem>
                    <SelectItem value="720">12시간</SelectItem>
                    <SelectItem value="1440">24시간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* ── 알림 기본값 ── */}
        <div className="mx-6">
          <SectionLabel>알림 기본값</SectionLabel>
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  기본 임계값
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  새 알림 등록 시 기본 ±% 설정
                </p>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-foreground">
                  {defaultThreshold[0]}
                </span>
                <span className="text-sm font-medium text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              min={1}
              max={20}
              step={1}
              value={defaultThreshold}
              onValueChange={(val) =>
                setDefaultThreshold(Array.isArray(val) ? [val[0] as number] : [val as number])
              }
              aria-label="기본 임계값 슬라이더"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">1%</span>
              <span className="text-[10px] text-muted-foreground">20%</span>
            </div>
            <div className="mt-4 flex gap-2">
              {[3, 5, 7, 10].map((v) => (
                <button
                  key={v}
                  onClick={() => setDefaultThreshold([v])}
                  className={cn(
                    "flex-1 h-8 rounded-lg text-xs font-semibold transition-colors",
                    defaultThreshold[0] === v
                      ? "bg-[--brand] text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 보안 ── */}
        <div className="mx-6">
          <SectionLabel>보안</SectionLabel>
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* 로그인 세션 */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
                  <Smartphone className="size-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">로그인 세션</p>
              </div>
              <div className="space-y-2.5 pl-11">
                {LOGIN_SESSIONS.map((session, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-foreground truncate">
                          {session.device}
                        </p>
                        {session.current && (
                          <Badge
                            className="text-[9px] font-bold tracking-wide px-1.5 py-0"
                            style={{
                              backgroundColor: "rgba(0,82,255,0.1)",
                              color: "var(--brand)",
                              border: "none",
                              height: "16px",
                            }}
                          >
                            현재
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {session.location} · {session.time}
                      </p>
                    </div>
                    {!session.current && (
                      <button className="text-[10px] font-semibold text-destructive hover:opacity-80 transition-opacity flex-shrink-0 min-h-[44px] flex items-center px-1">
                        종료
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mx-5" />

            {/* 보안 메뉴 항목들 */}
            <div className="px-5">
              <button className="w-full flex items-center gap-3 py-3.5 min-h-[44px] text-left hover:bg-muted/30 transition-colors -mx-5 px-5">
                <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
                  <Shield className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    2단계 인증
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    이메일 OTP 인증 사용 안 함
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 데이터 & 개인정보 ── */}
        <div className="mx-6">
          <SectionLabel>데이터 & 개인정보</SectionLabel>
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-3 pt-3.5">
                <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
                  <Clock className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    이력 보관 기간
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    알림 발동 이력 보관 기간
                  </p>
                </div>
                <Select defaultValue="90">
                  <SelectTrigger
                    aria-label="보관 기간 선택"
                    className="w-[80px] h-8 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30일</SelectItem>
                    <SelectItem value="90">90일</SelectItem>
                    <SelectItem value="180">180일</SelectItem>
                    <SelectItem value="365">1년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <button className="w-full flex items-center gap-3 py-3.5 min-h-[44px] text-left hover:bg-muted/30 transition-colors -mx-5 px-5">
              <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
                <Download className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  데이터 내보내기
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  알림 이력 CSV 다운로드
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
            </button>

            <Separator />

            {/* 이력 초기화 */}
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button className="w-full flex items-center gap-3 py-3.5 min-h-[44px] text-left hover:bg-muted/30 transition-colors -mx-5 px-5" />
                }
              >
                <div className="flex-shrink-0 size-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="size-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    알림 이력 초기화
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    모든 발동 이력 삭제
                  </p>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>알림 이력 초기화</AlertDialogTitle>
                  <AlertDialogDescription>
                    모든 알림 발동 이력이 영구 삭제됩니다. 이 작업은 되돌릴 수
                    없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">초기화</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ── 앱 정보 ── */}
        <div className="mx-6">
          <SectionLabel>앱 정보</SectionLabel>
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 overflow-hidden">
            <SettingRow
              icon={User}
              label="버전"
              action={
                <span className="text-xs text-muted-foreground font-medium">
                  v2.1.0
                </span>
              }
            />
            <Separator />
            <SettingRow
              icon={Shield}
              label="서비스 약관"
              action={<ChevronRight className="size-4 text-muted-foreground" />}
            />
            <Separator />
            <SettingRow
              icon={Shield}
              label="개인정보 처리방침"
              action={<ChevronRight className="size-4 text-muted-foreground" />}
            />
          </div>
        </div>

        {/* ── 계정 ── */}
        <div className="mx-6">
          <SectionLabel>계정</SectionLabel>
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 overflow-hidden">
            <button className="w-full flex items-center gap-3 py-3.5 min-h-[44px] text-left hover:bg-muted/30 transition-colors -mx-5 px-5">
              <div className="flex-shrink-0 size-8 rounded-xl bg-muted/60 flex items-center justify-center">
                <LogOut className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">로그아웃</p>
            </button>

            <Separator />

            {/* 계정 삭제 */}
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button className="w-full flex items-center gap-3 py-3.5 min-h-[44px] text-left hover:bg-destructive/5 transition-colors -mx-5 px-5" />
                }
              >
                <div className="flex-shrink-0 size-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="size-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    계정 삭제
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    모든 데이터 영구 삭제
                  </p>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>계정을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    계정과 모든 알림 데이터가 영구적으로 삭제됩니다. 이 작업은
                    되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

      </div>

      {/* ── Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-card/95 backdrop-blur-sm border-t border-border/50 pb-[env(safe-area-inset-bottom)]"
        aria-label="주 메뉴"
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ icon: Icon, label }, idx) => (
            <button
              key={label}
              onClick={() => setActiveNav(idx)}
              aria-label={label}
              aria-current={activeNav === idx ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-3 py-2 transition-colors rounded-xl",
                activeNav === idx
                  ? "text-[--brand]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-semibold tracking-[0.05em]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
