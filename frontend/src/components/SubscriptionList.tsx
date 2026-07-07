import type { Subscription } from '../types'
import { fmt, fmtDate, daysUntil } from '../utils/format'

interface Props {
  subscriptions: Subscription[]
  currency: string
}

const FREQ_LABEL: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

function RenewalBadge({ isoDate }: { isoDate: string }) {
  const days = daysUntil(isoDate)
  if (days <= 3)
    return (
      <span className="text-xs bg-red-900/50 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
        In {days}d
      </span>
    )
  if (days <= 14)
    return (
      <span className="text-xs bg-amber-900/50 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
        In {days}d
      </span>
    )
  return (
    <span className="text-xs text-slate-500">
      {fmtDate(isoDate)}
    </span>
  )
}

export default function SubscriptionList({ subscriptions, currency }: Props) {
  if (subscriptions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
        No recurring subscriptions detected. Upload more history for better detection.
      </div>
    )
  }

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.frequency === 'monthly') return sum + s.amount
    if (s.frequency === 'yearly') return sum + s.amount / 12
    if (s.frequency === 'weekly') return sum + s.amount * 4
    return sum
  }, 0)

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Total subscription cost</p>
          <p className="text-2xl font-bold text-slate-100">{fmt(totalMonthly, currency)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
        </div>
        <p className="text-slate-500 text-sm">{subscriptions.length} active subscriptions</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-5 py-3 text-slate-400 font-medium">Service</th>
              <th className="px-5 py-3 text-slate-400 font-medium">Category</th>
              <th className="px-5 py-3 text-slate-400 font-medium">Frequency</th>
              <th className="px-5 py-3 text-slate-400 font-medium text-right">Amount</th>
              <th className="px-5 py-3 text-slate-400 font-medium">Next Renewal</th>
              <th className="px-5 py-3 text-slate-400 font-medium text-right">Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {subscriptions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-medium text-slate-200 capitalize">{s.name}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-400">{s.category}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {FREQ_LABEL[s.frequency]}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-slate-200">
                  {fmt(s.amount, currency)}
                </td>
                <td className="px-5 py-3.5">
                  <RenewalBadge isoDate={s.next_renewal} />
                </td>
                <td className="px-5 py-3.5 text-right text-slate-500">
                  {s.occurrences}×
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
