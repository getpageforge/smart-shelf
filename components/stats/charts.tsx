'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
const COLORS = {
  primary: '#f97316',
  info: '#3b82f6',
  success: '#22c55e',
  warning: '#eab308',
  purple: '#a855f7',
}

const PIE_COLORS = [COLORS.primary, COLORS.info, COLORS.success, COLORS.warning]

const axisProps = {
  stroke: '#8b93a1',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
}

const tooltipStyle = {
  backgroundColor: '#1b2029',
  border: '1px solid #262c37',
  borderRadius: 12,
  color: '#e7e9ee',
  fontSize: 12,
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsCharts({ stats }: { stats: any }) {
  if (!stats || !stats.hasData) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium">Nenhum dado recebido ainda</p>
        <p className="text-sm text-muted-foreground">
          As estatísticas aparecerão aqui quando os dispositivos enviarem eventos e leituras.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Produtos por compartimento">
        <BarChart data={stats.byCompartment}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262c37" vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#232833' }} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} fill={COLORS.primary} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Devoluções x recolhimentos por dia">
        <LineChart data={stats.byDay}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262c37" vertical={false} />
          <XAxis dataKey="day" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="devolucoes"
            name="Devoluções"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="recolhimentos"
            name="Recolhimentos"
            stroke={COLORS.info}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartCard>

      <ChartCard title="Temperatura média ao longo do dia">
        <AreaChart data={stats.temperature}>
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262c37" vertical={false} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} domain={['dataMin - 1', 'dataMax + 1']} unit="°" />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="temp"
            name="Temperatura"
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#tempFill)"
          />
        </AreaChart>
      </ChartCard>

      <ChartCard title="Alertas gerados por tipo">
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Pie
            data={stats.alertsByKind}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            stroke="none"
          >
            {stats.alertsByKind.map((entry: any, index: number) => (
              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartCard>
    </div>
  )
}

export { StatsCharts }
