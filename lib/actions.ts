'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isValidToken } from '@/lib/shelf-utils'
import type {
  ShelfAlert,
  ShelfCategory,
  ShelfEvent,
  ShelfWithLatest,
  SensorReading,
  SmartShelf,
  HistoryEntry,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_CATEGORIES: ShelfCategory[] = [
  'mercearia',
  'hortifruti',
  'limpeza',
  'frios_e_congelados',
]

function isValidCategory(cat: string): cat is ShelfCategory {
  return VALID_CATEGORIES.includes(cat as ShelfCategory)
}

// ---------------------------------------------------------------------------
// Smart Shelf CRUD
// ---------------------------------------------------------------------------

export async function createShelf(data: {
  name: string
  token: string
  category: string
}): Promise<{ success: boolean; error?: string; shelf?: SmartShelf }> {
  if (!data.name.trim()) {
    return { success: false, error: 'O nome é obrigatório.' }
  }
  if (!isValidToken(data.token)) {
    return {
      success: false,
      error: 'Token inválido. Use o formato SHLF-XXXX-XXXX (apenas números).',
    }
  }
  if (!isValidCategory(data.category)) {
    return { success: false, error: 'Categoria inválida.' }
  }

  const supabase = createAdminClient()
  if (!supabase) return { success: false, error: 'Banco de dados indisponível.' }

  // Check for duplicate token
  const { data: existing } = await supabase
    .from('smart_shelves')
    .select('id')
    .eq('token', data.token)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Token já utilizado por outra Smart Shelf.' }
  }

  const { data: shelf, error } = await supabase
    .from('smart_shelves')
    .insert({
      name: data.name.trim(),
      token: data.token,
      category: data.category,
      status: 'offline',
    })
    .select()
    .single()

  if (error) {
    console.error('createShelf error:', error)
    return { success: false, error: 'Erro ao criar Smart Shelf.' }
  }

  return { success: true, shelf }
}

export async function updateShelfName(
  token: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: 'O nome é obrigatório.' }
  }
  if (!isValidToken(token)) {
    return { success: false, error: 'Token inválido.' }
  }

  const supabase = createAdminClient()
  if (!supabase) return { success: false, error: 'Banco de dados indisponível.' }

  const { error } = await supabase
    .from('smart_shelves')
    .update({ name: name.trim() })
    .eq('token', token)

  if (error) {
    console.error('updateShelfName error:', error)
    return { success: false, error: 'Erro ao atualizar nome.' }
  }

  return { success: true }
}

export async function deleteShelf(
  token: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidToken(token)) {
    return { success: false, error: 'Token inválido.' }
  }

  const supabase = createAdminClient()
  if (!supabase) return { success: false, error: 'Banco de dados indisponível.' }

  // Cascading deletes are handled by FK ON DELETE CASCADE
  const { error } = await supabase
    .from('smart_shelves')
    .delete()
    .eq('token', token)

  if (error) {
    console.error('deleteShelf error:', error)
    return { success: false, error: 'Erro ao excluir Smart Shelf.' }
  }

  return { success: true }
}

// ---------------------------------------------------------------------------
// Fetch operations
// ---------------------------------------------------------------------------

export async function fetchShelves(): Promise<ShelfWithLatest[]> {
  const supabase = createAdminClient()
  if (!supabase) return []

  try {
    const { data: shelves, error } = await supabase
    .from('smart_shelves')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !shelves) {
    console.error('fetchShelves error:', error)
    return []
  }

  // For each shelf, get the latest sensor reading
  const enriched: ShelfWithLatest[] = await Promise.all(
    shelves.map(async (shelf) => {
      const { data: reading } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('shelf_token', shelf.token)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        ...shelf,
        temperature: reading?.temperature ?? null,
        light: reading?.light ?? null,
        occupied: reading?.occupied ?? null,
        last_reading_at: reading?.created_at ?? null,
      }
    }),
  )

  return enriched
  } catch (err) {
    console.error('fetchShelves exception:', err)
    return []
  }
}

