import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { Socials } from "@/lib/onboarding";
import OnboardingForm, {
  emptyFormData,
  emptySocial,
  type OnboardingFormData,
} from "./OnboardingForm";

// Соцсети хранятся в JSON; читаем осторожно, на случай старого или неполного формата
function readSocials(value: unknown): Socials {
  const { networks, telegram } = (value ?? {}) as Partial<Socials>;
  const accounts = Array.isArray(networks) ? networks.slice(0, 2) : [];
  while (accounts.length < 2) accounts.push(emptySocial);
  return { networks: accounts, telegram: typeof telegram === "string" ? telegram : null };
}

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  // Анкета уже заполнена — подставляем сохранённые данные для редактирования
  let initialData: OnboardingFormData = emptyFormData;
  let initialSocials = [emptySocial, emptySocial];

  if (profile) {
    const socials = readSocials(profile.socials);
    const isStudying = Boolean(
      profile.eduUniversity || profile.eduFaculty || profile.eduLevel || profile.eduCourse,
    );
    initialData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthdate: profile.birthDate.toISOString().slice(0, 10),
      gender: profile.gender,
      city: profile.city,
      isStudying,
      university: profile.eduUniversity ?? "",
      faculty: profile.eduFaculty ?? "",
      level: profile.eduLevel ?? emptyFormData.level,
      course: profile.eduCourse ? String(profile.eduCourse) : "",
      isWorking: Boolean(profile.workPlace || profile.workSphere),
      workplace: profile.workPlace ?? "",
      position: profile.workSphere ?? "",
      telegramNick: socials.telegram ?? "",
      uniqueDetail: profile.uniqueDetail ?? "",
    };
    initialSocials = socials.networks;
  }

  return <OnboardingForm initialData={initialData} initialSocials={initialSocials} />;
}
