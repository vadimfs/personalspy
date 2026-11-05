import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Пользователь текущей сессии или null, если сессии нет, она истекла
// или пользователь уже удалён из базы. Подходит для API-роутов
export async function findCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      spyId: true,
      points: true,
      totalSolved: true,
      roleSpy: true,
      roleTarget: true,
      profile: { select: { firstName: true, birthDate: true } },
    },
  });
}

// Для серверных страниц, доступных только после входа: возвращает
// пользователя или перенаправляет на /login
export async function getCurrentUser() {
  const user = await findCurrentUser();
  if (!user) redirect("/login");
  return user;
}
