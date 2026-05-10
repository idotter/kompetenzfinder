import { list } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "queries/" });
    const entries = await Promise.all(
      blobs.map(async (blob) => {
        const res = await fetch(blob.url);
        return res.json();
      })
    );
    entries.sort((a, b) => b.created_at?.localeCompare(a.created_at ?? "") ?? 0);
    return new Response(JSON.stringify(entries), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Blob not configured" }), { status: 500 });
  }
}
