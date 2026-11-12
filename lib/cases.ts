import { prisma } from "@/lib/prisma";

export const CASE_ATTEMPTS = 10;
export const CASE_REWARD = 50;

// ID кейса из URL: положительное целое число или null
export function parseCaseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Кейс текущего шпиона вместе с анкетой цели; null — кейса нет или он чужой
export function findSpyCase(caseId: number, spyUserId: string) {
  return prisma.case.findFirst({
    where: { id: caseId, spyUserId },
    select: {
      id: true,
      status: true,
      attemptsLeft: true,
      target: { select: { spyId: true, profile: true } },
    },
  });
}

// Ввод пользователя к виду SPY-XXXXX: регистр и пробелы не важны,
// префикс «SPY-» можно не писать
export function normalizeSpyId(value: string) {
  const clean = value.trim().toUpperCase().replace(/\s+/g, "");
  return clean.startsWith("SPY-") ? clean : `SPY-${clean}`;
}
