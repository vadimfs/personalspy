import { findSpyCase, normalizeSpyId, parseCaseId } from "@/lib/cases";
import { findCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caseId = parseCaseId((await params).id);
  if (!caseId) {
    return error("Кейс не найден", 404);
  }

  let enteredId: unknown;
  try {
    ({ enteredId } = (await request.json()) ?? {});
  } catch {
    return error("Некорректный запрос", 400);
  }
  if (typeof enteredId !== "string" || !enteredId.trim()) {
    return error("Введи ID цели", 400);
  }

  try {
    const user = await findCurrentUser();
    if (!user) {
      return error("Войди в аккаунт", 401);
    }

    const found = await findSpyCase(caseId, user.id);
    if (!found) {
      return error("Кейс не найден", 404);
    }
    if (found.status !== "active" || found.attemptsLeft <= 0) {
      return error("Кейс уже закрыт", 410);
    }

    if (normalizeSpyId(enteredId) === found.target.spyId) {
      // Условие status: "active" не даёт закрыть кейс и получить баллы дважды
      // при двух одновременных запросах
      const solved = await prisma.$transaction(async (tx) => {
        const { count } = await tx.case.updateMany({
          where: { id: found.id, status: "active" },
          data: { status: "solved" },
        });
        if (count === 0) return false;
        await tx.user.update({
          where: { id: user.id },
          data: { points: { increment: found.reward }, totalSolved: { increment: 1 } },
        });
        return true;
      });
      if (!solved) {
        return error("Кейс уже закрыт", 410);
      }
      return Response.json({ success: true, reward: found.reward });
    }

    // Неверный ID стоит одну попытку; на последней кейс проваливается
    const updated = await prisma.$transaction(async (tx) => {
      const { count } = await tx.case.updateMany({
        where: { id: found.id, status: "active", attemptsLeft: { gt: 0 } },
        data: { attemptsLeft: { decrement: 1 } },
      });
      if (count === 0) return null;
      const current = await tx.case.findUniqueOrThrow({
        where: { id: found.id },
        select: { attemptsLeft: true },
      });
      if (current.attemptsLeft === 0) {
        await tx.case.update({ where: { id: found.id }, data: { status: "failed" } });
      }
      return current.attemptsLeft;
    });
    if (updated === null) {
      return error("Кейс уже закрыт", 410);
    }

    return Response.json({
      success: false,
      message: updated > 0 ? "Не тот, ищи дальше" : "Попытки закончились, кейс провален",
      attemptsLeft: updated,
    });
  } catch (e) {
    console.error("Case check failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
