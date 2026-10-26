import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 подключается к базе только через driver adapter (здесь — pg).
// Переменные из .env Next.js загружает сам, dotenv не нужен.
const connectionString = process.env.DATABASE_URL;

// Один клиент на процесс: в dev-режиме модули перезагружаются при каждом
// изменении, поэтому храним экземпляр в globalThis, чтобы не плодить подключения.
// Запоминаем и строку подключения: если в .env поменяли адрес базы,
// старый клиент выбрасываем, а не продолжаем стучаться по прежнему адресу.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionString?: string;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

if (globalForPrisma.prisma && globalForPrisma.prismaConnectionString !== connectionString) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = connectionString;
}
