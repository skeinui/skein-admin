import { useModuleTranslation } from "@/lib/use-module-translation";
import en from "./messages/en.json";
import zh from "./messages/zh.json";

export function useReportsTranslation() {
  return useModuleTranslation("reports", { en, zh });
}
