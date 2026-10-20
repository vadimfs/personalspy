import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const roleFlags = {
  spy: { roleSpy: true, roleTarget: false },
  target: { roleSpy: false, roleTarget: true },
  both: { roleSpy: true, roleTarget: true },
} as const;

type Role = keyof typeof roleFlags;

const spyIdAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const maxSpyIdAttempts = 5;

function generateSpyId() {
  let id = "SPY-";
  for (let i = 0; i < 5; i++) {
    id += spyIdAlphabet[randomInt(spyIdAlphabet.length)];
  }
  return id;
}

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

  const { email, password, birthDate, role } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return error("Укажи корректный email", 400);
  }
  if (typeof password !== "string" || password.length < 8) {
    return error("Пароль должен быть не короче 8 символов", 400);
  }
  const birth = typeof birthDate === "string" ? new Date(birthDate) : null;
  if (!birth || Number.isNaN(birth.getTime()) || birth > new Date()) {
    return error("Укажи корректную дату рождения", 400);
  }
  if (typeof role !== "string" || !(role in roleFlags)) {
    return error("Выбери роль", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return error("Этот email уже зарегистрирован", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // spyId уникален в базе; при редком совпадении генерируем новый
    for (let attempt = 0; attempt < maxSpyIdAttempts; attempt++) {
      const spyId = generateSpyId();
      try {
        // Дату рождения в User не храним: в схеме она лежит в Profile,
        // который создаётся позже, на шаге анкеты
        await prisma.user.create({
          data: { spyId, email: normalizedEmail, passwordHash, ...roleFlags[role as Role] },
        });
        return Response.json({ success: true, spyId }, { status: 201 });
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") {
          throw e;
        }
        // Нарушена уникальность: либо email успели занять параллельно, либо совпал spyId
        const taken = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (taken) {
          return error("Этот email уже зарегистрирован", 409);
        }
      }
    }

    return error("Не удалось создать SPY-ID, попробуй ещё раз", 500);
  } catch (e) {
    console.error("Register failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
