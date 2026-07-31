// Base UI depends on `use-sync-external-store`, whose CJS files do a
// top-level `require("react")` for React-17 back-compat. That's fine in
// Node/webpack but esbuild/Rolldown can't always fold a nested `require()`
// into our top-level external "react" import, leaving a runtime-throwing
// shim in some bundling paths (rolldown.rs/in-depth/bundling-cjs). Our peer
// range is React 18/19, which always has the native hook, so we alias both
// `use-sync-external-store/shim` entry points (see vite.config.ts) to this
// file instead of ever touching the CJS package.
export { useSyncExternalStore } from "react"
