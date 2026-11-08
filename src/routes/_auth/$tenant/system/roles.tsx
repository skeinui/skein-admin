import { createFileRoute } from "@tanstack/react-router";
import { SystemRolesPage } from "@/pages/system/roles";

export const Route = createFileRoute("/_auth/$tenant/system/roles")({
  component: SystemRolesPage,
});
