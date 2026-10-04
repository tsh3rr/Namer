import "server-only";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

const DEVICE_COOKIE = "namer_device";

/** Read the anonymous device id, if this browser has one. */
export async function getDeviceId() {
  return (await cookies()).get(DEVICE_COOKIE)?.value ?? null;
}

/** Read or create the device id. Only callable from Server Actions. */
export async function ensureDeviceId() {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;
  const id = nanoid(24);
  jar.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: "/",
  });
  return id;
}
