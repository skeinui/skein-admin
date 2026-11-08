import { createFileRoute } from "@tanstack/react-router";
import { requireAccess } from "@/modules/access";
import { OrdersPage } from "@/pages/orders";

export const Route = createFileRoute("/_auth/$tenant/orders")({
  // Opening the page needs `orders:read`; the 403 page otherwise
  beforeLoad: () => requireAccess("orders:read"),
  component: OrdersPage,
});
