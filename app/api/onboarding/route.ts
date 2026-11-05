import { findCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  eduLevels,
  genders,
  hasDuplicateNetworks,
  networks,
  type SocialAccount,
  type Socials,
} from "@/lib/onboarding";

const maxLength = 200;

class ValidationError extends Error {}

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

// Обязательная строка: обрезает пробелы, не пустая и не длиннее лимита
function requiredString(value: unknown, message: string) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new ValidationError(message);
  }
  return value.trim();
}

// Необязательная строка: пустое значение превращается в null
function optionalString(value: unknown, message: string) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new ValidationError(message);
  }
  return value.trim() || null;
}

function stripAt(nick: string) {
  return nick.replace(/^@+/, "");
}

function parseSocials(value: unknown): Socials {
  const { networks: accounts, telegram } = (value ?? {}) as Record<string, unknown>;
  if (!Array.isArray(accounts) || accounts.length !== 2) {
    throw new ValidationError("Укажи две соцсети");
  }
  const parsed: SocialAccount[] = accounts.map((account) => {
    const { network, link, nick } = (account ?? {}) as Record<string, unknown>;
    if (typeof network !== "string" || !networks.includes(network)) {
      throw new ValidationError("Выбери соцсеть из списка");
    }
    return {
      network,
      link: requiredString(link, "Укажи ссылку на профиль в соцсети"),
      nick: stripAt(requiredString(nick, "Укажи ник в соцсети")),
    };
  });
  if (hasDuplicateNetworks(parsed)) {
    throw new ValidationError("Соцсети должны быть разными");
  }
  const telegramNick = optionalString(telegram, "Некорректный ник в Telegram");
  return { networks: parsed, telegram: telegramNick ? stripAt(telegramNick) : null };
}

function parseProfile(body: Record<string, unknown>) {
  const firstName = requiredString(body.firstName, "Укажи имя");
  const lastName = requiredString(body.lastName, "Укажи фамилию");

  const birthDate = typeof body.birthDate === "string" ? new Date(body.birthDate) : null;
  if (!birthDate || Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
    throw new ValidationError("Укажи корректную дату рождения");
  }

  if (typeof body.gender !== "string" || !(genders as readonly string[]).includes(body.gender)) {
    throw new ValidationError("Выбери пол");
  }

  const city = optionalString(body.city, "Некорректный город") ?? "Москва";

  const eduLevel = optionalString(body.eduLevel, "Некорректный уровень обучения");
  if (eduLevel && !eduLevels.includes(eduLevel)) {
    throw new ValidationError("Выбери уровень обучения из списка");
  }

  let eduCourse: number | null = null;
  if (body.eduCourse !== undefined && body.eduCourse !== null && body.eduCourse !== "") {
    eduCourse = Number(body.eduCourse);
    if (!Number.isInteger(eduCourse) || eduCourse < 1 || eduCourse > 6) {
      throw new ValidationError("Курс должен быть от 1 до 6");
    }
  }

  const eduUniversity = optionalString(body.eduUniversity, "Некорректное название вуза");
  const eduFaculty = optionalString(body.eduFaculty, "Некорректный факультет");
  const workPlace = optionalString(body.workPlace, "Некорректное место работы");
  const workSphere = optionalString(body.workSphere, "Некорректная сфера или должность");

  return {
    firstName,
    lastName,
    birthDate,
    gender: body.gender,
    city,
    eduUniversity,
    eduFaculty,
    eduLevel,
    eduCourse,
    workPlace,
    workSphere,
    socials: parseSocials(body.socials),
    uniqueDetail: optionalString(body.uniqueDetail, "Слишком длинная деталь"),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Некорректный запрос", 400);
  }

  let data: ReturnType<typeof parseProfile>;
  try {
    data = parseProfile((body ?? {}) as Record<string, unknown>);
  } catch (e) {
    if (e instanceof ValidationError) return error(e.message, 400);
    throw e;
  }

  try {
    // getCurrentUser() перенаправляет на /login, а API должен ответить JSON,
    // поэтому здесь берём пользователя без редиректа
    const user = await findCurrentUser();
    if (!user) {
      return error("Войди в аккаунт, чтобы сохранить анкету", 401);
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error("Onboarding save failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
