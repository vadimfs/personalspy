// Тестовые цели для локальной проверки кейсов.
// Запуск: npm run db:seed (или npx prisma db seed). Можно запускать повторно:
// пользователи и анкеты обновляются через upsert, дубликатов не будет.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Общий пароль тестовых аккаунтов — чтобы можно было войти под любой целью
const TEST_PASSWORD = "test12345";

// Формат совпадает с тем, что сохраняет анкета (/api/onboarding):
// уровень обучения — по-русски, соцсети — { networks: [две соцсети], telegram }
const targets = [
  {
    email: "maria@test.ru",
    spyId: "SPY-MARIA",
    profile: {
      firstName: "Мария",
      lastName: "Иванова",
      birthDate: new Date("2000-03-15"),
      gender: "female",
      city: "Москва",
      eduUniversity: "МГУ",
      eduFaculty: "Журфак",
      eduLevel: "Бакалавриат",
      eduCourse: 3,
      workPlace: null,
      workSphere: null,
      socials: {
        networks: [
          { network: "VK", link: "https://vk.com/maria_iv", nick: "maria_iv" },
          { network: "Instagram", link: "https://instagram.com/maria.ivanova", nick: "maria.ivanova" },
        ],
        telegram: "maria_iv",
      },
      uniqueDetail: "Любит группу Radiohead",
    },
  },
  {
    email: "anton@test.ru",
    spyId: "SPY-ANTON",
    profile: {
      firstName: "Антон",
      lastName: "Смирнов",
      birthDate: new Date("1998-11-02"),
      gender: "male",
      city: "Москва",
      eduUniversity: "ВШЭ",
      eduFaculty: "ФКН",
      eduLevel: "Магистратура",
      eduCourse: 1,
      workPlace: "Яндекс",
      workSphere: "IT, бэкенд-разработчик",
      socials: {
        networks: [
          { network: "LinkedIn", link: "https://linkedin.com/in/anton-smirnov", nick: "anton-smirnov" },
          { network: "VK", link: "https://vk.com/a.smirnov", nick: "a.smirnov" },
        ],
        telegram: "anton_dev",
      },
      uniqueDetail: "Собирает механические клавиатуры",
    },
  },
  {
    email: "elena@test.ru",
    spyId: "SPY-ELENA",
    profile: {
      firstName: "Елена",
      lastName: "Кузнецова",
      birthDate: new Date("2002-07-21"),
      gender: "female",
      city: "Санкт-Петербург",
      eduUniversity: "СПбГУ",
      eduFaculty: "Филфак",
      eduLevel: "Специалитет",
      eduCourse: 4,
      workPlace: null,
      workSphere: null,
      socials: {
        networks: [
          { network: "Instagram", link: "https://instagram.com/lena_kuz", nick: "lena_kuz" },
          { network: "VK", link: "https://vk.com/elena.kuznetsova", nick: "elena.kuznetsova" },
        ],
        telegram: null,
      },
      uniqueDetail: "Играет на виолончели",
    },
  },
  {
    email: "dmitry@test.ru",
    spyId: "SPY-DMITR",
    profile: {
      firstName: "Дмитрий",
      lastName: "Волков",
      birthDate: new Date("1995-01-09"),
      gender: "male",
      city: "Москва",
      eduUniversity: null,
      eduFaculty: null,
      eduLevel: null,
      eduCourse: null,
      workPlace: "Сбер",
      workSphere: "Финансы, аналитик",
      socials: {
        networks: [
          { network: "LinkedIn", link: "https://linkedin.com/in/dmitry-volkov", nick: "dmitry-volkov" },
          { network: "Другое", link: "https://habr.com/users/dvolkov", nick: "dvolkov" },
        ],
        telegram: "dvolkov",
      },
      uniqueDetail: "Пробежал три марафона",
    },
  },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

    for (const { email, spyId, profile } of targets) {
      const account = { spyId, passwordHash, roleSpy: true, roleTarget: true };
      const user = await prisma.user.upsert({
        where: { email },
        create: { email, ...account },
        update: account,
      });
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...profile },
        update: profile,
      });
      console.log(`✓ ${spyId} ${profile.firstName} (${email})`);
    }

    console.log(`Готово. Тестовых целей: ${targets.length}, пароль «${TEST_PASSWORD}».`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
