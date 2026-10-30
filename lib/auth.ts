import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней, в секундах

export type Session = { userId: string; spyId: string };

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

// Создаёт подписанный JWT с id пользователя и его SPY-ID; живёт 7 дней
export async function createSession(userId: string, spyId: string) {
  return new SignJWT({ spyId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

// Читает JWT из cookie; null, если cookie нет, подпись неверна или срок истёк
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.spyId !== "string") {
      return null;
    }
    return { userId: payload.sub, spyId: payload.spyId };
  } catch {
    return null;
  }
}
