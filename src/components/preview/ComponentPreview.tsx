import { motion } from 'framer-motion'
import { Palette as PaletteIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { ButtonPreview } from './ButtonPreview'
import { FormPreview } from './FormPreview'
import { CardPreview } from './CardPreview'
import { AlertPreview } from './AlertPreview'
import { usePaletteStore } from '../../stores/paletteStore'
import { usePreferencesStore } from '../../stores/preferencesStore'

export function ComponentPreview() {
  const { theme } = usePreferencesStore()
  const { palettes, activePaletteId } = usePaletteStore()

  // Determine if dark mode based on theme setting
  const isDarkMode = theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' &&
     window.matchMedia('(prefers-color-scheme: dark)').matches)

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  if (!activePalette) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <PaletteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Select or create a palette to preview components</p>
      </div>
    )
  }

  // Extract colours by category
  const getColoursByCategory = (category: string) => {
    const cat = activePalette.categories.find((c) => c.category === category)
    return cat?.colours || []
  }

  const primaryColours = getColoursByCategory('primary')
  const secondaryColours = getColoursByCategory('secondary')
  const accentColours = getColoursByCategory('accent')
  const neutralColours = getColoursByCategory('neutral')
  const successColours = getColoursByCategory('success')
  const warningColours = getColoursByCategory('warning')
  const errorColours = getColoursByCategory('error')
  const infoColours = getColoursByCategory('info')

  // Helper to get colour at index or fallback
  const getColour = (colours: typeof primaryColours, index: number, fallback: string) => {
    return colours[index]?.hex || colours[0]?.hex || fallback
  }

  // Build CSS variables from palette
  // First colour = base, second = hover, third = active
  const paletteStyles = {
    // Primary variants
    '--preview-primary': primaryColours[0]?.hex || '#6366f1',
    '--preview-primary-hover': getColour(primaryColours, 1, '#4f46e5'),
    '--preview-primary-active': getColour(primaryColours, 2, '#4338ca'),
    '--preview-primary-foreground': '#ffffff',
    // Secondary variants
    '--preview-secondary': secondaryColours[0]?.hex || '#64748b',
    '--preview-secondary-hover': getColour(secondaryColours, 1, '#475569'),
    '--preview-secondary-active': getColour(secondaryColours, 2, '#334155'),
    '--preview-secondary-foreground': '#ffffff',
    // Accent variants
    '--preview-accent': accentColours[0]?.hex || '#f472b6',
    '--preview-accent-hover': getColour(accentColours, 1, '#ec4899'),
    '--preview-accent-active': getColour(accentColours, 2, '#db2777'),
    '--preview-accent-foreground': '#ffffff',
    // Success variants
    '--preview-success': successColours[0]?.hex || '#22c55e',
    '--preview-success-hover': getColour(successColours, 1, '#16a34a'),
    '--preview-success-active': getColour(successColours, 2, '#15803d'),
    '--preview-success-foreground': '#ffffff',
    // Warning variants
    '--preview-warning': warningColours[0]?.hex || '#f59e0b',
    '--preview-warning-hover': getColour(warningColours, 1, '#d97706'),
    '--preview-warning-active': getColour(warningColours, 2, '#b45309'),
    '--preview-warning-foreground': '#ffffff',
    // Error variants
    '--preview-error': errorColours[0]?.hex || '#ef4444',
    '--preview-error-hover': getColour(errorColours, 1, '#dc2626'),
    '--preview-error-active': getColour(errorColours, 2, '#b91c1c'),
    '--preview-error-foreground': '#ffffff',
    // Info variants
    '--preview-info': infoColours[0]?.hex || '#3b82f6',
    '--preview-info-hover': getColour(infoColours, 1, '#2563eb'),
    '--preview-info-active': getColour(infoColours, 2, '#1d4ed8'),
    '--preview-info-foreground': '#ffffff',
    // Neutral variants (for backgrounds, borders, text)
    '--preview-neutral': neutralColours[0]?.hex || '#6b7280',
    '--preview-neutral-light': getColour(neutralColours, 1, '#9ca3af'),
    '--preview-neutral-dark': getColour(neutralColours, 2, '#4b5563'),
    // Layout colours
    '--preview-background': isDarkMode ? '#0f172a' : '#ffffff',
    '--preview-foreground': isDarkMode ? '#f8fafc' : '#0f172a',
    '--preview-muted': isDarkMode ? '#1e293b' : '#f1f5f9',
    '--preview-muted-foreground': isDarkMode ? '#94a3b8' : '#64748b',
    '--preview-border': isDarkMode ? '#334155' : '#e2e8f0',
    '--preview-card': isDarkMode ? '#1e293b' : '#ffffff',
    '--preview-card-foreground': isDarkMode ? '#f8fafc' : '#0f172a',
  } as React.CSSProperties

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold">Component Preview</h3>
        <p className="text-sm text-muted-foreground">
          See how your palette looks on real UI components
        </p>
      </div>

      {/* Preview container */}
      <motion.div
        className="rounded-lg border border-border overflow-hidden"
        style={paletteStyles}
        layout
      >
        <div
          className="p-6 min-h-[400px] transition-colors duration-200"
          style={{
            backgroundColor: 'var(--preview-background)',
            color: 'var(--preview-foreground)',
          }}
        >
          <Tabs defaultValue="buttons">
            <TabsList
              style={{
                backgroundColor: 'var(--preview-muted)',
                color: 'var(--preview-muted-foreground)',
              }}
            >
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons">
              <ButtonPreview darkMode={isDarkMode} />
            </TabsContent>

            <TabsContent value="forms">
              <FormPreview darkMode={isDarkMode} />
            </TabsContent>

            <TabsContent value="cards">
              <CardPreview darkMode={isDarkMode} />
            </TabsContent>

            <TabsContent value="alerts">
              <AlertPreview darkMode={isDarkMode} />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Colour reference - showing base, hover, and active variants */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" /> Base
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted opacity-75" /> Hover
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted opacity-50" /> Active
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {[
            { name: 'Primary', colours: primaryColours },
            { name: 'Secondary', colours: secondaryColours },
            { name: 'Accent', colours: accentColours },
            { name: 'Success', colours: successColours },
            { name: 'Warning', colours: warningColours },
            { name: 'Error', colours: errorColours },
            { name: 'Info', colours: infoColours },
            { name: 'Neutral', colours: neutralColours },
          ].map(({ name, colours }) => (
            <div key={name} className="text-center">
              <div className="flex gap-0.5 mb-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex-1 h-8 first:rounded-l-md last:rounded-r-md border border-border"
                    style={{ backgroundColor: colours[index]?.hex || colours[0]?.hex || '#cccccc' }}
                    title={colours[index]?.hex || 'Not set'}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{name}</p>
              <p className="text-[10px] text-muted-foreground/60">
                {colours.length} colour{colours.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
