import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/system-roles", () => HttpResponse.json({ data: { hello: "Roles" } })),
];
