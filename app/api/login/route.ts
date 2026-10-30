import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSession } from "@/lib/auth";

const invalidCredentials = "Неверный email или пароль";

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Некорректный запрос", 400);
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return error("Укажи email и пароль", 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, spyId: true, passwordHash: true },
    });

    // Одинаковый ответ для «нет пользователя» и «неверный пароль»,
    // чтобы по ошибке нельзя было узнать, зарегистрирован ли email
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return error(invalidCredentials, 401);
    }

    const token = await createSession(user.id, user.spyId);
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return Response.json({ success: true, spyId: user.spyId });
  } catch (e) {
    console.error("Login failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
