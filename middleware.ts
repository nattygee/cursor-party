import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Socket.io specific handling
  if (request.nextUrl.pathname.startsWith("/api/socket")) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    return response
  }

  return NextResponse.next()
}

