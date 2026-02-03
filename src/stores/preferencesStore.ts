import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ColourFormat } from '../types/colour'
import { ExportFormat } from '../types/export'

type Theme = 'light' | 'dark' | 'system'
type ColourNotation = 'hex' | 'rgb' | 'hsl' | 'oklch'

interface KeyboardShortcuts {
  newPalette: string
  savePalette: string
  exportPalette: string
  addColour: string
  deleteColour: string
  copyColour: string
  undo: string
  redo: string
  toggleSidebar: string
  toggleDarkMode: string
}

interface PreferencesStore {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  initializeTheme: () => void

  // Colour display preferences
  defaultColourFormat: ColourFormat
  setDefaultColourFormat: (format: ColourFormat) => void
  showColourNames: boolean
  setShowColourNames: (show: boolean) => void
  colourNotation: ColourNotation
  setColourNotation: (notation: ColourNotation) => void

  // Export preferences
  defaultExportFormat: ExportFormat
  setDefaultExportFormat: (format: ExportFormat) => void
  exportPrefix: string
  setExportPrefix: (prefix: string) => void
  includeComments: boolean
  setIncludeComments: (include: boolean) => void

  // UI preferences
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
  showWelcomeScreen: boolean
  setShowWelcomeScreen: (show: boolean) => void
  confirmDelete: boolean
  setConfirmDelete: (confirm: boolean) => void

  // Accessibility preferences
  reduceMotion: boolean
  setReduceMotion: (reduce: boolean) => void
  highContrast: boolean
  setHighContrast: (high: boolean) => void

  // Keyboard shortcuts
  shortcuts: KeyboardShortcuts
  updateShortcut: (key: keyof KeyboardShortcuts, value: string) => void
  resetShortcuts: () => void

  // Recent colours
  recentColours: string[]
  addRecentColour: (hex: string) => void
  clearRecentColours: () => void

  // Favourites
  favouritePaletteIds: string[]
  toggleFavouritePalette: (id: string) => void
}

const defaultShortcuts: KeyboardShortcuts = {
  newPalette: 'mod+n',
  savePalette: 'mod+s',
  exportPalette: 'mod+e',
  addColour: 'mod+shift+c',
  deleteColour: 'delete',
  copyColour: 'mod+c',
  undo: 'mod+z',
  redo: 'mod+shift+z',
  toggleSidebar: 'mod+b',
  toggleDarkMode: 'mod+d',
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      initializeTheme: () => {
        const theme = get().theme
        applyTheme(theme)
      },

      // Colour display preferences
      defaultColourFormat: 'hex',
      setDefaultColourFormat: (format) => set({ defaultColourFormat: format }),
      showColourNames: true,
      setShowColourNames: (show) => set({ showColourNames: show }),
      colourNotation: 'hex',
      setColourNotation: (notation) => set({ colourNotation: notation }),

      // Export preferences
      defaultExportFormat: 'css',
      setDefaultExportFormat: (format) => set({ defaultExportFormat: format }),
      exportPrefix: 'color',
      setExportPrefix: (prefix) => set({ exportPrefix: prefix }),
      includeComments: true,
      setIncludeComments: (include) => set({ includeComments: include }),

      // UI preferences
      compactMode: false,
      setCompactMode: (compact) => set({ compactMode: compact }),
      showWelcomeScreen: true,
      setShowWelcomeScreen: (show) => set({ showWelcomeScreen: show }),
      confirmDelete: true,
      setConfirmDelete: (confirm) => set({ confirmDelete: confirm }),

      // Accessibility preferences
      reduceMotion: false,
      setReduceMotion: (reduce) => set({ reduceMotion: reduce }),
      highContrast: false,
      setHighContrast: (high) => set({ highContrast: high }),

      // Keyboard shortcuts
      shortcuts: defaultShortcuts,
      updateShortcut: (key, value) =>
        set((state) => ({
          shortcuts: { ...state.shortcuts, [key]: value },
        })),
      resetShortcuts: () => set({ shortcuts: defaultShortcuts }),

      // Recent colours
      recentColours: [],
      addRecentColour: (hex) =>
        set((state) => {
          const filtered = state.recentColours.filter(
            (c) => c.toLowerCase() !== hex.toLowerCase()
          )
          return {
            recentColours: [hex.toLowerCase(), ...filtered].slice(0, 20),
          }
        }),
      clearRecentColours: () => set({ recentColours: [] }),

      // Favourites
      favouritePaletteIds: [],
      toggleFavouritePalette: (id) =>
        set((state) => ({
          favouritePaletteIds: state.favouritePaletteIds.includes(id)
            ? state.favouritePaletteIds.filter((i) => i !== id)
            : [...state.favouritePaletteIds, id],
        })),
    }),
    {
      name: 'tynte-preferences',
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = usePreferencesStore.getState()
    if (state.theme === 'system') {
      applyTheme('system')
    }
  })
}
