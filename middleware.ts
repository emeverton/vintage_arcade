import { NextRequest, NextResponse } from "next/server"
import { authorizeStagingBasic } from "./lib/staging-runtime"

export function middleware(req: NextRequest) {
  if (process.env.APP_ENV !== "staging") return NextResponse.next()
  const user = process.env.VINTAGE_STAGING_BASIC_USER || ""
  const password = process.env.VINTAGE_STAGING_BASIC_PASSWORD || ""
  if (user.length < 3 || password.length < 16) {
    return new NextResponse("Staging gate misconfigured", {
      status: 503,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    })
  }
  if (!authorizeStagingBasic(req.headers.get("authorization"), process.env)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Vintage Arcade Staging", charset="UTF-8"',
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    })
  }
  const response = NextResponse.next()
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
