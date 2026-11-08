import { useQuery } from "@tanstack/react-query";
import { Page } from "@/skein-shell";
import { systemRolesKeys, fetchSystemRoles } from "./api";
import { useSystemRolesTranslation } from "./locales";

export function SystemRolesPage() {
  const { t } = useSystemRolesTranslation();
  const { data } = useQuery({ queryKey: systemRolesKeys.all, queryFn: fetchSystemRoles });
  return (
    <Page title={t("title")}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Page>
  );
}
