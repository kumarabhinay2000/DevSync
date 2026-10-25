import { useEffect, useRef, useState } from 'react'

/** Copies text and reports a short-lived "copied" flag. Fails quietly if the clipboard is blocked. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied(null)
    }
  }

  return { copied, copy }
}
