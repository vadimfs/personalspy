import type { Profile } from "@prisma/client";
import type { Difficulty } from "@/lib/difficulty";
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
  | "city"
  | "eduUniversity"
  | "eduFaculty"
  | "eduLevel"
  | "eduCourse"
  | "workSphere"
  | "socials"
>;

type HintKind = "gender" | "age" | "city" | "occupation" | "name" | "networks" | "telegram";

// Чем выше сложность, тем меньше подсказок:
// easy — 6–7, medium — 4–5 (без имени), hard — 3, insane — 1–2
const hintsByDifficulty: Record<Difficulty, HintKind[]> = {
  easy: ["gender", "age", "occupation", "name", "networks", "telegram"],
  medium: ["gender", "age", "occupation", "networks"],
  hard: ["gender", "age", "occupation"],
  insane: ["gender", "city"],
};

function genderHint(profile: HintProfile) {
  if (profile.gender === "male") return ["Пол: мужской"];
  if (profile.gender === "female") return ["Пол: женский"];
  return [];
}

// Год маскируем до десятилетия, месяц пишем словами: «март 2000-х»
function ageHint(profile: HintProfile) {
  const month = months[profile.birthDate.getUTCMonth()];
  const decade = Math.floor(profile.birthDate.getUTCFullYear() / 10) * 10;
  return [`Возраст: ${month} ${decade}-х`];
}

function cityHint(profile: HintProfile) {
  return profile.city ? [`Город: ${profile.city}`] : [];
}

// Учёба, а если цель не учится — сфера работы
function occupationHint(profile: HintProfile) {
  const education = [
    profile.eduUniversity,
    profile.eduFaculty,
    profile.eduLevel?.toLowerCase(),
    profile.eduCourse ? `${profile.eduCourse} курс` : null,
  ].filter(Boolean);
  if (education.length > 0) return [education.join(", ")];
  return profile.workSphere ? [`Сфера: ${profile.workSphere}`] : [];
}

function nameHint(profile: HintProfile) {
  const name = profile.firstName.trim();
  if (!name) return [];
  const length = [...name].length;
  return [`Имя: начинается на «${name[0].toUpperCase()}», ${length} ${pluralLetters(length)}`];
}

function networksHint(profile: HintProfile) {
  return readSocials(profile.socials).networks.flatMap((account) => {
    const masked = typeof account?.nick === "string" ? maskNick(account.nick) : null;
    if (!masked) return [];
    const label = account.network === "Другое" ? "Соцсеть" : account.network;
    return [`${label}: ${masked}`];
  });
}

function telegramHint(profile: HintProfile) {
  const { telegram } = readSocials(profile.socials);
  const masked = telegram ? maskNick(telegram) : null;
  return masked ? [`Telegram: ${masked}`] : [];
}

const hintBuilders: Record<HintKind, (profile: HintProfile) => string[]> = {
  gender: genderHint,
  age: ageHint,
  city: cityHint,
  occupation: occupationHint,
  name: nameHint,
  networks: networksHint,
  telegram: telegramHint,
};

// Подсказки о цели без прямых данных: фамилия, точная дата рождения,
// место работы и полные ники не раскрываются. Набор зависит от сложности
export function generateHints(profile: HintProfile, difficulty: Difficulty): string[] {
  return hintsByDifficulty[difficulty].flatMap((kind) => hintBuilders[kind](profile));
}
