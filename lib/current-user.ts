import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Для серверных страниц, доступных только после входа: возвращает
// пользователя из базы или перенаправляет на /login, если сессии нет,
// она истекла или пользователь уже удалён из базы
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      spyId: true,
      points: true,
      totalSolved: true,
      roleSpy: true,
      roleTarget: true,
      profile: { select: { firstName: true, birthDate: true } },
    },
  });
  if (!user) redirect("/login");

  return user;
}
