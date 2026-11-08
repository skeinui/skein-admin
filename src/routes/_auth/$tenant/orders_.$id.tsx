import { createFileRoute } from "@tanstack/react-router";
import { requireAccess } from "@/modules/access";
import { OrdersDetailPage } from "@/pages/orders/detail";

/** One row's page, /<tenant>/orders/<id>: under the list's menu item, not nested in the list's route. */
export const Route = createFileRoute("/_auth/$tenant/orders_/$id")({
  // Opening the page needs `orders:read`; the 403 page otherwise
  beforeLoad: () => requireAccess("orders:read"),
  component: function OrdersDetailRoute() {
    const { id } = Route.useParams();
    return <OrdersDetailPage id={Number(id)} />;
  },
});
