import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Логотип */}
        <div className="text-7xl mb-6">🕵️</div>

        {/* Название */}
        <h1 className="text-4xl font-bold mb-3">PersonalSpy</h1>

        {/* Слоган */}
        <p className="text-gray-400 text-lg mb-12">
          Найди своего незнакомца
        </p>

        {/* Описание */}
        <p className="text-gray-500 text-sm mb-12 leading-relaxed">
          Ты шпион. Ты ищешь.
          <br />
          Или тебя ищут.
        </p>

        {/* Кнопки */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition text-center"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="block w-full bg-transparent border border-white text-white font-semibold py-3 rounded-xl hover:bg-white hover:text-black transition text-center"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </main>
  );
}