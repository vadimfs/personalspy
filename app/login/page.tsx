"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const inputClass =
  "w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("Форма входа работает");
  }

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
      {/* Назад */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm text-gray-400 hover:text-white transition"
      >
        ← Назад
      </Link>

      <div className="max-w-md w-full">
        {/* Заголовок */}
        <h1 className="text-3xl font-bold mb-8 text-center">Войти</h1>

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
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Войти
          </button>
        </form>

        {/* Ссылки */}
        <div className="text-center text-sm text-gray-500 mt-8 space-y-3">
          <p>
            <Link href="/reset" className="text-white underline hover:text-gray-300">
              Забыли пароль?
            </Link>
          </p>
          <p>
            Нет аккаунта?{" "}
            <Link href="/register" className="text-white underline hover:text-gray-300">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
