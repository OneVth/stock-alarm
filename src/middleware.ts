import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { resolveAuthRedirect } from "@/lib/auth-middleware";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const roles = (req.auth?.user as { roles?: string[] })?.roles ?? [];
  const nodeEnv = process.env.NODE_ENV ?? "production";

  const result = resolveAuthRedirect(pathname, isLoggedIn, roles, nodeEnv);

  switch (result.type) {
    case "redirect": {
      const url = req.nextUrl.clone();
      url.pathname = result.destination;
      return NextResponse.redirect(url);
    }
    case "rewrite-404": {
      const url = req.nextUrl.clone();
      url.pathname = "/not-found";
      return NextResponse.rewrite(url);
    }
    case "pass":
      return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/admin/:path*",
    "/showcase/:path*",
  ],
};
