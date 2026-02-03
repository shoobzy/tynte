import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Palette as PaletteIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { Slider } from '../ui/Slider'
import { ButtonPreview } from './ButtonPreview'
import { FormPreview } from './FormPreview'
import { CardPreview } from './CardPreview'
import { AlertPreview } from './AlertPreview'
import { usePaletteStore } from '../../stores/paletteStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { Colour } from '../../types/colour'

export function ComponentPreview() {
  const { theme } = usePreferencesStore()
  const { palettes, activePaletteId } = usePaletteStore()
  const [baseShadePercent, setBaseShadePercent] = useState(50)

  // Determine if dark mode based on theme setting
  const isDarkMode = theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' &&
     window.matchMedia('(prefers-color-scheme: dark)').matches)

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  // Extract colours by category
  const getColoursByCategory = (category: string): Colour[] => {
    if (!activePalette) return []
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

  // Calculate indices based on base shade percentage
  const getShadeIndices = (colours: Colour[]) => {
    if (colours.length === 0) return { base: 0, hover: 0, active: 0 }
    if (colours.length === 1) return { base: 0, hover: 0, active: 0 }
    if (colours.length === 2) return { base: 0, hover: 1, active: 1 }

    // Calculate base index from percentage
    const baseIndex = Math.round((baseShadePercent / 100) * (colours.length - 1))

    // Hover and active are darker (higher index), clamped to array bounds
    const hoverIndex = Math.min(baseIndex + 1, colours.length - 1)
    const activeIndex = Math.min(baseIndex + 2, colours.length - 1)

    return { base: baseIndex, hover: hoverIndex, active: activeIndex }
  }

  // Helper to get colour variants for a category
  const getColourVariants = (colours: Colour[], fallbacks: { base: string; hover: string; active: string }) => {
    if (colours.length === 0) {
      return {
        base: fallbacks.base,
        hover: fallbacks.hover,
        active: fallbacks.active,
        foreground: getOptimalTextColour(fallbacks.base),
        indices: { base: -1, hover: -1, active: -1 },
      }
    }

    const indices = getShadeIndices(colours)
    const base = colours[indices.base]?.hex || fallbacks.base
    const hover = colours[indices.hover]?.hex || fallbacks.hover
    const active = colours[indices.active]?.hex || fallbacks.active

    return {
      base,
      hover,
      active,
      foreground: getOptimalTextColour(base),
      indices,
    }
  }

  // Get variants for each category
  const variants = useMemo(() => ({
    primary: getColourVariants(primaryColours, { base: '#6366f1', hover: '#4f46e5', active: '#4338ca' }),
    secondary: getColourVariants(secondaryColours, { base: '#64748b', hover: '#475569', active: '#334155' }),
    accent: getColourVariants(accentColours, { base: '#f472b6', hover: '#ec4899', active: '#db2777' }),
    success: getColourVariants(successColours, { base: '#22c55e', hover: '#16a34a', active: '#15803d' }),
    warning: getColourVariants(warningColours, { base: '#f59e0b', hover: '#d97706', active: '#b45309' }),
    error: getColourVariants(errorColours, { base: '#ef4444', hover: '#dc2626', active: '#b91c1c' }),
    info: getColourVariants(infoColours, { base: '#3b82f6', hover: '#2563eb', active: '#1d4ed8' }),
    neutral: getColourVariants(neutralColours, { base: '#6b7280', hover: '#9ca3af', active: '#4b5563' }),
  }), [baseShadePercent, primaryColours, secondaryColours, accentColours, successColours, warningColours, errorColours, infoColours, neutralColours])

  if (!activePalette) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <PaletteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Select or create a palette to preview components</p>
      </div>
    )
  }

  // Build CSS variables from palette
  const paletteStyles = {
    // Primary variants
    '--preview-primary': variants.primary.base,
    '--preview-primary-hover': variants.primary.hover,
    '--preview-primary-active': variants.primary.active,
    '--preview-primary-foreground': variants.primary.foreground,
    // Secondary variants
    '--preview-secondary': variants.secondary.base,
    '--preview-secondary-hover': variants.secondary.hover,
    '--preview-secondary-active': variants.secondary.active,
    '--preview-secondary-foreground': variants.secondary.foreground,
    // Accent variants
    '--preview-accent': variants.accent.base,
    '--preview-accent-hover': variants.accent.hover,
    '--preview-accent-active': variants.accent.active,
    '--preview-accent-foreground': variants.accent.foreground,
    // Success variants
    '--preview-success': variants.success.base,
    '--preview-success-hover': variants.success.hover,
    '--preview-success-active': variants.success.active,
    '--preview-success-foreground': variants.success.foreground,
    // Warning variants
    '--preview-warning': variants.warning.base,
    '--preview-warning-hover': variants.warning.hover,
    '--preview-warning-active': variants.warning.active,
    '--preview-warning-foreground': variants.warning.foreground,
    // Error variants
    '--preview-error': variants.error.base,
    '--preview-error-hover': variants.error.hover,
    '--preview-error-active': variants.error.active,
    '--preview-error-foreground': variants.error.foreground,
    // Info variants
    '--preview-info': variants.info.base,
    '--preview-info-hover': variants.info.hover,
    '--preview-info-active': variants.info.active,
    '--preview-info-foreground': variants.info.foreground,
    // Neutral variants (for backgrounds, borders, text)
    '--preview-neutral': variants.neutral.base,
    '--preview-neutral-light': variants.neutral.hover,
    '--preview-neutral-dark': variants.neutral.active,
    // Layout colours
    '--preview-background': isDarkMode ? '#0f172a' : '#ffffff',
    '--preview-foreground': isDarkMode ? '#f8fafc' : '#0f172a',
    '--preview-muted': isDarkMode ? '#1e293b' : '#f1f5f9',
    '--preview-muted-foreground': isDarkMode ? '#94a3b8' : '#64748b',
    '--preview-border': isDarkMode ? '#334155' : '#e2e8f0',
    '--preview-card': isDarkMode ? '#1e293b' : '#ffffff',
    '--preview-card-foreground': isDarkMode ? '#f8fafc' : '#0f172a',
  } as React.CSSProperties

  // Find max colours across all categories for scale display
  const maxColours = Math.max(
    primaryColours.length,
    secondaryColours.length,
    accentColours.length,
    successColours.length,
    warningColours.length,
    errorColours.length,
    infoColours.length,
    neutralColours.length
  )

  // Format index display (e.g., "5" or "500" style)
  const formatIndex = (index: number, total: number) => {
    if (index < 0) return '-'
    if (total <= 1) return '0'
    // Use Tailwind-style numbering if we have ~10 shades
    if (total >= 8 && total <= 12) {
      const step = Math.round(900 / (total - 1))
      return String(50 + index * step)
    }
    return String(index + 1)
  }

  const categoryData = [
    { name: 'Primary', key: 'primary', colours: primaryColours },
    { name: 'Secondary', key: 'secondary', colours: secondaryColours },
    { name: 'Accent', key: 'accent', colours: accentColours },
    { name: 'Success', key: 'success', colours: successColours },
    { name: 'Warning', key: 'warning', colours: warningColours },
    { name: 'Error', key: 'error', colours: errorColours },
    { name: 'Info', key: 'info', colours: infoColours },
    { name: 'Neutral', key: 'neutral', colours: neutralColours },
  ] as const

  return (
    <div className="space-y-6">
      {/* Base shade selector */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="max-w-md">
          <Slider
            value={baseShadePercent}
            onChange={setBaseShadePercent}
            min={0}
            max={100}
            step={1}
            label="Base Shade Position"
            valueFormat={(v) => `${v}%`}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Slide to select which shade in your scale to use as the base colour.
            Hover and active states use progressively darker shades.
          </p>
        </div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" /> Base
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/75" /> Hover
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/50" /> Active
            </span>
          </div>
          {maxColours > 0 && (
            <span className="text-xs text-muted-foreground">
              Using shade {Math.round((baseShadePercent / 100) * (maxColours - 1)) + 1} of {maxColours} as base
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {categoryData.map(({ name, key, colours }) => {
            const v = variants[key]
            return (
              <div key={name} className="text-center">
                <div className="flex gap-0.5 mb-1">
                  <div
                    className="flex-1 h-8 rounded-l-md border border-border"
                    style={{ backgroundColor: v.base }}
                    title={`Base: ${v.base}`}
                  />
                  <div
                    className="flex-1 h-8 border border-border"
                    style={{ backgroundColor: v.hover }}
                    title={`Hover: ${v.hover}`}
                  />
                  <div
                    className="flex-1 h-8 rounded-r-md border border-border"
                    style={{ backgroundColor: v.active }}
                    title={`Active: ${v.active}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{name}</p>
                {colours.length > 0 && (
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    {formatIndex(v.indices.base, colours.length)} / {formatIndex(v.indices.hover, colours.length)} / {formatIndex(v.indices.active, colours.length)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
