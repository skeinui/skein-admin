import { createFileRoute, redirect } from "@tanstack/react-router";
import { enterTenant } from "@/modules/tenant-switcher/api";
import { NotFoundPage } from "@/pages/not-found";

/** Any other address: the 404 page inside the layout (signed in, like every page under _auth). */
export const Route = createFileRoute("/_auth/$")({
  // A page's path without the tenant (/system/logs), or with one the user no longer has: under the current tenant
  async beforeLoad({ location }) {
    const first = decodeURIComponent(location.pathname.split("/")[1] ?? "");
    const href = await enterTenant(first, location.href);
    if (href) throw redirect({ href });
  },
  component: NotFoundPage,
});
