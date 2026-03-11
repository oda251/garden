import { hc } from "hono/client";
import type { AppRoutes } from "@garden/backend/app";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:8787";
};

export const apiClient = hc<AppRoutes>(getBaseUrl());
