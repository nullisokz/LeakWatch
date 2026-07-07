import type { Summary } from '../types'
import { fmt } from '../utils/format'

interface Props {
  summary: Summary
  currency: string
}

export default function SummaryCards({ summary, currency }: Props) {
  const cards = [
    {
      label: 'Total Spent',
      value: fmt(summary.total_spent, currency),
      icon: '💸',
      sub: `${summary.transaction_count} transactions`,
    },
    {
      label: 'Avg / Month',
      value: fmt(summary.average_monthly, currency),
      icon: '📅',
      sub: `across ${summary.monthly_totals?.length ?? 0} months`,
    },
    {
      label: 'Subscriptions',
      value: fmt(summary.subscription_total, currency) + '/mo',
      icon: '🔄',
      sub: 'estimated monthly cost',
    },
    {
      label: 'Top Category',
      value: summary.top_category || '—',
      icon: '🏆',
      sub: 'biggest spend area',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-100">{c.value}</p>
          <p className="text-xs text-slate-500">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
