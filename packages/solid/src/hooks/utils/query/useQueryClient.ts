import { useQueryClient as useQueryClient_ } from '@tanstack/solid-query'

import { queryClientContext as context } from '../../../context'

export const useQueryClient = () => useQueryClient_({ context })
