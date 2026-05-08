import { NextRequest, NextResponse } from "next/server";

// In-memory store: ip → { count, resetAt }
// Shared within a single Edge instance; provides meaningful protection against scripted abuse
const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 20;           // per IP per window

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;

  entry.count++;
  return false;
}

// Periodically clean up expired entries to prevent unbounded memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store) {
      if (now > entry.resetAt) store.delete(ip);
    }
  }, WINDOW_MS);
}

export function middleware(req: NextRequest) {
  const ip = getIp(req);

  if (isRateLimited(ip)) {
    return new NextResponse(
      JSON.stringify({ error: "Zu viele Anfragen. Bitte warte einen Moment." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/analyse", "/api/aufgabe"],
};
