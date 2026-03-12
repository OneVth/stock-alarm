import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "../mocks/prisma";
import { handleSignIn } from "@/lib/auth-callbacks";

/** 테스트용 기본 사용자 */
function makeUser(overrides?: Partial<{ email: string | null; name: string | null; image: string | null }>) {
  return {
    email: "test@example.com",
    name: "Test User",
    image: "https://example.com/photo.jpg",
    ...overrides,
  };
}

/** 테스트용 기본 계정 */
function makeAccount(overrides?: Partial<{ provider: string; providerAccountId: string }>) {
  return {
    provider: "google",
    providerAccountId: "google-id-123",
    ...overrides,
  };
}

describe("handleSignIn", () => {
  // 1. non-Google 프로바이더 거부
  it("non-Google 프로바이더를 거부한다", async () => {
    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount({ provider: "github" }),
    });
    expect(result).toBe(false);
  });

  // 2. account가 null이면 거부
  it("account가 null이면 거부한다", async () => {
    const result = await handleSignIn({
      user: makeUser(),
      account: null,
    });
    expect(result).toBe(false);
  });

  // 3. email이 없으면 거부
  it("email이 없으면 거부한다", async () => {
    const result = await handleSignIn({
      user: makeUser({ email: null }),
      account: makeAccount(),
    });
    expect(result).toBe(false);
  });

  // 4. googleId로 기존 사용자 찾음
  it("googleId로 기존 사용자를 찾으면 허용한다", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "test@example.com",
      nickname: "Test",
      image: null,
      googleId: "google-id-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount(),
    });
    expect(result).toBe(true);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { googleId: "google-id-123" },
    });
  });

  // 5. 이메일로 기존 사용자 찾음 → googleId 연동
  it("이메일로 기존 사용자를 찾으면 googleId를 연동하고 허용한다", async () => {
    // googleId 조회 실패
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    // 이메일 조회 성공
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "user-2",
      email: "test@example.com",
      nickname: "Test",
      image: null,
      googleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount(),
    });
    expect(result).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: { googleId: "google-id-123" },
    });
  });

  // 6. 신규 사용자 생성 + user 역할 부여
  it("신규 사용자를 생성하고 user 역할을 부여한다", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null); // googleId 조회
    prismaMock.user.findUnique.mockResolvedValueOnce(null); // 이메일 조회
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role-user",
      name: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount(),
    });
    expect(result).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        nickname: "Test User",
        image: "https://example.com/photo.jpg",
        googleId: "google-id-123",
        userRoles: {
          create: [{ roleId: "role-user" }],
        },
      },
    });
  });

  // 7. user 역할이 DB에 없으면 거부
  it("user 역할이 DB에 없으면 거부한다", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.role.findUnique.mockResolvedValueOnce(null); // user 역할 없음

    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount(),
    });
    expect(result).toBe(false);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  // 8. ADMIN_EMAILS 포함 → admin 역할도 부여
  it("ADMIN_EMAILS에 포함된 이메일이면 admin 역할도 부여한다", async () => {
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com,test@example.com");

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role-user",
      name: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role-admin",
      name: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount(),
    });
    expect(result).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userRoles: {
          create: [{ roleId: "role-user" }, { roleId: "role-admin" }],
        },
      }),
    });

    vi.unstubAllEnvs();
  });

  // 9. ADMIN_EMAILS 미포함 → user 역할만
  it("ADMIN_EMAILS에 미포함이면 user 역할만 부여한다", async () => {
    vi.stubEnv("ADMIN_EMAILS", "other-admin@example.com");

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role-user",
      name: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await handleSignIn({
      user: makeUser(),
      account: makeAccount(),
    });
    expect(result).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userRoles: {
          create: [{ roleId: "role-user" }],
        },
      }),
    });

    vi.unstubAllEnvs();
  });

  // 10. name이 null이면 이메일 로컬파트를 nickname으로
  it("name이 null이면 이메일 로컬파트를 nickname으로 사용한다", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role-user",
      name: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await handleSignIn({
      user: makeUser({ name: null }),
      account: makeAccount(),
    });
    expect(result).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nickname: "test",
      }),
    });
  });
});
