import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "qmf_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type SessionPayload = { expiresAt: number };

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET precisa ter pelo menos 32 caracteres.");
  }
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return false;

  const submittedHash = createHash("sha256").update(password).digest();
  const configuredHash = createHash("sha256").update(configuredPassword).digest();
  return timingSafeEqual(submittedHash, configuredHash);
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ expiresAt } satisfies SessionPayload)).toString("base64url");
  return { value: `${payload}.${signature(payload)}`, maxAge: SESSION_DURATION_SECONDS };
}

export function isAdminRequest(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
    if (!cookie) return false;

    const token = decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1));
    const [payload, suppliedSignature] = token.split(".");
    if (!payload || !suppliedSignature) return false;

    const expectedSignature = signature(payload);
    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    return Number.isInteger(session.expiresAt) && session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(response: NextResponse) {
  const session = createAdminSession();
  response.cookies.set(COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function adminRequired() {
  return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
}

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type PrayerInput = {
  title: string;
  category: string;
  verse: string;
  reference: string;
  content: string;
  day_number: number | null;
  reading_minutes: number;
  sort_order: number;
  published: boolean;
};

export function parsePrayerInput(value: unknown): PrayerInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const text = (key: string, maxLength: number) => {
    const field = input[key];
    return typeof field === "string" && field.trim().length <= maxLength ? field.trim() : null;
  };

  const title = text("title", 160);
  const category = text("category", 100);
  const verse = text("verse", 500);
  const reference = text("reference", 120);
  const content = text("content", 50000);
  const day = input.day_number === "" || input.day_number === null || input.day_number === undefined
    ? null
    : Number(input.day_number);
  const readingMinutes = Number(input.reading_minutes);
  const sortOrder = Number(input.sort_order);
  const published = input.published;

  if (!title || !content || category === null || verse === null || reference === null) return null;
  if (day !== null && (!Number.isInteger(day) || day < 1 || day > 365)) return null;
  if (!Number.isInteger(readingMinutes) || readingMinutes < 1 || readingMinutes > 120) return null;
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999999) return null;
  if (typeof published !== "boolean") return null;

  return {
    title,
    category,
    verse,
    reference,
    content,
    day_number: day,
    reading_minutes: readingMinutes,
    sort_order: sortOrder,
    published,
  };
}
