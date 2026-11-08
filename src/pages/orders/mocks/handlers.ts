import { delay, http, HttpResponse } from "msw";
import { str } from "@/lib/list-query";
import type { Order, OrderInput } from "../api";
import { orderRows, orderTenants, tenantOf } from "./order-data";

const notFound = () => HttpResponse.json({ message: "Not found" }, { status: 404 });

/** The row with this id, of the request's tenant (another tenant's is not found), else -1. */
const findIndex = (request: Request, id: unknown) =>
  orderRows.findIndex((r) => r.id === Number(id) && orderTenants.get(r.id) === tenantOf(request));

/** Numbers by value, anything else as text. */
const compare = (a: unknown, b: unknown) =>
  typeof a === "number" && typeof b === "number" ? a - b : str(a).localeCompare(str(b));

export const handlers = [
  http.get("*/api/orders", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    let matched: Order[] = orderRows.filter((r) => orderTenants.get(r.id) === tenantOf(request));
    const fStatus = url.searchParams.get("status");
    if (fStatus)
      matched = matched.filter((r) =>
        String(r.status).toLowerCase().includes(fStatus.toLowerCase()),
      );
    const fQ = url.searchParams.get("q")?.toLowerCase();
    if (fQ)
      matched = matched.filter((r) => JSON.stringify(Object.values(r)).toLowerCase().includes(fQ));
    // Sorted as asked (sortBy, order) before the page is cut
    const sortKey = url.searchParams.get("sortBy");
    if (sortKey) {
      const sign = /^desc/i.test(url.searchParams.get("order") ?? "") ? -1 : 1;
      matched = [...matched].sort(
        (a, b) =>
          sign *
          compare(
            (a as unknown as Record<string, unknown>)[sortKey],
            (b as unknown as Record<string, unknown>)[sortKey],
          ),
      );
    }
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const items = matched.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ data: { items: items, total: matched.length } });
  }),
  http.post("*/api/orders", async ({ request }) => {
    const input = (await request.json()) as OrderInput;
    const row = { ...input, id: Math.max(0, ...orderRows.map((r) => r.id)) + 1 } as Order;
    orderRows.unshift(row);
    orderTenants.set(row.id, tenantOf(request));
    return HttpResponse.json({ data: row }, { status: 201 });
  }),
  http.get("*/api/orders/:id", async ({ params, request }) => {
    await delay(150);
    const index = findIndex(request, params.id);
    return index < 0 ? notFound() : HttpResponse.json({ data: orderRows[index] });
  }),
  http.put("*/api/orders/:id", async ({ params, request }) => {
    const index = findIndex(request, params.id);
    if (index < 0) return notFound();
    orderRows[index] = { ...orderRows[index], ...((await request.json()) as OrderInput) };
    return HttpResponse.json({ data: orderRows[index] });
  }),
  http.delete("*/api/orders/:id", ({ params, request }) => {
    const index = findIndex(request, params.id);
    if (index < 0) return notFound();
    orderRows.splice(index, 1);
    return HttpResponse.json({ data: null });
  }),
];
