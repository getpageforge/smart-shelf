'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Callback = () => void

/**
 * Subscribe to Supabase Realtime changes on a table.
 * Calls `onchange` whenever an INSERT, UPDATE or DELETE occurs.
 */
export function useRealtimeTable(
  table: string,
  onchange: Callback,
  filter?: string,
) {
  const callbackRef = useRef(onchange)
  callbackRef.current = onchange

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const channelName = filter ? `${table}:${filter}` : `${table}:all`

    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          callbackRef.current()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter])
}
