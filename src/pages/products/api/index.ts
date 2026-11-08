import http from "@/lib/http";
import type { ListQuery } from "@/lib/list-query";

// Generated from the OpenAPI document by `skein new page products --from`; edit freely.

export interface Product {
  sku: string;
  title: string;
  price: number;
  "in-stock"?: boolean;
  category?: "books" | "games" | "music";
  homepage?: string;
}

export interface ProductInput {
  sku: string;
  title: string;
  price: number;
  "in-stock"?: boolean;
  category?: "books" | "games" | "music";
  homepage?: string;
}

export interface ProductsList {
  items: Product[];
  total: number;
}

/** Query keys: invalidate `productsKeys.all` after a change and every list refetches. */
export const productsKeys = {
  all: ["products"] as const,
  list: (query: ListQuery) => ["products", "list", query] as const,
};

export async function fetchProducts(_query: ListQuery): Promise<ProductsList> {
  const res = await http.get<Product[]>("/v1/catalog/products");
  return { items: res, total: res.length };
}

export const createProduct = (input: ProductInput) =>
  http.post<Product>("/v1/catalog/products", input);

export const updateProduct = (id: string, input: ProductInput) =>
  http.patch<Product>(`/v1/catalog/products/${id}`, input);

export const deleteProduct = (id: string) => http.delete<unknown>(`/v1/catalog/products/${id}`);
