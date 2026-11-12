import type { Prisma } from "@prisma/client";
import { findCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function error(message: string, status: number) {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return error("Войди в аккаунт, чтобы получить цель", 401);
    }
    if (!user.roleSpy) {
      return error("Включи роль шпиона в профиле, чтобы получать цели", 403);
    }

    // Подходящая цель: не сам шпион, с заполненной анкетой, играет как цель
    // и ещё не выдана этому шпиону в активном кейсе
    const where: Prisma.UserWhereInput = {
      id: { not: user.id },
      roleTarget: true,
      profile: { isNot: null },
      targetCases: { none: { spyUserId: user.id, status: "active" } },
    };

    const available = await prisma.user.count({ where });
    if (available === 0) {
      return error("Сейчас нет доступных целей, попробуй позже", 404);
    }

    const [target] = await prisma.user.findMany({
      where,
      select: { id: true },
      orderBy: { id: "asc" },
      skip: Math.floor(Math.random() * available),
      take: 1,
    });
    if (!target) {
      return error("Сейчас нет доступных целей, попробуй позже", 404);
    }

    const newCase = await prisma.case.create({
      data: { spyUserId: user.id, targetUserId: target.id, status: "active" },
      select: { id: true },
    });

    return Response.json({ success: true, caseId: newCase.id }, { status: 201 });
  } catch (e) {
    console.error("Case creation failed:", e);
    return error("Ошибка сервера, попробуй позже", 500);
  }
}
