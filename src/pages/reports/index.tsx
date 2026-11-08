import { useQuery } from "@tanstack/react-query";
import { Page } from "@/skein-shell";
import { reportsKeys, fetchReports } from "./api";
import { useReportsTranslation } from "./locales";

export function ReportsPage() {
  const { t } = useReportsTranslation();
  const { data } = useQuery({ queryKey: reportsKeys.all, queryFn: fetchReports });
  return (
    <Page title={t("title")}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Page>
  );
}
