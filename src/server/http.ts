import "server-only";
import { NextResponse } from "next/server";
import { InputError } from "./bracelets";

/** Mutating requests must come from our own pages (cookie-CSRF guard). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export function fail(e: unknown) {
  if (e instanceof InputError) return json({ error: e.message }, 400);
  console.error(e);
  return json({ error: "Something went wrong." }, 500);
}

export async function body<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new InputError("Invalid request.");
  }
}
