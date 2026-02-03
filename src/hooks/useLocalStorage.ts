import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  // Setter function
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) =>
        value instanceof Function ? value(prev) : value
      )
    },
    []
  )

  // Remove function
  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useLocalStorage(key, initialValue)
  return [value, setValue] as const
}
