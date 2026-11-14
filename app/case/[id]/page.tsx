import Link from "next/link";
import { notFound } from "next/navigation";
import { CASE_ATTEMPTS, findSpyCase, parseCaseId, toDifficulty } from "@/lib/cases";
import { getCurrentUser } from "@/lib/current-user";
import { difficultyConfig } from "@/lib/difficulty";
import { generateHints } from "@/lib/masking";
import CaseCheck from "./CaseCheck";

const closedMessages: Record<string, string> = {
  solved: "Ты уже нашёл эту цель 🎉",
  failed: "Попытки закончились, кейс провален",
  declined: "Ты отказался от этого кейса",
};

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const caseId = parseCaseId((await params).id);
  if (!caseId) notFound();

  const user = await getCurrentUser();
  // Чужой кейс показываем как несуществующий
  const found = await findSpyCase(caseId, user.id);
  if (!found) notFound();

  const profile = found.target.profile;
  const isActive = found.status === "active" && profile !== null;
  const difficulty = toDifficulty(found.difficulty);
  const { label, emoji } = difficultyConfig[difficulty];

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center px-6 pt-20 pb-12">
      {/* К списку */}
      <Link
        href="/dashboard"
        className="absolute top-6 left-6 text-sm text-gray-400 hover:text-white transition"
      >
        ← К списку
      </Link>

      <div className="max-w-md w-full">
        {/* Заголовок */}
        <h1 className="text-3xl font-bold mb-2 text-center">Кейс #{found.id}</h1>
        <p className="text-sm text-gray-400 mb-8 text-center">
          {emoji} {label} · награда {found.reward} баллов
        </p>

        {isActive ? (
          <>
            {/* Подсказки */}
            <section className="bg-gray-900 rounded-2xl px-5 py-4 mb-6">
              <h2 className="font-semibold mb-3">Подсказки:</h2>
              <ul className="space-y-2 text-gray-300">
                {generateHints(profile, difficulty).map((hint) => (
                  <li key={hint} className="flex gap-2">
                    <span className="text-gray-500">•</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </section>

            <CaseCheck
              caseId={found.id}
              initialAttempts={found.attemptsLeft}
              totalAttempts={CASE_ATTEMPTS}
            />
          </>
        ) : (
          <section className="bg-gray-900 rounded-2xl px-5 py-6 text-center">
            <p className="text-lg mb-6">
              {closedMessages[found.status] ?? "Цель удалила анкету, кейс недоступен"}
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition"
            >
              На главную
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
