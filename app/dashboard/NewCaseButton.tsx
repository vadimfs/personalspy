"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Запрашивает новую цель и открывает созданный кейс
export default function NewCaseButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/cases/create", { method: "POST" });
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
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="block w-full bg-white text-black text-lg font-semibold py-4 rounded-xl hover:bg-gray-200 transition text-center disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
    >
      {loading ? "Ищем цель..." : "+ Выдать цель"}
    </button>
  );
}
