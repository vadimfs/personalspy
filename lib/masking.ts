import type { Profile } from "@prisma/client";
import type { Socials } from "@/lib/onboarding";

const months = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

// 1 буква, 2 буквы, 5 букв, 11 букв, 21 буква
function pluralLetters(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "буква";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "буквы";
  return "букв";
}

// Оставляем первый и последний символ ника: anton → a***n
function maskNick(nick: string) {
  const clean = nick.trim().replace(/^@+/, "");
  if (!clean) return null;
  if (clean.length <= 2) return `@${clean[0]}***`;
  return `@${clean[0]}***${clean[clean.length - 1]}`;
}

// Соцсети лежат в JSON — читаем осторожно, на случай неполных данных
function readSocials(value: unknown): Socials {
  const { networks, telegram } = (value ?? {}) as Partial<Socials>;
  return {
    networks: Array.isArray(networks) ? networks : [],
    telegram: typeof telegram === "string" ? telegram : null,
  };
}

type HintProfile = Pick<
  Profile,
  | "firstName"
  | "birthDate"
  | "gender"
  | "eduUniversity"
  | "eduFaculty"
  | "eduLevel"
  | "eduCourse"
  | "workSphere"
  | "socials"
  | "uniqueDetail"
>;

// Подсказки о цели без прямых данных: фамилия, точная дата рождения,
// место работы и полные ники не раскрываются
export function generateHints(profile: HintProfile): string[] {
  const hints: string[] = [];

  if (profile.gender === "male") hints.push("Пол: мужской");
  else if (profile.gender === "female") hints.push("Пол: женский");

  // Год маскируем до десятилетия, месяц пишем словами: «март 2000-х»
  const month = months[profile.birthDate.getUTCMonth()];
  const decade = Math.floor(profile.birthDate.getUTCFullYear() / 10) * 10;
  hints.push(`Возраст: ${month} ${decade}-х`);

  const education = [
    profile.eduUniversity,
    profile.eduFaculty,
    profile.eduLevel?.toLowerCase(),
    profile.eduCourse ? `${profile.eduCourse} курс` : null,
  ].filter(Boolean);
  if (education.length > 0) hints.push(education.join(", "));

  if (profile.workSphere) hints.push(`Сфера: ${profile.workSphere}`);

  const name = profile.firstName.trim();
  if (name) {
    const length = [...name].length;
    hints.push(
      `Имя: начинается на «${name[0].toUpperCase()}», ${length} ${pluralLetters(length)}`,
    );
  }

  const socials = readSocials(profile.socials);
  for (const account of socials.networks) {
    const masked = typeof account?.nick === "string" ? maskNick(account.nick) : null;
    if (!masked) continue;
    const label = account.network === "Другое" ? "Соцсеть" : account.network;
    hints.push(`${label}: ${masked}`);
  }
  if (socials.telegram) {
    const masked = maskNick(socials.telegram);
    if (masked) hints.push(`Telegram: ${masked}`);
  }

  if (profile.uniqueDetail) hints.push(`Деталь: ${profile.uniqueDetail}`);

  return hints;
}
