import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { MonthlyTotal } from '../types'
import { fmt } from '../utils/format'

interface Props {
  monthlyTotals: MonthlyTotal[]
  currency: string
}

function formatMonth(m: string) {
  const [year, month] = m.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatTick(value: number, currency: string) {
  const symbol = new Intl.NumberFormat('en-US', { style: 'currency', currency })
    .formatToParts(0)
    .find((p) => p.type === 'currency')?.value ?? currency
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(1)}k`
  return `${symbol}${value}`
}

export default function SpendingChart({ monthlyTotals, currency }: Props) {
  const data = monthlyTotals.map((m) => ({
    month: formatMonth(m.month),
    amount: m.amount,
  }))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="font-semibold text-slate-200 mb-4">Monthly Spending</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatTick(v, currency)}
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [fmt(value as number, currency), 'Spent']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#colorAmount)"
            dot={false}
            activeDot={{ r: 4, fill: '#0ea5e9' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
