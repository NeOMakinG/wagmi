import type { QueryClient } from '@tanstack/solid-query'
import { QueryClientProvider } from '@tanstack/solid-query'
import type { Provider, WebSocketProvider } from '@wagmi/core'
import { createComponent, createContext, useContext } from 'solid-js'
import type { ComponentProps } from 'solid-js'

import type { Client } from './client'

export const Context = createContext<
  Client<Provider, WebSocketProvider> | undefined
>(undefined)

export const queryClientContext = createContext<QueryClient | undefined>(
  undefined,
)

export type WagmiConfigProps<
  TProvider extends Provider = Provider,
  TWebSocketProvider extends WebSocketProvider = WebSocketProvider,
> = {
  /** React-decorated Client instance */
  client: Client<TProvider, TWebSocketProvider>
}
export function WagmiConfig<
  TProvider extends Provider,
  TWebSocketProvider extends WebSocketProvider,
>({
  children,
  client,
}: WagmiConfigProps<TProvider, TWebSocketProvider> & ComponentProps<any>) {
  // Bailing out of using JSX
  // https://github.com/egoist/tsup/issues/390#issuecomment-933488738
  return createComponent(Context.Provider, {
    children: createComponent(QueryClientProvider, {
      children,
      client: client.queryClient,
      context: queryClientContext,
    }),
    value: client as unknown as Client,
  })
}

export function useClient<
  TProvider extends Provider,
  TWebSocketProvider extends WebSocketProvider = WebSocketProvider,
>() {
  const client = useContext(Context) as unknown as Client<
    TProvider,
    TWebSocketProvider
  >
  if (!client)
    throw new Error(
      [
        '`useClient` must be used within `WagmiConfig`.\n',
        'Read more: https://wagmi.sh/react/WagmiConfig',
      ].join('\n'),
    )
  return client
}
