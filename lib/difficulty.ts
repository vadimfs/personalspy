// Уровни сложности кейса. Без серверных импортов: используется и в API, и в клиентских компонентах

export const difficulties = ["easy", "medium", "hard", "insane"] as const;

export type Difficulty = (typeof difficulties)[number];

export const difficultyConfig: Record<
  Difficulty,
  { label: string; emoji: string; reward: number }
> = {
  easy: { label: "Легко", emoji: "🟢", reward: 30 },
  medium: { label: "Средне", emoji: "🟡", reward: 60 },
  hard: { label: "Сложно", emoji: "🟠", reward: 120 },
  insane: { label: "Супер сложно", emoji: "🔴", reward: 250 },
};

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (difficulties as readonly string[]).includes(value);
}
