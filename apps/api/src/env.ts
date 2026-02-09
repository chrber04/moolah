import * as v from "valibot";
import { Environment } from "./enums/environment.enum";


const reduceIssues = (
  issues: v.BaseIssue<unknown>[],
): {
  field?: string;
  value: unknown;
  message: string;
}[] => {
  return issues.map((issue) => ({
    field: issue.path?.[0].key?.toString(),
    value: issue.input,
    message: issue.message,
  }));
};

const envSchema = v.object({
  ENVIRONMENT: v.enum(Environment),
  WEB_URL: v.pipe(v.string(), v.url()),
  WEB_ADMIN_URL: v.pipe(v.string(), v.url()),
  API_URL: v.pipe(v.string(), v.url()),
});

/**
 * The validated environment configuration.
 * @example { ENVIRONMENT: 'development', WEB_URL: 'https://...', ... }
 */
export type EnvConfig = v.InferOutput<typeof envSchema>;

/**
 * The environment bindings for the Cloudflare Worker with the validated config.
 * @example { DB: D1Database, KV: KVNamespace, ENVIRONMENT: 'development', ... }
 */
export interface Env extends EnvConfig {
  DB: D1Database;
  KV: KVNamespace;
}


// function validateEnv(env: Env) {
//   const result = v.safeParse(envSchema, env);

//   if (!result.success) {
//     const issues = reduceIssues(result.issues);
//     console.error("❌ Environment validation failed:");
//     issues.forEach(({ field, message }) => {
//       console.error(`  - ${field ?? "Unknown field"}: ${message}`);
//     });
//     process.exit(1);
//   }

//   return result.output;
// }

// export const envConfig = validateEnv();
// export type EnvConfig = v.InferOutput<typeof envSchema>;
