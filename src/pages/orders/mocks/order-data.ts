import type { Order } from "../api";

const NAMES = [
  "Alice Chen",
  "Bob Li",
  "Carol Wang",
  "David Zhang",
  "Eve Liu",
  "Frank Yang",
  "Grace Zhao",
  "Henry Wu",
];

/** In-memory rows for the mocks; changes last until the page reloads. */
export const orderRows: Order[] = Array.from({ length: 24 }, (_, i) => ({
  customer: NAMES[i % NAMES.length],
  email: `user${i + 1}@example.com`,
  status: (["pending", "paid", "shipped", "cancelled"] as const)[i % 4],
  amount: 0 + ((i * 37) % 10001),
  paid: i % 3 !== 0,
  deliverOn: new Date(Date.UTC(2026, 0, 1 + i * 5)).toISOString().slice(0, 10),
  note: `Note ${i + 1}`,
  id: i + 1,
  createdAt: new Date(Date.UTC(2026, 0, 1 + i * 5, 9 + (i % 8))).toISOString(),
}));

const TENANT_IDS = ["acme", "globex", "initech"];

/** Each tenant has rows of its own: which tenant a row belongs to (round-robin over the mock tenants). */
export const orderTenants = new Map(
  orderRows.map((r, i) => [r.id, TENANT_IDS[i % TENANT_IDS.length]]),
);

/** The tenant a request is for (lib/http.ts sends it). */
export const tenantOf = (request: Request) => request.headers.get("X-Tenant-Id") ?? "";
