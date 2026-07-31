'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchShelves,
  fetchShelfByToken,
  fetchAlerts,
  fetchHistory,
  fetchStats,
} from '@/lib/actions'
import { useRealtimeTable } from '@/lib/hooks/use-realtime'
import type {
  HistoryEntry,
  ShelfAlert,
  ShelfEvent,
  ShelfWithLatest,
  SensorReading,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// useShelves — all shelves with realtime updates
// ---------------------------------------------------------------------------

export function useShelves() {
  const [shelves, setShelves] = useState<ShelfWithLatest[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchShelves()
    setShelves(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Subscribe to changes on smart_shelves and sensor_readings
  useRealtimeTable('smart_shelves', refresh)
  useRealtimeTable('sensor_readings', refresh)

  return { shelves, loading, refresh }
}

// ---------------------------------------------------------------------------
// useShelfDetail — single shelf with readings, events, alerts
// ---------------------------------------------------------------------------

export function useShelfDetail(token: string) {
  const [shelf, setShelf] = useState<ShelfWithLatest | null>(null)
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [events, setEvents] = useState<ShelfEvent[]>([])
  const [alerts, setAlerts] = useState<ShelfAlert[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchShelfByToken(token)
    setShelf(data.shelf)
    setReadings(data.readings)
    setEvents(data.events)
    setAlerts(data.alerts)
    setLoading(false)
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  const tokenFilter = `shelf_token=eq.${token}`

  useRealtimeTable('smart_shelves', refresh, `token=eq.${token}`)
  useRealtimeTable('sensor_readings', refresh, tokenFilter)
  useRealtimeTable('events', refresh, tokenFilter)
  useRealtimeTable('alerts', refresh, tokenFilter)

  return { shelf, readings, events, alerts, loading, refresh }
}

// ---------------------------------------------------------------------------
// useAlerts — all alerts with realtime
// ---------------------------------------------------------------------------

export function useAlerts() {
  const [alerts, setAlerts] = useState<ShelfAlert[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchAlerts()
    setAlerts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useRealtimeTable('alerts', refresh)

  return { alerts, loading, refresh }
}

// ---------------------------------------------------------------------------
// useHistory — all history entries with realtime
// ---------------------------------------------------------------------------

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchHistory()
    setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useRealtimeTable('events', refresh)
  useRealtimeTable('sensor_readings', refresh)

  return { entries, loading, refresh }
}

// ---------------------------------------------------------------------------
// useStats — aggregated statistics
// ---------------------------------------------------------------------------

export function useStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await fetchStats()
    setStats(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useRealtimeTable('events', refresh)
  useRealtimeTable('sensor_readings', refresh)
  useRealtimeTable('alerts', refresh)

  return { stats, loading, refresh }
}
