import type { Product } from "../api";

/** In-memory rows for the mocks; changes last until the page reloads. */
export const productRows: Product[] = Array.from({ length: 24 }, (_, i) => ({
  sku: `product-${i + 1}`,
  title: `Title ${i + 1}`,
  price: 0 + ((i * 37) % 1000),
  "in-stock": i % 3 !== 0,
  category: (["books", "games", "music"] as const)[i % 3],
  homepage: `https://example.com/${i + 1}`,
}));

const TENANT_IDS = ["acme", "globex", "initech"];

/** Each tenant has rows of its own: which tenant a row belongs to (round-robin over the mock tenants). */
export const productTenants = new Map(
  productRows.map((r, i) => [r.sku, TENANT_IDS[i % TENANT_IDS.length]]),
);

/** The tenant a request is for (lib/http.ts sends it). */
export const tenantOf = (request: Request) => request.headers.get("X-Tenant-Id") ?? "";
