import type {
  CreateMutationOptions,
  CreateMutationResult,
  MutationFunction,
  MutationKey,
} from '@tanstack/solid-query'
import { createMutation, parseMutationArgs } from '@tanstack/solid-query'

import { queryClientContext as context } from '../../../context'

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: CreateMutationOptions<TData, TError, TVariables, TContext>,
): CreateMutationResult<TData, TError, TVariables, TContext>

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<
    CreateMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >,
): CreateMutationResult<TData, TError, TVariables, TContext>

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  mutationKey: MutationKey,
  options?: Omit<
    CreateMutationOptions<TData, TError, TVariables, TContext>,
    'mutationKey'
  >,
): CreateMutationResult<TData, TError, TVariables, TContext>

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  mutationKey: MutationKey,
  mutationFn?: MutationFunction<TData, TVariables>,
  options?: Omit<
    CreateMutationOptions<TData, TError, TVariables, TContext>,
    'mutationKey' | 'mutationFn'
  >,
): CreateMutationResult<TData, TError, TVariables, TContext>

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  arg1:
    | MutationKey
    | MutationFunction<TData, TVariables>
    | CreateMutationOptions<TData, TError, TVariables, TContext>,
  arg2?:
    | MutationFunction<TData, TVariables>
    | CreateMutationOptions<TData, TError, TVariables, TContext>,
  arg3?: CreateMutationOptions<TData, TError, TVariables, TContext>,
): CreateMutationResult<TData, TError, TVariables, TContext> {
  const options = parseMutationArgs(arg1, arg2, arg3)
  return createMutation({ context, ...options })
}
