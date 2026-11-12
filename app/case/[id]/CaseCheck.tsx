"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

// Интерактивная часть кейса: попытки, проверка ID цели и отказ
export default function CaseCheck({
  caseId,
  initialAttempts,
  totalAttempts,
}: {
  caseId: number;
  initialAttempts: number;
  totalAttempts: number;
}) {
  const router = useRouter();
  const [targetId, setTargetId] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttempts);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enteredId: targetId }),
      });
      const data: {
        success: boolean;
        reward?: number;
        message?: string;
        error?: string;
        attemptsLeft?: number;
      } = await res.json().catch(() => ({ success: false }));

      if (data.success) {
        alert(`Ты нашел цель! +${data.reward} баллов`);
        router.push("/dashboard");
        return;
      }
      if (typeof data.attemptsLeft === "number") {
        setAttemptsLeft(data.attemptsLeft);
      }
      alert(data.message ?? data.error ?? "Не удалось проверить ID, попробуй ещё раз");
      if (data.attemptsLeft === 0) {
        router.push("/dashboard");
        return;
      }
      setTargetId("");
    } catch {
      alert("Нет связи с сервером, попробуй ещё раз");
    }
    setChecking(false);
  }

  return (
    <>
      {/* Попытки */}
      <p className="text-sm text-gray-400 mb-6">
        Попыток:{" "}
        <span className="text-white font-semibold">
          {attemptsLeft} / {totalAttempts}
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
            required
            placeholder="SPY-XXXXX"
            autoComplete="off"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono focus:outline-none focus:border-white transition"
          />
        </div>
        <button
          type="submit"
          disabled={checking}
          className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {checking ? "Проверяем..." : "Проверить"}
        </button>
      </form>

      {/* Отказ — пока заглушка */}
      <button
        type="button"
        onClick={() => alert("Отказ от кейса")}
        className="block w-full mt-10 bg-transparent border border-red-500 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-500 hover:text-white transition"
      >
        Отказаться (−15 баллов)
      </button>
    </>
  );
}
