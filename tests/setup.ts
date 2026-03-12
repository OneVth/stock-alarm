import { vi } from "vitest";

// NextAuth 초기화에 필요한 환경변수 stub
vi.stubEnv("NEXTAUTH_SECRET", "test-secret-at-least-32-characters-long");
vi.stubEnv("AUTH_GOOGLE_ID", "test-google-id");
vi.stubEnv("AUTH_GOOGLE_SECRET", "test-google-secret");
vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");

// Prisma mock 로드
import "./mocks/prisma";
