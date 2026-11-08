import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/system-logs", () => HttpResponse.json({ data: { hello: "Logs" } })),
];
