// Общие для формы анкеты и API справочники и типы

export const genders = ["male", "female"] as const;

export const eduLevels = ["Бакалавриат", "Магистратура", "Аспирантура", "Специалитет"];

export const networks = ["VK", "Instagram", "LinkedIn", "Другое"];

export type SocialAccount = { network: string; link: string; nick: string };

// Так соцсети лежат в поле Profile.socials (JSON).
// Telegram — мессенджер, поэтому хранится отдельно от двух соцсетей
export type Socials = { networks: SocialAccount[]; telegram: string | null };

// Две соцсети должны различаться; «Другое» можно выбрать дважды
export function hasDuplicateNetworks(accounts: SocialAccount[]) {
  return (
    accounts.length === 2 &&
    accounts[0].network !== "" &&
    accounts[0].network === accounts[1].network &&
    accounts[0].network !== "Другое"
  );
}
