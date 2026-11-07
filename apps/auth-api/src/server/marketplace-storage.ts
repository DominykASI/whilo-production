import { Context, Layer } from "effect";
import type { MarketplaceBindings } from "./storage-bucket";

/** Worker storage bindings belong to the request that created the marketplace. */
export class MarketplaceStorage extends Context.Service<MarketplaceStorage, MarketplaceBindings>()(
  "@whilo/auth-api/MarketplaceStorage",
) {
  static layer(bindings: MarketplaceBindings) {
    return Layer.succeed(MarketplaceStorage, bindings);
  }
}
