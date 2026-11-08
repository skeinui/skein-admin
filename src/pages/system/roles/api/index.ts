import http from "@/lib/http";

export const systemRolesKeys = {
  all: ["system-roles"] as const,
};

export const fetchSystemRoles = () => http.get<unknown>("/api/system-roles");
