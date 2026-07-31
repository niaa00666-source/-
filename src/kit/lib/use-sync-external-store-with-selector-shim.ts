// See use-sync-external-store-shim.ts for why this exists. Ports the
// `useSyncExternalStoreWithSelector` algorithm from React's own
// `use-sync-external-store/cjs/use-sync-external-store-with-selector.production.js`
// (MIT, Meta Platforms) as plain ESM against the native React 18/19 hook,
// instead of pulling in the CJS package that trips up bundler interop.
//
// eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/exhaustive-deps --
// this is a byte-for-byte port of React's own reference algorithm: the ref
// read is the documented lazy-init exception (react.dev/reference/react/useRef),
// and `hasMemo`/`memoizedSnapshot` are a memoization cache mutated by the
// closure `useMemo` returns, not during render itself.
/* eslint-disable react-hooks/refs, react-hooks/immutability */
import * as React from "react"

type EqualityFn<T> = (a: T, b: T) => boolean

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: (() => Snapshot) | undefined,
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: EqualityFn<Selection>
): Selection {
  const instRef = React.useRef<{ hasValue: boolean; value: Selection | null }>(
    null as unknown as { hasValue: boolean; value: Selection | null }
  )
  if (instRef.current === null) {
    instRef.current = { hasValue: false, value: null }
  }
  const inst = instRef.current

  const [getSelection, getServerSelection] = React.useMemo(() => {
    let hasMemo = false
    let memoizedSnapshot: Snapshot
    let memoizedSelection: Selection

    const memoizedSelector = (nextSnapshot: Snapshot) => {
      if (!hasMemo) {
        hasMemo = true
        memoizedSnapshot = nextSnapshot
        const nextSelection = selector(nextSnapshot)
        if (isEqual !== undefined && inst.hasValue) {
          const currentSelection = inst.value as Selection
          if (isEqual(currentSelection, nextSelection)) {
            memoizedSelection = currentSelection
            return currentSelection
          }
        }
        memoizedSelection = nextSelection
        return nextSelection
      }

      const currentSelection = memoizedSelection
      if (Object.is(memoizedSnapshot, nextSnapshot)) {
        return currentSelection
      }

      const nextSelection = selector(nextSnapshot)
      if (isEqual !== undefined && isEqual(currentSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot
        return currentSelection
      }

      memoizedSnapshot = nextSnapshot
      memoizedSelection = nextSelection
      return nextSelection
    }

    const maybeGetServerSnapshot =
      getServerSnapshot === undefined ? null : getServerSnapshot

    return [
      () => memoizedSelector(getSnapshot()),
      maybeGetServerSnapshot === null
        ? undefined
        : () => memoizedSelector(maybeGetServerSnapshot()),
    ] as const
    // `inst` is intentionally excluded — it's a stable ref-backed cache, not
    // a value this memo should recompute for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSnapshot, getServerSnapshot, selector, isEqual])

  const value = React.useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection
  )

  React.useEffect(() => {
    inst.hasValue = true
    inst.value = value
  }, [value, inst])

  React.useDebugValue(value)

  return value
}
