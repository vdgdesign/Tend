import type { Diagnosis } from '../data/mockData'

export async function generateDiagnosis(diagnosis: string, location?: string): Promise<Diagnosis> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diagnosis, location: location || '' }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Request failed with status ${res.status}`)
  }

  return res.json()
}
