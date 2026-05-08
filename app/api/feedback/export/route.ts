import { list } from "@vercel/blob";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "feedback/" });
    const entries = await Promise.all(
      blobs.map(async (blob) => {
        const res = await fetch(blob.url);
        return res.json();
      })
    );
    entries.sort((a, b) => a.created_at?.localeCompare(b.created_at ?? "") ?? 0);
    return new Response(JSON.stringify(entries, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="feedback.json"',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Blob not configured" }), { status: 500 });
  }
}
