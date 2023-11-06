import type { Awaitable } from '@datadayrepos/usevueshared'
import type { MaybeElementRef } from './unrefElement'

export interface StorageLikeAsync {
  getItem(key: string): Awaitable<string | null>
  setItem(key: string, value: string): Awaitable<void>
  removeItem(key: string): Awaitable<void>
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * @experimental The API is not finalized yet. It might not follow semver.
 */
export interface SSRHandlersMap {
  getDefaultStorage: () => StorageLike | undefined
  getDefaultStorageAsync: () => StorageLikeAsync | undefined
  updateHTMLAttrs: (selector: string | MaybeElementRef, attribute: string, value: string) => void
}

const _global
  = typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      // eslint-disable-next-line no-restricted-globals
      : typeof global !== 'undefined' // <= line 30
        // eslint-disable-next-line no-restricted-globals
        ? global // <= line 31
        // eslint-disable-next-line no-restricted-globals
        : typeof self !== 'undefined'
          // eslint-disable-next-line no-restricted-globals
          ? self
          : {}

const globalKey = '__vueuse_ssr_handlers__'
const handlers = /* #__PURE__ */ getHandlers()

function getHandlers() {
  if (!(globalKey in _global))
    // @ts-expect-error inject global // <= line 43
    _global[globalKey] = _global[globalKey] || {}
  // @ts-expect-error inject global
  return _global[globalKey] as Partial<SSRHandlersMap>
}

export function getSSRHandler<T extends keyof SSRHandlersMap>(key: T, fallback: SSRHandlersMap[T]): SSRHandlersMap[T]
export function getSSRHandler<T extends keyof SSRHandlersMap>(key: T, fallback: SSRHandlersMap[T] | undefined): SSRHandlersMap[T] | undefined
export function getSSRHandler<T extends keyof SSRHandlersMap>(key: T, fallback?: SSRHandlersMap[T]): SSRHandlersMap[T] | undefined {
  return handlers[key] as SSRHandlersMap[T] || fallback
}

export function setSSRHandler<T extends keyof SSRHandlersMap>(key: T, fn: SSRHandlersMap[T]) {
  handlers[key] = fn
}
