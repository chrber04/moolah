import { Hono, type Env } from "hono";
import { cors } from "hono/cors";


export const app = new Hono<{ Bindings: Env }>()
  .use("*", cors())
  .route("/health", healthRoutes)
  .route("/discord", discordRoutes)
  .get("/", (c) => c.json({ service: "moolah-api", version: "1.0.0" }));
