"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { difficulties, difficultyConfig, type Difficulty } from "@/lib/difficulty";

// Выбор сложности: запрашивает новую цель и открывает созданный кейс
export default function NewCaseButton() {
  const router = useRouter();
  const [loading, setLoading] = useState<Difficulty | null>(null);

  async function requestCase(difficulty: Difficulty) {
    setLoading(difficulty);
    try {
      const res = await fetch("/api/cases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      const data: { success: boolean; caseId?: number; error?: string } = await res
        .json()
        .catch(() => ({ success: false }));

      if (data.success) {
        router.push(`/case/${data.caseId}`);
        return;
      }
      alert(data.error ?? "Не удалось выдать цель, попробуй ещё раз");
    } catch {
      alert("Нет связи с сервером, попробуй ещё раз");
    }
    setLoading(null);
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">+ Выдать цель</h2>
      <div className="grid grid-cols-2 gap-3">
        {difficulties.map((d) => {
          const { label, emoji, reward } = difficultyConfig[d];
          return (
            <button
              key={d}
              type="button"
              onClick={() => requestCase(d)}
              disabled={loading !== null}
              className="flex flex-col items-start gap-1 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-left hover:border-white transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-800"
            >
              <span className="font-semibold">
                {emoji} {loading === d ? "Ищем цель..." : label}
              </span>
              <span className="text-sm text-gray-400">{reward} баллов</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
