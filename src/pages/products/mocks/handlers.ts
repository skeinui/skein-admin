import { delay, http, HttpResponse } from "msw";
import type { Product, ProductInput } from "../api";
import { productRows, productTenants, tenantOf } from "./product-data";

const notFound = () => HttpResponse.json({ message: "Not found" }, { status: 404 });

/** The row with this id, of the request's tenant (another tenant's is not found), else -1. */
const findIndex = (request: Request, id: unknown) =>
  productRows.findIndex(
    (r) => r.sku === String(id) && productTenants.get(r.sku) === tenantOf(request),
  );

export const handlers = [
  http.get("*/v1/catalog/products", async ({ request }) => {
    await delay(200);
    let matched: Product[] = productRows.filter(
      (r) => productTenants.get(r.sku) === tenantOf(request),
    );

    const items = matched;
    return HttpResponse.json(items);
  }),
  http.post("*/v1/catalog/products", async ({ request }) => {
    const input = (await request.json()) as ProductInput;
    const row = { ...input, sku: input.sku || `product-${Date.now()}` } as Product;
    productRows.unshift(row);
    productTenants.set(row.sku, tenantOf(request));
    return HttpResponse.json(row, { status: 201 });
  }),
  http.patch("*/v1/catalog/products/:id", async ({ params, request }) => {
    const index = findIndex(request, params.id);
    if (index < 0) return notFound();
    productRows[index] = { ...productRows[index], ...((await request.json()) as ProductInput) };
    return HttpResponse.json(productRows[index]);
  }),
  http.delete("*/v1/catalog/products/:id", ({ params, request }) => {
    const index = findIndex(request, params.id);
    if (index < 0) return notFound();
    productRows.splice(index, 1);
    return HttpResponse.json(null);
  }),
];
