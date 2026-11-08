import { useQuery } from "@tanstack/react-query";
import { Page } from "@/skein-shell";
import { systemLogsKeys, fetchSystemLogs } from "./api";
import { useSystemLogsTranslation } from "./locales";

export function SystemLogsPage() {
  const { t } = useSystemLogsTranslation();
  const { data } = useQuery({ queryKey: systemLogsKeys.all, queryFn: fetchSystemLogs });
  return (
    <Page title={t("title")}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Page>
  );
}
