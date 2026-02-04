import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { Button } from '../../ui/Button'
import { usePreferencesStore } from '../../../stores/preferencesStore'

const lightPalette = {
  primary: '#6217c7',
  primaryForeground: '#ffffff',
  background: '#ffffff',
  foreground: '#1e1e1e',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  card: '#ffffff',
}

const darkPalette = {
  primary: '#a78bfa',
  primaryForeground: '#1e1e1e',
  background: '#18181b',
  foreground: '#fafafa',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  border: '#3f3f46',
  card: '#27272a',
}

export function ComponentPreviewDemo() {
  const { theme } = usePreferencesStore()

  // Determine if the current app theme is dark
  const getInitialDarkState = () => {
    if (theme === 'dark') return true
    if (theme === 'light') return false
    // For 'system', check the actual preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const [isDark, setIsDark] = useState(getInitialDarkState)

  // Update when app theme changes
  useEffect(() => {
    setIsDark(getInitialDarkState())
  }, [theme])
  const palette = isDark ? darkPalette : lightPalette

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      {/* Theme toggle */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-medium">Preview Theme</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDark(!isDark)}
          leftIcon={isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        >
          {isDark ? 'Dark' : 'Light'}
        </Button>
      </div>

      {/* Preview container */}
      <motion.div
        className="rounded-xl p-6 space-y-4"
        style={{
          backgroundColor: palette.background,
          color: palette.foreground,
        }}
        animate={{
          backgroundColor: palette.background,
          color: palette.foreground,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Card preview */}
        <motion.div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: palette.card,
            borderColor: palette.border,
          }}
          animate={{
            backgroundColor: palette.card,
            borderColor: palette.border,
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-semibold mb-1">Card Title</h3>
          <p
            className="text-sm"
            style={{ color: palette.mutedForeground }}
          >
            This is a sample card component styled with your palette.
          </p>
        </motion.div>

        {/* Buttons preview */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: palette.primary,
              color: palette.primaryForeground,
            }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            Primary
          </motion.button>
          <motion.button
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              backgroundColor: 'transparent',
              borderColor: palette.border,
              color: palette.foreground,
            }}
            whileHover={{ backgroundColor: palette.muted }}
            whileTap={{ scale: 0.98 }}
          >
            Secondary
          </motion.button>
          <motion.button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: palette.muted,
              color: palette.mutedForeground,
            }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            Muted
          </motion.button>
        </div>

        {/* Input preview */}
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{
            backgroundColor: palette.background,
            borderColor: palette.border,
          }}
        >
          <input
            type="text"
            placeholder="Type something..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: palette.foreground }}
            readOnly
          />
        </div>
      </motion.div>
    </div>
  )
}
