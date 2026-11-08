import { createFileRoute } from "@tanstack/react-router";
import { requireAccess } from "@/modules/access";
import { ProductsPage } from "@/pages/products";

export const Route = createFileRoute("/_auth/$tenant/products")({
  // Opening the page needs `products:read`; the 403 page otherwise
  beforeLoad: () => requireAccess("products:read"),
  component: ProductsPage,
});
