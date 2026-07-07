import axios from 'axios'
import type { Summary, Subscription, TransactionsResponse, UploadResponse } from '../types'

const api = axios.create({ baseURL: '/api' })

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<UploadResponse>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getSummary(sessionId: string): Promise<Summary> {
  const { data } = await api.get<Summary>(`/sessions/${sessionId}/summary`)
  return data
}

export async function getSubscriptions(sessionId: string): Promise<Subscription[]> {
  const { data } = await api.get<Subscription[]>(`/sessions/${sessionId}/subscriptions`)
  return data
}

export async function getTransactions(
  sessionId: string,
  page = 1,
  category?: string,
): Promise<TransactionsResponse> {
  const params: Record<string, string | number> = { page }
  if (category) params.category = category
  const { data } = await api.get<TransactionsResponse>(
    `/sessions/${sessionId}/transactions`,
    { params },
  )
  return data
}
