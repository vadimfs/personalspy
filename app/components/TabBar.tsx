import Link from "next/link";

const tabs = [
  { href: "/dashboard", icon: "🏠", label: "Главная" },
  { href: "/cases", icon: "📁", label: "Кейсы" },
  { href: "/profile", icon: "👤", label: "Профиль" },
];

// Нижняя навигация; active — href текущей вкладки
export default function TabBar({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-black border-t border-gray-800">
      <div className="max-w-md mx-auto flex">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.href === active ? "page" : undefined}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition ${
              t.href === active ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
