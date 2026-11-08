import http from "@/lib/http";
import { paramAdapter } from "@/lib/list-query";
import type { ListQuery } from "@/lib/list-query";

// Generated from the OpenAPI document by `skein new page orders --from`; edit freely.

export interface Order {
  customer: string;
  email: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  amount: number;
  paid?: boolean;
  deliverOn?: string;
  note?: string;
  id: number;
  createdAt?: string;
}

export interface OrderInput {
  customer: string;
  email: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  amount: number;
  paid?: boolean;
  deliverOn?: string;
  note?: string;
}

export interface OrdersList {
  items: Order[];
  total: number;
}

/**
 * What this API takes, from the parameters of its OpenAPI document: the search bar offers no more than this, and a
 * query the API can't take (an `or`, a field it has no parameter for) raises `UnsupportedQueryError`.
 */
export const ordersAdapter = paramAdapter({
  page: "page",
  pageSize: "pageSize",
  keyword: "q",
  sort: { by: "sortBy", dir: "order", asc: "asc", desc: "desc" },
  fields: { status: { ops: ["eq"] } },
});

/** Query keys: invalidate `ordersKeys.all` after a change and every list refetches. */
export const ordersKeys = {
  all: ["orders"] as const,
  list: (query: ListQuery) => ["orders", "list", query] as const,
  detail: (id: number) => ["orders", "detail", id] as const,
};

export async function fetchOrders(query: ListQuery): Promise<OrdersList> {
  const res = await http.get<{ items: Order[]; total?: number }>("/api/orders", {
    params: ordersAdapter.toRequest(query).params,
  });
  return { items: res.items, total: res.total ?? res.items.length };
}

export const fetchOrder = (id: number) => http.get<Order>(`/api/orders/${id}`);

export const createOrder = (input: OrderInput) => http.post<Order>("/api/orders", input);

export const updateOrder = (id: number, input: OrderInput) =>
  http.put<Order>(`/api/orders/${id}`, input);

export const deleteOrder = (id: number) => http.delete<unknown>(`/api/orders/${id}`);
