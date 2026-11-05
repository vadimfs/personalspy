"use client";

import Link from "next/link";
import { useState } from "react";
import TabBar from "../components/TabBar";

export type ProfileStat = { icon: string; label: string; value: string };

type ProfileViewProps = {
  initial: string;
  title: string;
  spyId: string;
  stats: ProfileStat[];
  roleSpy: boolean;
  roleTarget: boolean;
};

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between bg-gray-900 rounded-2xl px-5 py-4 cursor-pointer">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="relative w-11 h-6 rounded-full bg-gray-700 transition peer-checked:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-gray-400 after:transition peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
    </label>
  );
}

const secondaryButton =
  "block w-full bg-transparent border border-gray-700 text-white font-semibold py-3 rounded-xl hover:border-white transition text-center";

// Интерактивная часть профиля; данные приходят с сервера из app/profile/page.tsx
export default function ProfileView({
  initial,
  title,
  spyId,
  stats,
  roleSpy,
  roleTarget,
}: ProfileViewProps) {
  const [isSpy, setIsSpy] = useState(roleSpy);
  const [isTarget, setIsTarget] = useState(roleTarget);
  const [showHunted, setShowHunted] = useState(true);

  return (
    <main className="relative min-h-screen bg-black text-white px-6 pt-20 pb-28">
      {/* Назад */}
      <Link
        href="/dashboard"
        className="absolute top-6 left-6 text-sm text-gray-400 hover:text-white transition"
      >
        ← Назад
      </Link>

      <div className="max-w-md mx-auto">
        {/* Аватар */}
        <section className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold mb-4">
            {initial}
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">{spyId}</p>
        </section>

        {/* Статистика */}
        <section className="bg-gray-900 rounded-2xl px-5 py-2 mb-8 divide-y divide-gray-800">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3">
              <span className="text-gray-300">
                {s.icon} {s.label}
              </span>
              <span className="font-semibold">{s.value}</span>
            </div>
          ))}
        </section>

        {/* Мои роли */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Мои роли</h2>
          <div className="space-y-2">
            <Toggle label="Шпион" checked={isSpy} onChange={setIsSpy} />
            <Toggle label="Цель" checked={isTarget} onChange={setIsTarget} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Меняй в любой момент</p>
        </section>

        {/* Приватность */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Приватность</h2>
          <Toggle label="Показывать «тебя ищут»" checked={showHunted} onChange={setShowHunted} />
        </section>

        {/* Действия */}
        <div className="space-y-3">
          <Link href="/onboarding" className={secondaryButton}>
            Редактировать анкету
          </Link>
          <button
            type="button"
            onClick={() => alert("Политика конфиденциальности")}
            className={secondaryButton}
          >
            Политика конфиденциальности
          </button>
          <button type="button" onClick={() => alert("Сменить пароль")} className={secondaryButton}>
            Сменить пароль
          </button>
          <button
            type="button"
            onClick={() => alert("Удалить аккаунт")}
            className="block w-full bg-transparent border border-red-500 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-500 hover:text-white transition"
          >
            Удалить аккаунт
          </button>
        </div>
      </div>

      {/* Таб-бар */}
      <TabBar active="/profile" />
    </main>
  );
}
