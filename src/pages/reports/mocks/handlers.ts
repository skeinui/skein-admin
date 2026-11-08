import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/reports", () => HttpResponse.json({ data: { hello: "Reports" } })),
];
