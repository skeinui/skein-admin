import http from "@/lib/http";

export const systemLogsKeys = {
  all: ["system-logs"] as const,
};

export const fetchSystemLogs = () => http.get<unknown>("/api/system-logs");
