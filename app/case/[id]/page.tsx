"use client";

import Link from "next/link";
import { use, useState, type FormEvent } from "react";

// Заглушечные данные — потом заменим на реальные
const hints = [
  "Пол: мужской",
  "Возраст: 20–25",
  "МГУ, журфак",
  "Бакалавриат, 3 курс",
  "Имя: начинается на «А», 7 букв",
  "Telegram: @a***v",
];
const attemptsLeft = 10;
const attemptsTotal = 10;

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [targetId, setTargetId] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("Проверяем ID: " + targetId);
  }

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
        <h1 className="text-3xl font-bold mb-8 text-center">Кейс #{id}</h1>

        {/* Подсказки */}
        <section className="bg-gray-900 rounded-2xl px-5 py-4 mb-6">
          <h2 className="font-semibold mb-3">Подсказки:</h2>
          <ul className="space-y-2 text-gray-300">
            {hints.map((hint) => (
              <li key={hint} className="flex gap-2">
                <span className="text-gray-500">•</span>
                {hint}
              </li>
            ))}
          </ul>
        </section>

        {/* Попытки */}
        <p className="text-sm text-gray-400 mb-6">
          Попыток:{" "}
          <span className="text-white font-semibold">
            {attemptsLeft} / {attemptsTotal}
          </span>
        </p>

        {/* Проверка ID */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="targetId" className="block text-sm text-gray-400 mb-2">
              Введи ID цели:
            </label>
            <input
              id="targetId"
              type="text"
              placeholder="SPY-XXXXX"
              autoComplete="off"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-monofocus:outline-none focus:border-white transition"
            />
          </div>
          <button
            type="submit"
            className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Проверить
          </button>
        </form>

        {/* Отказ */}
        <button
          type="button"
          onClick={() => alert("Отказ от кейса")}
          className="block w-full mt-10 bg-transparent border border-red-500 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-500 hover:text-white transition"
        >
          Отказаться (−15 баллов)
        </button>
      </div>
    </main>
  );
}
