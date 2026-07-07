export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  currency: string
}

export interface MonthlyTotal {
  month: string  // "2024-01"
  amount: number
}

export interface CategoryTotal {
  category: string
  amount: number
  count: number
}

export interface Summary {
  total_spent: number
  average_monthly: number
  transaction_count: number
  monthly_totals: MonthlyTotal[]
  category_totals: CategoryTotal[]
  top_category: string
  subscription_total: number
}

export type Frequency = 'weekly' | 'monthly' | 'yearly'

export interface Subscription {
  id: string
  name: string
  amount: number
  frequency: Frequency
  next_renewal: string
  last_charged: string
  category: string
  occurrences: number
}

export interface UploadResponse {
  session_id: string
  transactions: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  page: number
  page_size: number
}
