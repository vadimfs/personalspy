import { findSpyCase, parseCaseId } from "@/lib/cases";
import { findCurrentUser } from "@/lib/current-user";
import { generateHints } from "@/lib/masking";

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caseId = parseCaseId((await params).id);
  if (!caseId) {
    return error("Кейс не найден", 404);
  }

  try {
    const user = await findCurrentUser();
    if (!user) {
      return error("Войди в аккаунт", 401);
    }

    // Чужой кейс отдаём как несуществующий, чтобы не раскрывать, что он есть
    const found = await findSpyCase(caseId, user.id);
    if (!found) {
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
