import http from "@/lib/http";

export const reportsKeys = {
  all: ["reports"] as const,
};

export const fetchReports = () => http.get<unknown>("/api/reports");
