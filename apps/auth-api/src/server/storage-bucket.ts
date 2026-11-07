import { isDynamicRecord, isFunction } from "@whilo/contracts/runtime-values";
import { requireWorkerBindings } from "./types";

/**
 * The storage a deployment has. A Worker without R2 keeps every route working except the ones that read
 * or write these buckets, and those answer `503` with the binding's name instead of failing at boot.
 */
export function storageBucket(bucket: R2Bucket | undefined, binding: string): R2Bucket {
  if (bucket) return bucket;
  const unavailable = () => {
    throw new StorageUnavailableError(binding);
  };
  return { get: unavailable, put: unavailable, delete: unavailable, head: unavailable, list: unavailable } as unknown as R2Bucket;
}

/** R2 is off on this deployment, so a route that needs a bucket answers `503` rather than `500`. */
export class StorageUnavailableError extends Error {
  constructor(readonly binding: string) {
    super(`The ${binding} bucket is not configured: R2 is off on this deployment.`);
    this.name = "StorageUnavailableError";
  }
}

/**
 * The bindings the marketplace services receive. They are always called through `requestSkillMarketplace`
 * and its siblings, which fill the bucket with `storageBucket`, so the bucket is present here even on a
 * deployment where the Worker binding itself is absent.
 */
export interface MarketplaceBindings {
  DB: D1Database;
  SKILLS: R2Bucket;
}

/** True when the value is a bucket binding, used by the boot guard. */
export function isBucket(value: unknown): boolean {
  return isDynamicRecord(value) && isFunction(value.get) && isFunction(value.put) && isFunction(value.delete);
}

/** The D1 binding, which every deployment has. */
export function requireDatabase(value: unknown): D1Database {
  return requireWorkerBindings(value).DB;
}
