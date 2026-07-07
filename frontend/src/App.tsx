import { useState } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'

const CURRENCIES = [
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' },
  { code: 'GBP', label: '£ GBP' },
  { code: 'SEK', label: 'kr SEK' },
  { code: 'NOK', label: 'kr NOK' },
  { code: 'DKK', label: 'kr DKK' },
  { code: 'CHF', label: 'Fr CHF' },
  { code: 'CAD', label: '$ CAD' },
  { code: 'AUD', label: '$ AUD' },
  { code: 'JPY', label: '¥ JPY' },
]

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [txCount, setTxCount] = useState(0)
  const [currency, setCurrency] = useState('USD')

  function handleUploaded(id: string, count: number) {
    setSessionId(id)
    setTxCount(count)
  }

  function handleReset() {
    setSessionId(null)
    setTxCount(0)
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
              LW
            </div>
            <span className="font-semibold text-lg tracking-tight">LeakWatch</span>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            {sessionId && (
              <button
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                ← Upload another
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!sessionId ? (
          <Upload onUploaded={handleUploaded} />
        ) : (
          <Dashboard sessionId={sessionId} txCount={txCount} currency={currency} />
        )}
      </main>
    </div>
  )
}
