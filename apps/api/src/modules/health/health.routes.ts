import { Hono, type Env } from "hono";

export const healthRoutes = new Hono<{ Bindings: Env }>()
  .get("/", (c) => {
    return c.json({
      status: "healthy",
      timestamp: Date.now(),
      service: "disbrowse-api",
    });
  });
