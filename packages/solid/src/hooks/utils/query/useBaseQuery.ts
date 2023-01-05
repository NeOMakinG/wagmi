import type {
  CreateBaseQueryOptions,
  QueryKey,
  QueryObserver,
} from '@tanstack/solid-query'
import { notifyManager, useQueryClient } from '@tanstack/solid-query'
import { createEffect, createSignal } from 'solid-js'

import { useSyncExternalStore } from '../useSyncExternalStore'
import { shouldThrowError } from './utils'

export function useBaseQuery<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: CreateBaseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >,
  Observer: typeof QueryObserver,
) {
  const queryClient = useQueryClient({ context: options.context })
  const defaultedOptions = queryClient.defaultQueryOptions(options)

  // Make sure results are optimistically set in fetching state before subscribing or updating options
  defaultedOptions._optimisticResults = 'optimistic'

  // Include callbacks in batch renders
  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(
      defaultedOptions.onError,
    )
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(
      defaultedOptions.onSuccess,
    )
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(
      defaultedOptions.onSettled,
    )
  }

  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly mounting after suspending
    if (typeof defaultedOptions.staleTime !== 'number') {
      defaultedOptions.staleTime = 1_000
    }
  }

  if (defaultedOptions.suspense || defaultedOptions.useErrorBoundary) {
    // Prevent retrying failed query if the error boundary has not been reset yet
    defaultedOptions.retryOnMount = false
  }

  const [observer] = createSignal(
    new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(
      queryClient,
      defaultedOptions,
    ),
  )

  const result = observer().getOptimisticResult(defaultedOptions)

  useSyncExternalStore(
    (onStoreChange: any) =>
      observer().subscribe(notifyManager.batchCalls(onStoreChange)),
    () => observer().getCurrentResult(),
    () => observer().getCurrentResult(),
  )

  createEffect(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer().setOptions(defaultedOptions, { listeners: false })
  }, [defaultedOptions, observer])

  // Handle suspense
  if (defaultedOptions.suspense && result.isLoading && result.isFetching) {
    throw observer()
      .fetchOptimistic(defaultedOptions)
      .then(({ data }) => {
        defaultedOptions.onSuccess?.(data as TData)
        defaultedOptions.onSettled?.(data, null)
      })
      .catch((error) => {
        defaultedOptions.onError?.(error)
        defaultedOptions.onSettled?.(undefined, error)
      })
  }

  // Handle error boundary
  if (
    result.isError &&
    !result.isFetching &&
    shouldThrowError(defaultedOptions.useErrorBoundary, [
      result.error,
      observer().getCurrentQuery(),
    ])
  ) {
    throw result.error
  }

  const status: 'idle' | 'loading' | 'success' | 'error' =
    result.status === 'loading' && result.fetchStatus === 'idle'
      ? 'idle'
      : result.status
  const isIdle = status === 'idle'
  const isLoading = status === 'loading' && result.fetchStatus === 'fetching'

  return {
    ...result,
    defaultedOptions,
    isIdle,
    isLoading,
    observer,
    status,
  } as const
}
