/** Genera un slug URL-safe a partir de texto (quita acentos, espacios y símbolos). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos (combining diacritics U+0300–U+036f)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
