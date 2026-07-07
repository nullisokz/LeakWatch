import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadCSV } from '../api/client'

interface Props {
  onUploaded: (sessionId: string, txCount: number) => void
}

export default function Upload({ onUploaded }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setLoading(true)
      setError(null)
      try {
        const res = await uploadCSV(file)
        onUploaded(res.session_id, res.transactions)
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Upload failed. Please check your CSV format.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [onUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'] },
    multiple: false,
    disabled: loading,
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-3 max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Find your money leaks.
        </h1>
        <p className="text-slate-400 text-lg">
          Upload a bank statement CSV and instantly see spending by category,
          monthly trends, and detected subscriptions — all processed locally.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 select-none
          ${isDragActive
            ? 'border-brand-400 bg-brand-500/10 scale-[1.02]'
            : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800/60'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
            {loading ? '⏳' : isDragActive ? '📂' : '📄'}
          </div>
          {loading ? (
            <div className="space-y-2">
              <p className="font-medium text-brand-400">Parsing your transactions…</p>
              <p className="text-sm text-slate-500">Concurrent analysis in progress</p>
            </div>
          ) : isDragActive ? (
            <p className="font-medium text-brand-400">Drop it!</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium">Drop your CSV here</p>
              <p className="text-sm text-slate-400">or click to browse</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="w-full max-w-lg bg-red-900/30 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-lg">
        <p className="text-xs text-slate-500 text-center mb-3">Supported formats</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
          {[
            { name: 'Standard', cols: 'Date, Description, Amount' },
            { name: 'Debit/Credit', cols: 'Date, Merchant, Debit, Credit' },
            { name: 'Categorized', cols: 'Date, Merchant, Category, Amount' },
          ].map((f) => (
            <div key={f.name} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
              <p className="font-medium text-slate-300 mb-1">{f.name}</p>
              <p className="text-slate-500 font-mono">{f.cols}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
