"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

const totalSteps = 4;

const stepTitles = ["ФИО", "О себе", "Учёба или работа", "Соцсеть"];

const levels = ["Бакалавриат", "Магистратура", "Аспирантура", "Специалитет"];

const initialData = {
  firstName: "",
  lastName: "",
  middleName: "",
  birthdate: "",
  gender: "",
  city: "Москва",
  occupation: "study",
  university: "",
  faculty: "",
  level: levels[0],
  course: "",
  workplace: "",
  position: "",
  socialLink: "",
  socialNick: "",
};

type FormData = typeof initialData;

const inputClass =
  "w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition [color-scheme:dark]";

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm text-gray-400 mb-2">
        {label}
        {hint && <span className="text-gray-600"> ({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-sm text-gray-400 mb-2">{legend}</legend>
      <div className="flex gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex-1 flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
              value === o.value ? "border-white" : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="accent-white w-4 h-4"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Форма отправляется на каждом шаге, чтобы браузер проверил обязательные поля
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    alert("Анкета сохранена!");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Заголовок */}
        <h1 className="text-3xl font-bold mb-8 text-center">Расскажи о себе</h1>

        {/* Прогресс */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">
              Шаг {currentStep} из {totalSteps}
            </span>
            <span className="text-gray-500">{stepTitles[currentStep - 1]}</span>
          </div>
          <div className="flex gap-1.5">
            {stepTitles.map((title, i) => (
              <div
                key={title}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i < currentStep ? "bg-white" : "bg-gray-800"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Шаг 1 — ФИО */}
          {currentStep === 1 && (
            <>
              <Field label="Имя" htmlFor="firstName">
                <input
                  id="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={data.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Фамилия" htmlFor="lastName">
                <input
                  id="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={data.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Отчество" hint="если есть" htmlFor="middleName">
                <input
                  id="middleName"
                  type="text"
                  autoComplete="additional-name"
                  value={data.middleName}
                  onChange={(e) => update("middleName", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {/* Шаг 2 — О себе */}
          {currentStep === 2 && (
            <>
              <Field label="Дата рождения" htmlFor="birthdate">
                <input
                  id="birthdate"
                  type="date"
                  value={data.birthdate}
                  onChange={(e) => update("birthdate", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <RadioGroup
                legend="Пол"
                name="gender"
                options={[
                  { value: "male", label: "Мужской" },
                  { value: "female", label: "Женский" },
                ]}
                value={data.gender}
                onChange={(v) => update("gender", v)}
              />
              <Field label="Город" htmlFor="city">
                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {/* Шаг 3 — Учёба или работа */}
          {currentStep === 3 && (
            <>
              <RadioGroup
                legend="Чем занимаешься"
                name="occupation"
                options={[
                  { value: "study", label: "Я учусь" },
                  { value: "work", label: "Я работаю" },
                ]}
                value={data.occupation}
                onChange={(v) => update("occupation", v)}
              />
              {data.occupation === "study" ? (
                <>
                  <Field label="Вуз" htmlFor="university">
                    <input
                      id="university"
                      type="text"
                      value={data.university}
                      onChange={(e) => update("university", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Факультет" htmlFor="faculty">
                    <input
                      id="faculty"
                      type="text"
                      value={data.faculty}
                      onChange={(e) => update("faculty", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Уровень" htmlFor="level">
                    <select
                      id="level"
                      value={data.level}
                      onChange={(e) => update("level", e.target.value)}
                      className={`${inputClass} bg-black`}
                    >
                      {levels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Курс" htmlFor="course">
                    <input
                      id="course"
                      type="number"
                      min={1}
                      max={6}
                      placeholder="От 1 до 6"
                      value={data.course}
                      onChange={(e) => update("course", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Место работы" htmlFor="workplace">
                    <input
                      id="workplace"
                      type="text"
                      autoComplete="organization"
                      value={data.workplace}
                      onChange={(e) => update("workplace", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Сфера / должность" htmlFor="position">
                    <input
                      id="position"
                      type="text"
                      autoComplete="organization-title"
                      value={data.position}
                      onChange={(e) => update("position", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </>
              )}
            </>
          )}

          {/* Шаг 4 — Соцсеть */}
          {currentStep === 4 && (
            <>
              <Field label="Ссылка на соцсеть" hint="Telegram, VK или Instagram" htmlFor="socialLink">
                <input
                  id="socialLink"
                  type="text"
                  placeholder="https://t.me/..."
                  value={data.socialLink}
                  onChange={(e) => update("socialLink", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Ник в соцсети" hint="без @" htmlFor="socialNick">
                <input
                  id="socialNick"
                  type="text"
                  value={data.socialNick}
                  onChange={(e) => update("socialNick", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Любимое фото">
                {/* Заглушка — загрузку сделаем позже */}
                <button
                  type="button"
                  className="w-full border border-dashed border-gray-700 rounded-xl px-4 py-6 text-gray-400 hover:border-white hover:text-white transition"
                >
                  📷 Загрузить фото
                </button>
              </Field>
            </>
          )}

          {/* Навигация */}
          <div className="flex gap-3 pt-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 bg-transparent border border-white text-white font-semibold py-3 rounded-xl hover:bg-white hover:text-black transition"
              >
                Назад
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
            >
              {currentStep < totalSteps ? "Далее" : "Сохранить анкету"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