export async function fetchShelfByToken(
  token: string,
): Promise<{
  shelf: ShelfWithLatest | null
  readings: SensorReading[]
  events: ShelfEvent[]
  alerts: ShelfAlert[]
}> {
  const supabase = createAdminClient()
  if (!supabase) return { shelf: null, readings: [], events: [], alerts: [] }

  try {
    const { data: shelf } = await supabase
    .from('smart_shelves')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!shelf) {
    return { shelf: null, readings: [], events: [], alerts: [] }
  }

  const [readingsRes, eventsRes, alertsRes] = await Promise.all([
    supabase
      .from('sensor_readings')
      .select('*')
      .eq('shelf_token', token)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('events')
      .select('*')
      .eq('shelf_token', token)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('alerts')
      .select('*')
      .eq('shelf_token', token)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const latestReading = readingsRes.data?.[0] ?? null

  return {
    shelf: {
      ...shelf,
      temperature: latestReading?.temperature ?? null,
      light: latestReading?.light ?? null,
      occupied: latestReading?.occupied ?? null,
      last_reading_at: latestReading?.created_at ?? null,
    },
    readings: readingsRes.data ?? [],
    events: eventsRes.data ?? [],
    alerts: alertsRes.data ?? [],
  }
  } catch (err) {
    console.error('fetchShelfByToken exception:', err)
    return { shelf: null, readings: [], events: [], alerts: [] }
  }
}

export async function fetchAlerts(
  shelfToken?: string,
): Promise<ShelfAlert[]> {
  const supabase = createAdminClient()
  if (!supabase) return []

  try {
    let query = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (shelfToken) {
    query = query.eq('shelf_token', shelfToken)
  }

  const { data, error } = await query
  if (error) {
    console.error('fetchAlerts error:', error)
    return []
  }

  return data ?? []
  } catch (err) {
    console.error('fetchAlerts exception:', err)
    return []
  }
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const supabase = createAdminClient()
  if (!supabase) return []

  try {
    // Fetch events
    const { data: events } = await supabase
    .from('events')
    .select('id, shelf_token, type, quantity, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch sensor readings
  const { data: readings } = await supabase
    .from('sensor_readings')
    .select('id, shelf_token, temperature, light, occupied, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch all shelves for name lookup
  const { data: shelves } = await supabase
    .from('smart_shelves')
    .select('token, name')

  const shelfNameMap = new Map(
    (shelves ?? []).map((s) => [s.token, s.name]),
  )

  const history: HistoryEntry[] = []

  for (const ev of events ?? []) {
    history.push({
      id: ev.id,
      shelf_token: ev.shelf_token,
      shelf_name: shelfNameMap.get(ev.shelf_token) ?? ev.shelf_token,
      type: 'event',
      event_type: ev.type,
      quantity: ev.quantity,
      temperature: null,
      light: null,
      occupied: null,
      created_at: ev.created_at,
    })
  }

  for (const r of readings ?? []) {
    history.push({
      id: r.id,
      shelf_token: r.shelf_token,
      shelf_name: shelfNameMap.get(r.shelf_token) ?? r.shelf_token,
      type: 'sensor',
      event_type: 'sensor_update',
      quantity: null,
      temperature: r.temperature,
      light: r.light,
      occupied: r.occupied,
      created_at: r.created_at,
    })
  }

  // Sort by most recent first
  history.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return history.slice(0, 100)
  } catch (err) {
    console.error('fetchHistory exception:', err)
    return []
  }
}

export async function resolveAlert(
  alertId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  if (!supabase) return { success: false, error: 'Banco de dados indisponível.' }

  try {
    const { error } = await supabase
    .from('alerts')
    .update({ resolved: true })
    .eq('id', alertId)

  if (error) {
    console.error('resolveAlert error:', error)
    return { success: false, error: 'Erro ao resolver alerta.' }
  }

  return { success: true }
  } catch (err) {
    console.error('resolveAlert exception:', err)
    return { success: false, error: 'Erro ao resolver alerta.' }
  }
}

export async function validateTokenAvailability(
  token: string,
): Promise<{ valid: boolean; available: boolean }> {
  if (!isValidToken(token)) {
    return { valid: false, available: false }
  }

  const supabase = createAdminClient()
  if (!supabase) return { valid: false, available: false }

  try {
    const { data } = await supabase
    .from('smart_shelves')
    .select('id')
    .eq('token', token)
    .maybeSingle()

  return { valid: true, available: !data }
  } catch (err) {
    console.error('validateTokenAvailability exception:', err)
    return { valid: false, available: false }
  }
}

export async function fetchStats() {
  const supabase = createAdminClient()
  if (!supabase) {
    return {
      byCompartment: [], byDay: [], temperature: [], alertsByKind: [], totalDevolucoes: 0, totalRecolhimentos: 0, avgTemp: '--', hasData: false
    }
  }
  
  try {
    const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const since = sevenDaysAgo.toISOString()

  const [eventsRes, shelvesRes, readingsRes, alertsRes] = await Promise.all([
    supabase.from('events').select('*').gte('created_at', since),
    supabase.from('smart_shelves').select('token, category'),
    supabase.from('sensor_readings').select('temperature, created_at').gte('created_at', since).not('temperature', 'is', null),
    supabase.from('alerts').select('level').gte('created_at', since)
  ])

  const events = eventsRes.data || []
  const shelves = shelvesRes.data || []
  const readings = readingsRes.data || []
  const alerts = alertsRes.data || []

  const shelfMap = new Map(shelves.map(s => [s.token, s.category]))

  // byCompartment (Category)
  const categoryCounts: Record<string, number> = {
    mercearia: 0,
    hortifruti: 0,
    limpeza: 0,
    frios_e_congelados: 0
  }
  
  events.forEach(e => {
    const cat = shelfMap.get(e.shelf_token)
    if (cat && categoryCounts[cat] !== undefined) {
      categoryCounts[cat] += e.quantity || 1
    }
  })

  const byCompartment = [
    { name: 'Limpeza', total: categoryCounts.limpeza },
    { name: 'Mercearia', total: categoryCounts.mercearia },
    { name: 'Hortifruti', total: categoryCounts.hortifruti },
    { name: 'Frios', total: categoryCounts.frios_e_congelados },
  ]

  // byDay
  const byDayMap: Record<string, { devolucoes: number, recolhimentos: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' })
    byDayMap[dayStr] = { devolucoes: 0, recolhimentos: 0 }
  }

  events.forEach(e => {
    const d = new Date(e.created_at)
    const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' })
    if (byDayMap[dayStr]) {
      if (e.type.toLowerCase().includes('remove') || e.type.toLowerCase().includes('recolhi')) {
        byDayMap[dayStr].recolhimentos += e.quantity || 1
      } else {
        byDayMap[dayStr].devolucoes += e.quantity || 1
      }
    }
  })
  
  const byDay = Object.keys(byDayMap).map(day => ({
    day,
    devolucoes: byDayMap[day].devolucoes,
    recolhimentos: byDayMap[day].recolhimentos
  }))

  // temperature
  const tempByHourMap: Record<string, { sum: number, count: number }> = {}
  readings.forEach(r => {
    const d = new Date(r.created_at)
    const hour = `${String(d.getHours()).padStart(2, '0')}h`
    if (!tempByHourMap[hour]) tempByHourMap[hour] = { sum: 0, count: 0 }
    if (r.temperature != null) {
      tempByHourMap[hour].sum += Number(r.temperature)
      tempByHourMap[hour].count++
    }
  })
  
  const temperature = Object.keys(tempByHourMap).sort().map(time => ({
    time,
    temp: Number((tempByHourMap[time].sum / tempByHourMap[time].count).toFixed(1))
  }))

  // alertsByKind
  const alertCounts: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0
  }
  alerts.forEach(a => {
    if (alertCounts[a.level] !== undefined) alertCounts[a.level]++
  })

  const alertsByKind = [
    { name: 'Alta Prioridade', value: alertCounts.high },
    { name: 'Média Prioridade', value: alertCounts.medium },
    { name: 'Baixa Prioridade', value: alertCounts.low },
  ].filter(a => a.value > 0)

  // Aggregated totals
  const totalDevolucoes = byDay.reduce((acc, curr) => acc + curr.devolucoes, 0)
  const totalRecolhimentos = byDay.reduce((acc, curr) => acc + curr.recolhimentos, 0)
  const avgTemp = temperature.length > 0 ? (temperature.reduce((acc, curr) => acc + curr.temp, 0) / temperature.length).toFixed(1) : '--'
  
  return {
    byCompartment,
    byDay,
    temperature,
    alertsByKind,
    totalDevolucoes,
    totalRecolhimentos,
    avgTemp,
    hasData: events.length > 0 || readings.length > 0 || alerts.length > 0
  }
  } catch (err) {
    console.error('fetchStats exception:', err)
    return {
      byCompartment: [], byDay: [], temperature: [], alertsByKind: [], totalDevolucoes: 0, totalRecolhimentos: 0, avgTemp: '--', hasData: false
    }
  }
}

// ---------------------------------------------------------------------------
// User Profile (onboarding + conta)
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string
  name: string
  role: string
  email: string
  phone: string
  created_at: string
}

/**
 * Cria um cliente Supabase para operações na tabela user_profiles.
 * Usa o admin client quando disponível (tem service role key).
 * Caso contrário, usa o cliente anônimo — a tabela user_profiles
 * tem política RLS aberta para anon (anon_all_profiles), então
 * não é necessário service role para leitura/escrita de perfis.
 */
function createProfileClient() {
  // Prefere o admin client (service role ignora RLS e é mais robusto)
  const admin = createAdminClient()
  if (admin) return admin

  // Fallback: cliente anônimo direto usando apenas as variáveis NEXT_PUBLIC_*
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  // Importação dinâmica inline — createClient de @supabase/supabase-js
  // já está disponível no bundle do servidor pois admin.ts o usa
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function getProfile(
  id: string,
): Promise<UserProfile | null> {
  if (!id) return null
  const supabase = createProfileClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('getProfile error:', error)
      return null
    }
    return data ?? null
  } catch (err) {
    console.error('getProfile exception:', err)
    return null
  }
}

export async function saveUserProfile(profile: {
  id: string
  name: string
  role: string
  email: string
  phone: string
}): Promise<{ success: boolean; error?: string; data?: UserProfile }> {
  if (!profile.id) return { success: false, error: 'ID inválido.' }
  if (!profile.name.trim()) return { success: false, error: 'Nome é obrigatório.' }

  const supabase = createProfileClient()
  if (!supabase) {
    return {
      success: false,
      error: 'Variáveis de ambiente do Supabase não configuradas. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    }
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: profile.id,
          name: profile.name.trim(),
          role: profile.role.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        },
        { onConflict: 'id' },
      )
      .select()
      .single()

    if (error) {
      console.error('saveUserProfile error:', error)
      return { success: false, error: `Erro ao salvar perfil: ${error.message}` }
    }

    return { success: true, data }
  } catch (err) {
    console.error('saveUserProfile exception:', err)
    return { success: false, error: 'Erro ao salvar perfil.' }
  }
}
