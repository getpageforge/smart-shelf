export type ShelfCategory =
  | 'mercearia'
  | 'hortifruti'
  | 'limpeza'
  | 'frios_e_congelados'

export type ShelfStatus = 'online' | 'offline' | 'reconnecting'

export type AlertLevel = 'low' | 'medium' | 'high'

export interface SmartShelf {
  id: string
  name: string
  token: string
  category: ShelfCategory
  status: ShelfStatus
  created_at: string
}

export interface SensorReading {
  id: string
  shelf_token: string
  temperature: number | null
  light: number | null
  occupied: boolean
  created_at: string
}

export interface ShelfEvent {
  id: string
  shelf_token: string
  type: string
  quantity: number
  created_at: string
}

export interface ShelfAlert {
  id: string
  shelf_token: string
  level: AlertLevel
  message: string
  resolved: boolean
  created_at: string
}

export interface ShelfWithLatest extends SmartShelf {
  temperature: number | null
  light: number | null
  occupied: boolean | null
  last_reading_at: string | null
}

export interface HistoryEntry {
  id: string
  shelf_token: string
  shelf_name: string
  type: 'event' | 'sensor'
  event_type: string | null
  quantity: number | null
  temperature: number | null
  light: number | null
  occupied: boolean | null
  created_at: string
}

export interface DevicePayload {
  token: string
  category?: ShelfCategory
  sensor: {
    temperature: number
    light: number
    occupied: boolean
  }
  event?: {
    type: string
    quantity: number
  }
}
