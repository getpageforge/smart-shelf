import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidToken } from '@/lib/shelf-utils'
import type { DevicePayload } from '@/lib/types'

const VALID_CATEGORIES = [
  'mercearia',
  'hortifruti',
  'limpeza',
  'frios_e_congelados',
]

/**
 * POST /api/ingest
 *
 * Endpoint called by ESP8266 devices to send sensor data and events.
 * Flow:
 *  1. Parse and validate JSON body
 *  2. Validate token format (SHLF-XXXX-XXXX)
 *  3. Look up token in smart_shelves table
 *  4. If not found → 401
 *  5. If found → insert sensor_reading, insert event (if present),
 *     update shelf status to 'online', generate alerts if needed
 */
export async function POST(request: Request) {
  let body: DevicePayload

  // 1. Parse JSON
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido.' },
      { status: 400 },
    )
  }

  // 2. Validate required fields
  if (!body.token) {
    return NextResponse.json(
      { error: 'Token é obrigatório.' },
      { status: 400 },
    )
  }

  if (!isValidToken(body.token)) {
    return NextResponse.json(
      { error: 'Token inválido. Formato esperado: SHLF-XXXX-XXXX.' },
      { status: 400 },
    )
  }

  if (!body.sensor || typeof body.sensor !== 'object') {
    return NextResponse.json(
      { error: 'Dados do sensor são obrigatórios.' },
      { status: 400 },
    )
  }

  if (
    typeof body.sensor.temperature !== 'number' ||
    typeof body.sensor.light !== 'number' ||
    typeof body.sensor.occupied !== 'boolean'
  ) {
    return NextResponse.json(
      {
        error:
          'Sensor deve conter temperature (number), light (number), occupied (boolean).',
      },
      { status: 400 },
    )
  }

  if (body.category && !VALID_CATEGORIES.includes(body.category)) {
    return NextResponse.json(
      { error: 'Categoria inválida.' },
      { status: 400 },
    )
  }

  if (body.event) {
    if (!body.event.type || typeof body.event.quantity !== 'number') {
      return NextResponse.json(
        { error: 'Evento deve conter type (string) e quantity (number).' },
        { status: 400 },
      )
    }
  }

  const supabase = createAdminClient()

  // 3. Look up token in smart_shelves
  const { data: shelf, error: lookupError } = await supabase
    .from('smart_shelves')
    .select('id, token, category')
    .eq('token', body.token)
    .maybeSingle()

  if (lookupError) {
    console.error('Ingest lookup error:', lookupError)
    return NextResponse.json(
      { error: 'Erro interno ao validar token.' },
      { status: 500 },
    )
  }

  // 4. Token not found → reject
  if (!shelf) {
    console.warn(`Ingest rejected: token ${body.token} not registered`)
    return NextResponse.json(
      { error: 'Smart Shelf não cadastrada. Token não encontrado.' },
      { status: 401 },
    )
  }

  // 5. Token found → process data
  const now = new Date().toISOString()

  // Insert sensor reading
  const { error: readingError } = await supabase
    .from('sensor_readings')
    .insert({
      shelf_token: body.token,
      temperature: body.sensor.temperature,
      light: body.sensor.light,
      occupied: body.sensor.occupied,
      created_at: now,
    })

  if (readingError) {
    console.error('Ingest sensor_reading error:', readingError)
    return NextResponse.json(
      { error: 'Erro ao salvar leitura do sensor.' },
      { status: 500 },
    )
  }

  // Insert event (if present)
  if (body.event) {
    const { error: eventError } = await supabase.from('events').insert({
      shelf_token: body.token,
      type: body.event.type,
      quantity: body.event.quantity,
      created_at: now,
    })

    if (eventError) {
      console.error('Ingest event error:', eventError)
      // Non-critical: sensor data was saved, continue
    }
  }

  // Update shelf status to 'online'
  await supabase
    .from('smart_shelves')
    .update({ status: 'online' })
    .eq('token', body.token)

  // Generate alerts if thresholds exceeded
  const alerts: { shelf_token: string; level: string; message: string }[] = []

  // High temperature alert (above 30°C)
  if (body.sensor.temperature > 30) {
    alerts.push({
      shelf_token: body.token,
      level: 'high',
      message: `Temperatura elevada: ${body.sensor.temperature}°C na Smart Shelf ${body.token}.`,
    })
  }

  // Low light alert (below 100 lux — possible sensor obstruction)
  if (body.sensor.light < 100) {
    alerts.push({
      shelf_token: body.token,
      level: 'low',
      message: `Luminosidade baixa: ${body.sensor.light} lux na Smart Shelf ${body.token}.`,
    })
  }

  if (alerts.length > 0) {
    await supabase.from('alerts').insert(alerts)
  }

  return NextResponse.json({
    success: true,
    message: 'Dados recebidos com sucesso.',
    token: body.token,
    timestamp: now,
  })
}
