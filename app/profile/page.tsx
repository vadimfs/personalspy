import { getCurrentUser } from "@/lib/current-user";
import ProfileView, { type ProfileStat } from "./ProfileView";

function getAge(birthDate: Date) {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  if (!hadBirthday) age--;
  return age;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const { profile } = user;

  // Имя и возраст появятся после анкеты; до этого показываем нейтральную подпись
  const title = profile ? `${profile.firstName}, ${getAge(profile.birthDate)}` : "Агент";
  const initial = profile?.firstName.charAt(0).toUpperCase() || "👤";

  const stats: ProfileStat[] = [
    // Заглушки: в схеме пока нет полей для «тебя ищут», провалов и отказов
    { icon: "🔍", label: "Тебя ищут", value: "3 / 5" },
    { icon: "🏆", label: "Баллов", value: String(user.points) },
    { icon: "✅", label: "Решено кейсов", value: String(user.totalSolved) },
    { icon: "❌", label: "Провалено", value: "3" },
    { icon: "🚪", label: "Отказов", value: "2" },
  ];

  return (
    <ProfileView
      initial={initial}
      title={title}
      spyId={user.spyId}
      stats={stats}
      roleSpy={user.roleSpy}
      roleTarget={user.roleTarget}
    />
  );
}
