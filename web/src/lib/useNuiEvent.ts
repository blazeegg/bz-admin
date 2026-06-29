import { useEffect, useRef } from 'react'

interface NuiMessage<T = unknown> {
  action: string
  data: T
}

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void) {
  const saved = useRef(handler)
  saved.current = handler

  useEffect(() => {
    const listener = (event: MessageEvent<NuiMessage<T>>) => {
      const msg = event.data
      if (msg && msg.action === action) saved.current(msg.data)
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [action])
}
