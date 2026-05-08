import { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const id = crypto.randomUUID();
  const entry = {
    id,
    created_at: new Date().toISOString(),
    type: data.type,
    thema: data.thema ?? null,
    fach: data.fach ?? null,
    zyklus: data.zyklus ?? null,
    kompetenz_name: data.kompetenz_name ?? null,
    framework: data.framework ?? null,
    bereich: data.bereich ?? null,
    warum: data.warum ?? null,
    aktivitaeten: data.aktivitaeten ?? null,
    aufgabe_text: data.aufgabe_text ?? null,
    rating: data.rating,
    comment: data.comment ?? null,
  };

  try {
    await put(`feedback/${id}.json`, JSON.stringify(entry), {
      access: "public",
      contentType: "application/json",
    });
  } catch {
    console.log("FEEDBACK (Blob not configured):", JSON.stringify(entry));
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
