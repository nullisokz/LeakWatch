import type { Transaction } from '../types'
import { fmt, fmtDate } from '../utils/format'

interface Props {
  transactions: Transaction[]
  total: number
  page: number
  pageSize: number
  categoryFilter?: string
  currency: string
  onPageChange: (p: number) => void
  onClearFilter: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Streaming:        'bg-purple-900/50 text-purple-300',
  'Food Delivery':  'bg-orange-900/50 text-orange-300',
  Dining:           'bg-yellow-900/50 text-yellow-300',
  Transport:        'bg-blue-900/50 text-blue-300',
  'Fuel & Parking': 'bg-stone-900/50 text-stone-300',
  Shopping:         'bg-pink-900/50 text-pink-300',
  Fitness:          'bg-green-900/50 text-green-300',
  Health:           'bg-teal-900/50 text-teal-300',
  Utilities:        'bg-cyan-900/50 text-cyan-300',
  Gaming:           'bg-indigo-900/50 text-indigo-300',
  'Software & Tools':'bg-violet-900/50 text-violet-300',
  Insurance:        'bg-slate-700/50 text-slate-300',
  Travel:           'bg-sky-900/50 text-sky-300',
  Finance:          'bg-emerald-900/50 text-emerald-300',
  Groceries:        'bg-lime-900/50 text-lime-300',
  Other:            'bg-slate-800 text-slate-400',
}

function CategoryPill({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other']
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{category}</span>
  )
}

export default function TransactionTable({
  transactions,
  total,
  page,
  pageSize,
  categoryFilter,
  currency,
  onPageChange,
  onClearFilter,
}: Props) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-400">{total} transactions</p>
          {categoryFilter && (
            <button
              onClick={onClearFilter}
              className="text-xs bg-brand-700/40 text-brand-300 border border-brand-700 px-2 py-0.5 rounded-full hover:bg-brand-700/70 transition-colors"
            >
              {categoryFilter} ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <span>{page} / {totalPages || 1}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="px-5 py-3 text-slate-400 font-medium">Date</th>
              <th className="px-5 py-3 text-slate-400 font-medium">Description</th>
              <th className="px-5 py-3 text-slate-400 font-medium">Category</th>
              <th className="px-5 py-3 text-slate-400 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                  {fmtDate(tx.date)}
                </td>
                <td className="px-5 py-3 text-slate-200 max-w-xs truncate">
                  {tx.description}
                </td>
                <td className="px-5 py-3">
                  <CategoryPill category={tx.category} />
                </td>
                <td className="px-5 py-3 text-right font-mono text-slate-200">
                  {fmt(tx.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="text-center text-slate-500 py-12">No transactions found.</p>
        )}
      </div>
    </div>
  )
}
