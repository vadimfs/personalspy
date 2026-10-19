"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

const totalSteps = 4;

const stepTitles = ["ФИО", "О себе", "Учёба и работа", "Соцсети и детали"];

const levels = ["Бакалавриат", "Магистратура", "Аспирантура", "Специалитет"];

const networks = ["VK", "Instagram", "LinkedIn", "Другое"];

const initialData = {
  firstName: "",
  lastName: "",
  birthdate: "",
  gender: "",
  city: "Москва",
  isStudying: false,
  university: "",
  faculty: "",
  level: levels[0],
  course: "",
  isWorking: false,
  workplace: "",
  position: "",
  telegramNick: "",
  uniqueDetail: "",
};

type FormData = typeof initialData;

type Social = { network: string; link: string; nick: string };

const emptySocial: Social = { network: "", link: "", nick: "" };

const inputClass =
  "w-full bg-transparent border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition [color-scheme:dark]";

const checkboxCardClass =
  "flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition";

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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [socials, setSocials] = useState<Social[]>([emptySocial, emptySocial]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateSocial(index: number, key: keyof Social, value: string) {
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  }

  // Две соцсети заполнены и не совпадают («Другое» можно выбрать дважды)
  const socialsFilled = socials.every((s) => s.network && s.link.trim() && s.nick.trim());
  const sameNetwork = socials[0].network !== "" && socials[0].network === socials[1].network;
  const socialsDuplicate = sameNetwork && socials[0].network !== "Другое";

  let blockedReason = "";
  if (currentStep === 3 && !data.isStudying && !data.isWorking) {
    blockedReason = "Отметь хотя бы один вариант";
  } else if (currentStep === 4 && socialsDuplicate) {
    blockedReason = "Соцсети должны быть разными";
  } else if (currentStep === 4 && !socialsFilled) {
    blockedReason = "Заполни две соцсети";
  }

  // Форма отправляется на каждом шаге, чтобы браузер проверил обязательные поля
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (blockedReason) return;
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

          {/* Шаг 3 — Учёба и работа */}
          {currentStep === 3 && (
            <>
              <div className="space-y-4">
                <label
                  className={`${checkboxCardClass} ${
                    data.isStudying ? "border-white" : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.isStudying}
                    onChange={(e) => update("isStudying", e.target.checked)}
                    className="accent-white w-4 h-4"
                  />
                  Я учусь
                </label>
                {data.isStudying && (
                  <div className="space-y-4 pl-4 border-l border-gray-800">
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
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label
                  className={`${checkboxCardClass} ${
                    data.isWorking ? "border-white" : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.isWorking}
                    onChange={(e) => update("isWorking", e.target.checked)}
                    className="accent-white w-4 h-4"
                  />
                  Я работаю
                </label>
                {data.isWorking && (
                  <div className="space-y-4 pl-4 border-l border-gray-800">
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
                  </div>
                )}
              </div>
            </>
          )}

          {/* Шаг 4 — Соцсети и детали */}
          {currentStep === 4 && (
            <>
              {socials.map((s, i) => (
                <Section key={i} title={`Соцсеть ${i + 1}`}>
                  <Field label="Сеть" htmlFor={`network${i}`}>
                    <select
                      id={`network${i}`}
                      required
                      value={s.network}
                      onChange={(e) => updateSocial(i, "network", e.target.value)}
                      className={`${inputClass} bg-black`}
                    >
                      <option value="" disabled>
                        Выбери соцсеть
                      </option>
                      {networks.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Ссылка на профиль" htmlFor={`link${i}`}>
                    <input
                      id={`link${i}`}
                      type="text"
                      required
                      placeholder="https://..."
                      value={s.link}
                      onChange={(e) => updateSocial(i, "link", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Ник" hint="без @" htmlFor={`nick${i}`}>
                    <input
                      id={`nick${i}`}
                      type="text"
                      required
                      value={s.nick}
                      onChange={(e) => updateSocial(i, "nick", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </Section>
              ))}

              <Section title="Telegram (мессенджер)">
                <Field label="Ник" hint="без @" htmlFor="telegramNick">
                  <input
                    id="telegramNick"
                    type="text"
                    value={data.telegramNick}
                    onChange={(e) => update("telegramNick", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </Section>

              <Field label="Уникальная деталь" htmlFor="uniqueDetail">
                <input
                  id="uniqueDetail"
                  type="text"
                  placeholder="Например: любимая группа, необычное хобби"
                  value={data.uniqueDetail}
                  onChange={(e) => update("uniqueDetail", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {/* Навигация */}
          <div className="pt-3">
            <div className="flex gap-3">
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
                disabled={blockedReason !== ""}
                className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {currentStep < totalSteps ? "Далее" : "Сохранить анкету"}
              </button>
            </div>
            {blockedReason && (
              <p className="text-sm text-gray-500 text-center mt-3">{blockedReason}</p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
