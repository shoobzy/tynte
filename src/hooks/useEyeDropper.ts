import { useState, useCallback } from 'react'

interface EyeDropperResult {
  sRGBHex: string
}

interface EyeDropper {
  open(): Promise<EyeDropperResult>
}

declare global {
  interface Window {
    EyeDropper?: new () => EyeDropper
  }
}

export function useEyeDropper() {
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'EyeDropper' in window)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const openEyeDropper = useCallback(async (): Promise<string | null> => {
    if (!isSupported || !window.EyeDropper) {
      setError(new Error('EyeDropper API is not supported in this browser'))
      return null
    }

    setIsOpen(true)
    setError(null)

    try {
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      setIsOpen(false)
      return result.sRGBHex
    } catch (err) {
      setIsOpen(false)
      // User cancelled - not an error
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [isSupported])

  return {
    isSupported,
    isOpen,
    error,
    openEyeDropper,
  }
}
