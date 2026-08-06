export type Language = "es" | "en";

export type LocalizedText = {
  es: string;
  en?: string;
};

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "es" || value === "en";
}

export function translateLocalized(value: LocalizedText, language: Language): string {
  return value[language] ?? value.es;
}

export function translateLocalizedArray(values: LocalizedText[], language: Language): string[] {
  return values.map((value) => translateLocalized(value, language));
}
