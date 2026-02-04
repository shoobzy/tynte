import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Palette as PaletteIcon, Check } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
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
  const [baseShadeIndex, setBaseShadeIndex] = useState<number | null>(null) // null = auto (middle)

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

  // Calculate indices based on selected base shade
  const getShadeIndices = (colours: Colour[]) => {
    if (colours.length === 0) return { base: 0, hover: 0, active: 0 }
    if (colours.length === 1) return { base: 0, hover: 0, active: 0 }
    if (colours.length === 2) return { base: 0, hover: 1, active: 1 }

    // Use selected index, or default to middle of scale
    const defaultBase = Math.floor(colours.length / 2)
    const baseIndex = baseShadeIndex !== null
      ? Math.min(baseShadeIndex, colours.length - 1)
      : defaultBase

    // Hover and active are darker (higher index), clamped to array bounds
    const hoverIndex = Math.min(baseIndex + 1, colours.length - 1)
    const activeIndex = Math.min(baseIndex + 2, colours.length - 1)

    return { base: baseIndex, hover: hoverIndex, active: activeIndex }
  }

  // Helper to get colour variants for a category
  const getColourVariants = (colours: Colour[], fallbacks: { base: string; hover: string; active: string }) => {
    if (colours.length === 0) {
      return {
        base: { hex: fallbacks.base, name: null },
        hover: { hex: fallbacks.hover, name: null },
        active: { hex: fallbacks.active, name: null },
        foreground: getOptimalTextColour(fallbacks.base),
        indices: { base: -1, hover: -1, active: -1 },
      }
    }

    const indices = getShadeIndices(colours)
    const baseColour = colours[indices.base]
    const hoverColour = colours[indices.hover]
    const activeColour = colours[indices.active]

    return {
      base: { hex: baseColour?.hex || fallbacks.base, name: baseColour?.name || null },
      hover: { hex: hoverColour?.hex || fallbacks.hover, name: hoverColour?.name || null },
      active: { hex: activeColour?.hex || fallbacks.active, name: activeColour?.name || null },
      foreground: getOptimalTextColour(baseColour?.hex || fallbacks.base),
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
  }), [baseShadeIndex, primaryColours, secondaryColours, accentColours, successColours, warningColours, errorColours, infoColours, neutralColours])

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
    '--preview-primary': variants.primary.base.hex,
    '--preview-primary-hover': variants.primary.hover.hex,
    '--preview-primary-active': variants.primary.active.hex,
    '--preview-primary-foreground': variants.primary.foreground,
    // Secondary variants
    '--preview-secondary': variants.secondary.base.hex,
    '--preview-secondary-hover': variants.secondary.hover.hex,
    '--preview-secondary-active': variants.secondary.active.hex,
    '--preview-secondary-foreground': variants.secondary.foreground,
    // Accent variants
    '--preview-accent': variants.accent.base.hex,
    '--preview-accent-hover': variants.accent.hover.hex,
    '--preview-accent-active': variants.accent.active.hex,
    '--preview-accent-foreground': variants.accent.foreground,
    // Success variants
    '--preview-success': variants.success.base.hex,
    '--preview-success-hover': variants.success.hover.hex,
    '--preview-success-active': variants.success.active.hex,
    '--preview-success-foreground': variants.success.foreground,
    // Warning variants
    '--preview-warning': variants.warning.base.hex,
    '--preview-warning-hover': variants.warning.hover.hex,
    '--preview-warning-active': variants.warning.active.hex,
    '--preview-warning-foreground': variants.warning.foreground,
    // Error variants
    '--preview-error': variants.error.base.hex,
    '--preview-error-hover': variants.error.hover.hex,
    '--preview-error-active': variants.error.active.hex,
    '--preview-error-foreground': variants.error.foreground,
    // Info variants
    '--preview-info': variants.info.base.hex,
    '--preview-info-hover': variants.info.hover.hex,
    '--preview-info-active': variants.info.active.hex,
    '--preview-info-foreground': variants.info.foreground,
    // Neutral variants (for backgrounds, borders, text)
    '--preview-neutral': variants.neutral.base.hex,
    '--preview-neutral-light': variants.neutral.hover.hex,
    '--preview-neutral-dark': variants.neutral.active.hex,
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
      {maxColours > 1 && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Base Shade</label>
            <span className="text-xs text-muted-foreground">
              {baseShadeIndex !== null ? `Shade ${baseShadeIndex + 1}` : 'Auto (middle)'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Select which shade to use as the base colour. Hover and active states use progressively darker shades.
          </p>
          <div className="flex gap-1 flex-wrap">
            {/* Auto option */}
            <button
              onClick={() => setBaseShadeIndex(null)}
              className={`
                px-3 py-1.5 text-xs rounded-md border transition-all
                ${baseShadeIndex === null
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground'
                }
              `}
            >
              Auto
            </button>
            {/* Shade swatches - use primary colours as reference */}
            {primaryColours.length > 0 ? (
              primaryColours.map((colour, index) => {
                const isSelected = baseShadeIndex === index
                const isBase = baseShadeIndex === null
                  ? index === Math.floor(primaryColours.length / 2)
                  : isSelected
                return (
                  <button
                    key={index}
                    onClick={() => setBaseShadeIndex(index)}
                    className={`
                      relative w-8 h-8 rounded-md border-2 transition-all
                      ${isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : isBase && baseShadeIndex === null
                          ? 'border-primary/50'
                          : 'border-transparent hover:border-muted-foreground'
                      }
                    `}
                    style={{ backgroundColor: colour.hex }}
                    title={`Shade ${index + 1}: ${colour.hex}`}
                  >
                    {isSelected && (
                      <Check
                        className="absolute inset-0 m-auto h-4 w-4"
                        style={{ color: getOptimalTextColour(colour.hex) }}
                      />
                    )}
                  </button>
                )
              })
            ) : (
              <span className="text-xs text-muted-foreground">Add colours to Primary to select base shade</span>
            )}
          </div>
        </div>
      )}

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
      <div className="p-4 rounded-lg border border-border bg-card space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Active Colours</h3>
          <p className="text-xs text-muted-foreground">
            Colours applied to buttons and interactive elements in the preview above
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoryData.map(({ name, key }) => {
            const v = variants[key]
            return (
              <div key={name}>
                <p className="text-xs font-medium mb-2">{name}</p>
                <div className="space-y-1.5">
                  {/* Base */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-border flex-shrink-0"
                      style={{ backgroundColor: v.base.hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Base</p>
                      {v.base.name && v.base.name !== v.base.hex.toUpperCase() ? (
                        <>
                          <p className="text-[11px] font-medium truncate" title={v.base.name}>
                            {v.base.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground truncate" title={v.base.hex}>
                            {v.base.hex.toUpperCase()}
                          </p>
                        </>
                      ) : (
                        <p className="text-[10px] font-mono truncate" title={v.base.hex}>
                          {v.base.hex.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Hover */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-border flex-shrink-0"
                      style={{ backgroundColor: v.hover.hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Hover</p>
                      {v.hover.name && v.hover.name !== v.hover.hex.toUpperCase() ? (
                        <>
                          <p className="text-[11px] font-medium truncate" title={v.hover.name}>
                            {v.hover.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground truncate" title={v.hover.hex}>
                            {v.hover.hex.toUpperCase()}
                          </p>
                        </>
                      ) : (
                        <p className="text-[10px] font-mono truncate" title={v.hover.hex}>
                          {v.hover.hex.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Active */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-md border border-border flex-shrink-0"
                      style={{ backgroundColor: v.active.hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Active</p>
                      {v.active.name && v.active.name !== v.active.hex.toUpperCase() ? (
                        <>
                          <p className="text-[11px] font-medium truncate" title={v.active.name}>
                            {v.active.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground truncate" title={v.active.hex}>
                            {v.active.hex.toUpperCase()}
                          </p>
                        </>
                      ) : (
                        <p className="text-[10px] font-mono truncate" title={v.active.hex}>
                          {v.active.hex.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
