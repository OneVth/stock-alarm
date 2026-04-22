"use client"

import {
  Database,
  Target,
  Share2,
  Handshake,
  UserCheck,
  Headset,
} from "lucide-react"
import { LabelingCard } from "./labeling-card"

const LABELS = [
  {
    icon: Database,
    title: "처리 항목",
    summary: "이메일, 닉네임",
    detail: [
      "이메일 주소 — 회원 식별, 알림 발송",
      "닉네임 — 서비스 내 표시",
      "(자동) IP, 세션 쿠키, 이용 기록",
    ],
  },
  {
    icon: Target,
    title: "처리 목적",
    summary: "회원 식별·알림 발송",
    detail: [
      "회원 식별 및 서비스 제공",
      "주식 가격 알림 이메일 발송",
    ],
  },
  {
    icon: Share2,
    title: "제3자 제공",
    summary: "제공하지 않음",
    detail: ["법령에 따른 요청 외에는 제3자에게 제공하지 않습니다."],
  },
  {
    icon: Handshake,
    title: "처리위탁",
    summary: "Google, Cloudflare",
    detail: [
      "Google LLC — OAuth 인증 (미국)",
      "Cloudflare Inc. — CDN·DDoS 방어 (미국)",
    ],
  },
  {
    icon: UserCheck,
    title: "정보주체 권리",
    summary: "열람·정정·삭제·처리정지",
    detail: [
      "이메일(onebrotravel@gmail.com)로 행사",
      "요청 후 지체 없이 처리",
    ],
  },
  {
    icon: Headset,
    title: "고충처리",
    summary: "책임자 직접 접수",
    detail: [
      "책임자: 김형일 (운영자)",
      "이메일: onebrotravel@gmail.com",
      "분쟁조정: 1833-6972 (개인정보분쟁조정위원회)",
    ],
  },
]

export function PrivacySummary() {
  return (
    <LabelingCard
      labels={LABELS}
      layout="grid"
      density="comfortable"
      iconSet="none"
      className="mb-12"
    />
  )
}
