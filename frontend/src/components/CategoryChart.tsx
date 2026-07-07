import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryTotal } from '../types'
import { fmt } from '../utils/format'

interface Props {
  categoryTotals: CategoryTotal[]
  currency: string
  onSelectCategory: (category: string) => void
}

function PieTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  currency: string
}) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '8px 12px',
      }}
    >
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{name}</p>
      <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>
        {fmt(value, currency)}
      </p>
    </div>
  )
}

const COLORS = [
  '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#a78bfa', '#34d399', '#fcd34d', '#f87171',
  '#0284c7', '#7c3aed', '#059669', '#d97706', '#dc2626',
]

export default function CategoryChart({ categoryTotals, currency, onSelectCategory }: Props) {
  const top = categoryTotals.slice(0, 8)
  const othersAmount = categoryTotals.slice(8).reduce((s, c) => s + c.amount, 0)
  const data = othersAmount > 0
    ? [...top, { category: 'Other', amount: othersAmount, count: 0 }]
    : top

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-full">
      <h2 className="font-semibold text-slate-200 mb-4">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(entry: any) => {
              const cat = entry?.category as string | undefined
              if (cat && cat !== 'Other') onSelectCategory(cat)
            }}
            style={{ cursor: 'pointer' }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={(props) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <PieTooltip active={(props as any).active} payload={(props as any).payload} currency={currency} />
          )} />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-2 space-y-1.5">
        {data.slice(0, 6).map((c, i) => (
          <li
            key={c.category}
            className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-800 rounded-lg px-2 py-1 -mx-2 transition-colors"
            onClick={() => { if (c.category !== 'Other') onSelectCategory(c.category) }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-slate-300 truncate">{c.category}</span>
            </div>
            <span className="text-slate-400 ml-2 flex-shrink-0">{fmt(c.amount, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
