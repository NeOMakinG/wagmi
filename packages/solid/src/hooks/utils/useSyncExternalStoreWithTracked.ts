import { deepEqual } from '@wagmi/core'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector.js'

const isPlainObject = (obj: unknown) =>
  typeof obj === 'object' && !Array.isArray(obj)

export function useSyncExternalStoreWithTracked<
  Snapshot extends Selection,
  Selection = Snapshot,
>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: undefined | null | (() => Snapshot) = getSnapshot,
  isEqual: (a: Selection, b: Selection) => boolean = deepEqual,
) {
  const trackedKeys: string[] = []
  const result = useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getServerSnapshot,
    (x) => x,
    (a, b) => {
      if (isPlainObject(a) && isPlainObject(b) && trackedKeys.length) {
        for (const key of trackedKeys) {
          const equal = isEqual(
            (a as { [key: string]: any })[key],
            (b as { [key: string]: any })[key],
          )
          if (!equal) return false
        }
        return true
      }
      return isEqual(a, b)
    },
  )

  if (isPlainObject(result)) {
    const trackedResult = { ...result }
    Object.defineProperties(
      trackedResult,
      Object.entries(trackedResult as { [key: string]: any }).reduce(
        (res, [key, value]) => {
          return {
            ...res,
            [key]: {
              configurable: false,
              enumerable: true,
              get: () => {
                if (!trackedKeys.includes(key)) {
                  trackedKeys.push(key)
                }
                return value
              },
            },
          }
        },
        {},
      ),
    )
    return trackedResult
  }

  return result
}
