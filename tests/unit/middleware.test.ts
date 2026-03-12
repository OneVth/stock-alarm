import { describe, it, expect, vi } from "vitest";
import { resolveAuthRedirect } from "@/lib/auth-middleware";

describe("resolveAuthRedirect", () => {
  // /login
  describe("/login", () => {
    it("비로그인 시 통과한다", () => {
      const result = resolveAuthRedirect("/login", false, []);
      expect(result).toEqual({ type: "pass" });
    });

    it("로그인 시 /dashboard로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/login", true, ["user"]);
      expect(result).toEqual({ type: "redirect", destination: "/dashboard" });
    });
  });

  // /dashboard
  describe("/dashboard", () => {
    it("비로그인 시 /login으로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/dashboard", false, []);
      expect(result).toEqual({ type: "redirect", destination: "/login" });
    });

    it("로그인 시 통과한다", () => {
      const result = resolveAuthRedirect("/dashboard", true, ["user"]);
      expect(result).toEqual({ type: "pass" });
    });

    it("/dashboard/stock/123 비로그인 시 /login으로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/dashboard/stock/123", false, []);
      expect(result).toEqual({ type: "redirect", destination: "/login" });
    });
  });

  // /settings
  describe("/settings", () => {
    it("비로그인 시 /login으로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/settings", false, []);
      expect(result).toEqual({ type: "redirect", destination: "/login" });
    });

    it("로그인 시 통과한다", () => {
      const result = resolveAuthRedirect("/settings", true, ["user"]);
      expect(result).toEqual({ type: "pass" });
    });
  });

  // /admin
  describe("/admin", () => {
    it("비로그인 시 /login으로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/admin", false, []);
      expect(result).toEqual({ type: "redirect", destination: "/login" });
    });

    it("user 역할만 있으면 /dashboard로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/admin", true, ["user"]);
      expect(result).toEqual({ type: "redirect", destination: "/dashboard" });
    });

    it("admin 역할이면 통과한다", () => {
      const result = resolveAuthRedirect("/admin", true, ["user", "admin"]);
      expect(result).toEqual({ type: "pass" });
    });

    it("/admin/users 비로그인 시 /login으로 리다이렉트한다", () => {
      const result = resolveAuthRedirect("/admin/users", false, []);
      expect(result).toEqual({ type: "redirect", destination: "/login" });
    });
  });

  // /showcase
  describe("/showcase", () => {
    it("개발 환경에서 통과한다", () => {
      const result = resolveAuthRedirect("/showcase", false, [], "development");
      expect(result).toEqual({ type: "pass" });
    });

    it("프로덕션 환경에서 404로 rewrite한다", () => {
      const result = resolveAuthRedirect("/showcase", false, [], "production");
      expect(result).toEqual({ type: "rewrite-404" });
    });
  });

  // 기타
  describe("기타 경로", () => {
    it("/ 경로는 통과한다", () => {
      const result = resolveAuthRedirect("/", false, []);
      expect(result).toEqual({ type: "pass" });
    });
  });
});
