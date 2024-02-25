import type { Env } from "@/pkg/env";
import { Analytics } from "../analytics";
import { TieredCache } from "../cache/tiered";
import { Database } from "../db";
import { KeyService } from "../keys/service";
import { Logger } from "../logging";
import { Metrics } from "../metrics";
import { RateLimiter } from "../ratelimit";
import { UsageLimiter } from "../usagelimit";

export type ServiceContext = {
  cache: TieredCache;
  db: Database;
  metrics: Metrics;
  logger: Logger;
  keyService: KeyService;
  analytics: Analytics;
  usageLimiter: UsageLimiter;
  rateLimiter: RateLimiter;
};

export type HonoEnv = {
  Bindings: Env;
  Variables: {
    requestId: string;
    services: ServiceContext;
  };
};
