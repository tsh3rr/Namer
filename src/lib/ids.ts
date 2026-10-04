import { customAlphabet, nanoid } from "nanoid";
import { labelKey } from "./markets";

const shortId = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 5);

export const newId = () => nanoid(16);
export const newAdminKey = () => nanoid(24);

/** "Baby Müller" → "baby-muller-k3x9p" */
export function makeSlug(babyName: string) {
  const base = babyName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return `${base || "baby"}-${shortId()}`;
}

export { labelKey };
