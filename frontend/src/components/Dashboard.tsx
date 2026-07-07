import { useEffect, useState } from 'react'
import { getSummary, getSubscriptions, getTransactions } from '../api/client'
import type { Summary, Subscription, Transaction } from '../types'
import SummaryCards from './SummaryCards'
import SpendingChart from './SpendingChart'
import CategoryChart from './CategoryChart'
import SubscriptionList from './SubscriptionList'
import TransactionTable from './TransactionTable'

interface Props {
  sessionId: string
  txCount: number
  currency: string
}

export default function Dashboard({ sessionId, txCount, currency }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalTx, setTotalTx] = useState(0)
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'transactions'>('overview')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [sum, subs] = await Promise.all([
          getSummary(sessionId),
          getSubscriptions(sessionId),
        ])
        setSummary(sum)
        setSubscriptions(subs)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  useEffect(() => {
    async function loadTx() {
      const res = await getTransactions(sessionId, page, categoryFilter)
      setTransactions(res.transactions ?? [])
      setTotalTx(res.total)
    }
    loadTx()
  }, [sessionId, page, categoryFilter])

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Analysing {txCount} transactions…</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'subscriptions' as const, label: `Subscriptions (${subscriptions.length})` },
    { id: 'transactions' as const, label: `Transactions (${totalTx})` },
  ]

  return (
    <div className="space-y-6">
      <SummaryCards summary={summary} currency={currency} />

      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 w-fit border border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <SpendingChart monthlyTotals={summary.monthly_totals} currency={currency} />
          </div>
          <div className="lg:col-span-2">
            <CategoryChart
              categoryTotals={summary.category_totals}
              currency={currency}
              onSelectCategory={(cat) => {
                setCategoryFilter(cat)
                setPage(1)
                setActiveTab('transactions')
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionList subscriptions={subscriptions} currency={currency} />
      )}

      {activeTab === 'transactions' && (
        <TransactionTable
          transactions={transactions}
          total={totalTx}
          page={page}
          pageSize={50}
          categoryFilter={categoryFilter}
          currency={currency}
          onPageChange={setPage}
          onClearFilter={() => { setCategoryFilter(undefined); setPage(1) }}
        />
      )}
    </div>
  )
}
