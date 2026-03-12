import { beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import { vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 클라이언트 딥 모크.
 *
 * 모든 Prisma 메서드를 자동으로 모킹하여 DB 연결 없이 테스트할 수 있습니다.
 */
export const prismaMock = mockDeep<PrismaClient>();

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});
