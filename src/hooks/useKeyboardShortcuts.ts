import { useEffect, useCallback } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'

type ShortcutHandler = () => void

interface ShortcutConfig {
  [key: string]: ShortcutHandler
}

function parseShortcut(shortcut: string): { key: string; mod: boolean; shift: boolean; alt: boolean } {
  const parts = shortcut.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const mod = parts.includes('mod') || parts.includes('ctrl') || parts.includes('cmd')
  const shift = parts.includes('shift')
  const alt = parts.includes('alt')

  return { key, mod, shift, alt }
}

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const { key, mod, shift, alt } = parseShortcut(shortcut)

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modPressed = isMac ? event.metaKey : event.ctrlKey

  if (mod !== modPressed) return false
  if (shift !== event.shiftKey) return false
  if (alt !== event.altKey) return false

  // Handle special keys
  if (key === 'delete' && (event.key === 'Delete' || event.key === 'Backspace')) {
    return true
  }

  return event.key.toLowerCase() === key
}

export function useKeyboardShortcuts(handlers: ShortcutConfig) {
  const { shortcuts } = usePreferencesStore()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const [action, handler] of Object.entries(handlers)) {
        const shortcut = shortcuts[action as keyof typeof shortcuts]
        if (shortcut && matchesShortcut(event, shortcut)) {
          event.preventDefault()
          handler()
          return
        }
      }
    },
    [handlers, shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function useGlobalShortcuts() {
  // This hook can be used to set up global shortcuts at the app level
  // Individual components can use useKeyboardShortcuts for local shortcuts
}

export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return shortcut
    .split('+')
    .map((part) => {
      const lower = part.toLowerCase()
      if (lower === 'mod') return isMac ? '⌘' : 'Ctrl'
      if (lower === 'shift') return isMac ? '⇧' : 'Shift'
      if (lower === 'alt') return isMac ? '⌥' : 'Alt'
      if (lower === 'delete') return isMac ? '⌫' : 'Del'
      return part.toUpperCase()
    })
    .join(isMac ? '' : '+')
}
