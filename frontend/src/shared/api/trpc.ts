import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@garden/backend/src/router/index";

export const trpc = createTRPCReact<AppRouter>();
