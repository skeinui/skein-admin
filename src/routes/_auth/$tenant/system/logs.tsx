import { createFileRoute } from "@tanstack/react-router";
import { SystemLogsPage } from "@/pages/system/logs";

export const Route = createFileRoute("/_auth/$tenant/system/logs")({
  component: SystemLogsPage,
});
