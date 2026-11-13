import { DECLINE_PENALTY, findSpyCase, parseCaseId } from "@/lib/cases";
import { findCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caseId = parseCaseId((await params).id);
  if (!caseId) {
    return error("Кейс не найден", 404);
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
    if (found.status !== "active") {
      return error("Кейс уже закрыт", 410);
    }

    // Закрываем кейс только если он ещё активен — так штраф не спишется дважды.
    // Баллы не уходят в минус: списываем не больше, чем есть
    const declined = await prisma.$transaction(async (tx) => {
      const { count } = await tx.case.updateMany({
        where: { id: found.id, status: "active" },
        data: { status: "declined" },
      });
      if (count === 0) return false;
      const spy = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { points: true },
      });
      const penalty = Math.min(DECLINE_PENALTY, Math.max(spy.points, 0));
      if (penalty > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { points: { decrement: penalty } },
        });
      }
      return true;
    });
    if (!declined) {
      return error("Кейс уже закрыт", 410);
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("Case decline failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
