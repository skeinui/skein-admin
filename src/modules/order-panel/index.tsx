import { useOrderPanelTranslation } from "./locales";

export function OrderPanel() {
  const { t } = useOrderPanelTranslation();
  return <div>{t("label")}</div>;
}
