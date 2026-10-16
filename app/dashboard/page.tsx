import Link from "next/link";
import TabBar from "../components/TabBar";

// Заглушечные данные — потом заменим на реальные
const spyId = "SPY-4F7K2";
const points = 240;
const huntedBy = 3;
const huntedLimit = 5;
const cases = [
  { id: 1, title: "Кейс #1" },
  { id: 2, title: "Кейс #2" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 pt-6 pb-28">
      <div className="max-w-md mx-auto">
        {/* Шапка */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold">PersonalSpy</h1>
            <span className="text-xs text-gray-500 font-mono">{spyId}</span>
          </div>
          <div className="flex items-center gap-1 text-lg font-semibold">
            <span>🏆</span>
            <span>{points}</span>
          </div>
        </header>

        {/* Статус */}
        <section className="bg-gray-900 rounded-2xl px-5 py-4 mb-8">
          <p className="text-lg">
            🔍 Тебя ищут:{" "}
            <span className="font-semibold">
              {huntedBy} / {huntedLimit}
            </span>
          </p>
        </section>

        {/* Активные кейсы */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Активные кейсы</h2>
          {cases.length > 0 ? (
            <div className="space-y-3">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-gray-900 rounded-2xl px-5 py-4"
                >
                  <span>🟠 {c.title}</span>
                  <Link
                    href={`/case/${c.id}`}
                    className="text-sm font-semibold bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition"
                  >
                    Открыть
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Пока нет активных кейсов</p>
          )}
        </section>

        {/* Выдать цель */}
        <Link
          href="/case/new"
          className="block w-full bg-white text-black text-lg font-semibold py-4 rounded-xl hover:bg-gray-200 transition text-center"
        >
          + Выдать цель
        </Link>
      </div>

      {/* Таб-бар */}
      <TabBar active="/dashboard" />
    </main>
  );
}
