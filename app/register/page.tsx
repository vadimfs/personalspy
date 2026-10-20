"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const roles = [
  { value: "spy", label: "Только шпион" },
  { value: "target", label: "Только цель" },
  { value: "both", label: "Шпион + цель" },
];

const inputClass =
  "w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition [color-scheme:dark]";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("both");
  const [consentData, setConsentData] = useState(false);
  const [consentTarget, setConsentTarget] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          birthDate: form.get("birthdate"),
          role,
        }),
      });
      const data: { success: boolean; spyId?: string; error?: string } = await res
        .json()
        .catch(() => ({ success: false }));

      if (data.success) {
        alert(`Добро пожаловать в игру! Твой SPY-ID: ${data.spyId}`);
        router.push("/login");
        return;
      }
      alert(data.error ?? "Не удалось зарегистрироваться, попробуй ещё раз");
    } catch {
      alert("Нет связи с сервером, попробуй ещё раз");
    }
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Заголовок */}
        <h1 className="text-3xl font-bold mb-8 text-center">Создать аккаунт</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Поля */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-2">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm text-gray-400 mb-2">
              Дата рождения
            </label>
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              required
              className={inputClass}
            />
          </div>

          {/* Роль */}
          <fieldset>
            <legend className="block text-sm text-gray-400 mb-2">Роль</legend>
            <div className="space-y-2">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
                    role === r.value ? "border-white" : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="accent-white w-4 h-4"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Согласия */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="consentData"
                required
                checked={consentData}
                onChange={(e) => setConsentData(e.target.checked)}
                className="accent-white w-4 h-4 mt-0.5"
              />
              Согласен с обработкой персональных данных
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="consentTarget"
                checked={consentTarget}
                onChange={(e) => setConsentTarget(e.target.checked)}
                className="accent-white w-4 h-4 mt-0.5"
              />
              Согласен участвовать в игре как цель
            </label>
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            disabled={!consentData || submitting}
            className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>

        {/* Ссылка на вход */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-white underline hover:text-gray-300">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}
