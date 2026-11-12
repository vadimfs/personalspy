import { findCurrentUser } from "@/lib/current-user";
import { generateHints } from "@/lib/masking";
import { prisma } from "@/lib/prisma";

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseId = Number(id);
  if (!Number.isInteger(caseId) || caseId <= 0) {
    return error("Кейс не найден", 404);
  }

  try {
    const user = await findCurrentUser();
    if (!user) {
      return error("Войди в аккаунт", 401);
    }

    const found = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        spyUserId: true,
        status: true,
        attemptsLeft: true,
        target: { select: { profile: true } },
      },
    });

    // Чужой кейс отдаём как несуществующий, чтобы не раскрывать, что он есть
    if (!found || found.spyUserId !== user.id) {
      return error("Кейс не найден", 404);
    }
    if (found.status !== "active") {
      return error("Кейс уже закрыт", 410);
    }
    if (!found.target.profile) {
      return error("Цель удалила анкету, кейс недоступен", 410);
    }

    return Response.json({
      caseId: found.id,
      hints: generateHints(found.target.profile),
      attemptsLeft: found.attemptsLeft,
    });
  } catch (e) {
    console.error("Case fetch failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
