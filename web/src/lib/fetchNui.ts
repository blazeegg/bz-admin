import { mockResponse } from './mock'

export const isEnvBrowser = (): boolean => !(window as any).invokeNative

const resourceName = (): string => {
  return (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : 'bz-admin'
}

export async function fetchNui<T = unknown>(
  callback: string,
  data: unknown = {},
  mock?: T,
): Promise<T> {
  if (isEnvBrowser()) {
    await new Promise((r) => setTimeout(r, 120))
    return (mock ?? (mockResponse(callback, data) as T)) as T
  }

  const resp = await fetch(`https://${resourceName()}/${callback}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  })

  if (!resp.ok) throw new Error(`NUI ${callback} -> ${resp.status}`)
  return resp.json()
}

export async function rpc<T = any>(name: string, data: unknown = {}): Promise<T> {
  const res = await fetchNui<{ ok: boolean; result: T }>('rpc', { name, data })
  if (!res?.ok) throw new Error((res as any)?.result?.error || 'rpc_failed')
  return res.result
}

export function clientAction(callback: string, data: unknown = {}) {
  return fetchNui(callback, data).catch(() => undefined)
}
