import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Eye, Info, Check, X, Type, Square } from 'lucide-react'
import { Button } from '../ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import {
  simulateColourblindness,
  simulateColourblindnessBatch,
  colourblindTypes,
  commonColourblindTypes,
  getColourblindTypeName,
  getColourblindTypeDescription,
  checkCategoryAccessibility,
} from '../../utils/colour/colourblind'
import {
  getContrastRatioFromHex,
  getWCAGLevel,
} from '../../utils/colour/contrast'
import { ColourblindType, ColourRole } from '../../types/colour'
import { categoryLabels } from '../../data/presets'

export function ColourblindSimulator() {
  const { colourblindType, setColourblindType } = useUIStore()
  const { palettes, activePaletteId } = usePaletteStore()
  const [showAll, setShowAll] = useState(false)

  const activePalette = palettes.find((p) => p.id === activePaletteId)
  const colours = activePalette?.categories.flatMap((cat) => cat.colours) || []
  const hexValues = colours.map((c) => c.hex)
  const categoriesWithColours = activePalette?.categories.filter((cat) => cat.colours.length >= 2) || []

  // Get text and background colours based on role assignments
  const textColours = colours.filter((c) => c.role === 'text' || c.role === 'both')
  const backgroundColours = colours.filter((c) => c.role === 'background' || c.role === 'both')
  const hasRolesAssigned = textColours.length > 0 && backgroundColours.length > 0

  const displayTypes = showAll ? colourblindTypes : commonColourblindTypes

  // Calculate warning counts for each CVD type
  const warningsByType = useMemo(() => {
    const warnings: Record<ColourblindType, number> = {} as Record<ColourblindType, number>

    for (const type of colourblindTypes) {
      let warningCount = 0

      // Check text/background contrast issues
      if (hasRolesAssigned) {
        for (const text of textColours) {
          for (const bg of backgroundColours) {
            if (text.id === bg.id) continue

            const originalRatio = getContrastRatioFromHex(text.hex, bg.hex)
            const originalLevel = getWCAGLevel(originalRatio)
            const passesOriginal = originalLevel === 'AA' || originalLevel === 'AAA'

            const simulatedTextHex = simulateColourblindness(text.hex, type)
            const simulatedBgHex = simulateColourblindness(bg.hex, type)
            const simulatedRatio = getContrastRatioFromHex(simulatedTextHex, simulatedBgHex)
            const simulatedLevel = getWCAGLevel(simulatedRatio)
            const passesSimulated = simulatedLevel === 'AA' || simulatedLevel === 'AAA'

            const degraded = originalRatio - simulatedRatio > 1
            const failsUnderSimulation = passesOriginal && !passesSimulated

            if (failsUnderSimulation || degraded) {
              warningCount++
            }
          }
        }
      }

      // Check category accessibility issues
      if (categoriesWithColours.length > 0) {
        const categoryData = categoriesWithColours.map((cat) => ({
          category: cat.category,
          colours: cat.colours.map((c) => ({ hex: c.hex, name: c.name })),
        }))
        const accessibility = checkCategoryAccessibility(categoryData)
        if (accessibility && accessibility.byType[type] && !accessibility.byType[type].accessible) {
          warningCount += accessibility.byType[type].problematicPairs.length
        }
      }

      warnings[type] = warningCount
    }

    return warnings
  }, [textColours, backgroundColours, hasRolesAssigned, categoriesWithColours])

  if (colours.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Add colours to your palette to simulate colour blindness</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Colour Vision Deficiency Type
          </label>
          {(() => {
            // Calculate warnings in non-common types (only visible in "Show All")
            const hiddenTypesWithWarnings = !showAll
              ? colourblindTypes
                  .filter((type) => !commonColourblindTypes.includes(type))
                  .reduce((sum, type) => sum + (warningsByType[type] || 0), 0)
              : 0

            return (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className={hiddenTypesWithWarnings > 0 ? 'text-amber-600 dark:text-amber-400' : ''}
              >
                {showAll ? 'Show Common' : 'Show All'}
                {hiddenTypesWithWarnings > 0 && (
                  <span className="ml-1.5 flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {hiddenTypesWithWarnings}
                  </span>
                )}
              </Button>
            )
          })()}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {displayTypes.map((type) => {
            const warningCount = warningsByType[type] || 0
            return (
              <button
                key={type}
                onClick={() => setColourblindType(type)}
                className={`
                  p-3 rounded-lg border text-left transition-all relative
                  ${colourblindType === type
                    ? 'border-primary bg-primary/5'
                    : warningCount > 0
                      ? 'border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600'
                      : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="text-sm font-medium">
                      {getColourblindTypeName(type).split(' ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {getColourblindTypeName(type).split('(')[1]?.replace(')', '')}
                    </div>
                  </div>
                  {warningCount > 0 && (
                    <span className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      {warningCount}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {getColourblindTypeDescription(colourblindType)}
        </p>
      </div>

      {/* Comparison view */}
      <Tabs defaultValue="side-by-side">
        <TabsList>
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="all-types">All Types</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side">
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div>
              <h4 className="text-sm font-medium mb-3">Original</h4>
              <PalettePreview colours={hexValues} />
            </div>

            {/* Simulated */}
            <div>
              <h4 className="text-sm font-medium mb-3">
                {getColourblindTypeName(colourblindType)}
              </h4>
              <PalettePreview
                colours={simulateColourblindnessBatch(hexValues, colourblindType)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all-types">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Original</h4>
              <PalettePreview colours={hexValues} compact />
            </div>

            {commonColourblindTypes.map((type) => (
              <div key={type}>
                <h4 className="text-sm font-medium mb-2">
                  {getColourblindTypeName(type).split(' ')[0]}
                </h4>
                <PalettePreview
                  colours={simulateColourblindnessBatch(hexValues, type)}
                  compact
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Individual colour comparison */}
      <div>
        <h4 className="text-sm font-medium mb-3">Individual Colours</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {colours.map((colour) => {
            const simulated = simulateColourblindness(colour.hex, colourblindType)

            return (
              <div
                key={colour.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="flex h-16">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: colour.hex }}
                  />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: simulated }}
                  />
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-medium truncate">{colour.name}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {colour.hex}
                    </span>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <span className="text-[10px] text-muted-foreground">
                      {simulated}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Text/Background Contrast Under Simulation */}
      <TextBackgroundContrastSection
        textColours={textColours}
        backgroundColours={backgroundColours}
        hasRolesAssigned={hasRolesAssigned}
        colourblindType={colourblindType}
      />

      {/* Accessibility warnings */}
      <AccessibilityWarnings categories={categoriesWithColours} />
    </div>
  )
}

interface PalettePreviewProps {
  colours: string[]
  compact?: boolean
}

function PalettePreview({ colours, compact = false }: PalettePreviewProps) {
  return (
    <div className={`flex rounded-lg overflow-hidden border border-border ${compact ? 'h-12' : 'h-20'}`}>
      {colours.map((hex, index) => (
        <div
          key={index}
          className="flex-1"
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  )
}

interface TextBackgroundContrastSectionProps {
  textColours: { id: string; hex: string; name: string; role?: ColourRole }[]
  backgroundColours: { id: string; hex: string; name: string; role?: ColourRole }[]
  hasRolesAssigned: boolean
  colourblindType: ColourblindType
}

function TextBackgroundContrastSection({
  textColours,
  backgroundColours,
  hasRolesAssigned,
  colourblindType,
}: TextBackgroundContrastSectionProps) {
  // Calculate contrast for all text/background pairs under simulation
  const contrastAnalysis = useMemo(() => {
    if (!hasRolesAssigned) return null

    const pairs: {
      text: typeof textColours[0]
      background: typeof backgroundColours[0]
      originalRatio: number
      originalLevel: string
      simulatedTextHex: string
      simulatedBgHex: string
      simulatedRatio: number
      simulatedLevel: string
      degraded: boolean
      failsUnderSimulation: boolean
    }[] = []

    for (const text of textColours) {
      for (const bg of backgroundColours) {
        if (text.id === bg.id) continue

        const originalRatio = getContrastRatioFromHex(text.hex, bg.hex)
        const originalLevel = getWCAGLevel(originalRatio)

        const simulatedTextHex = simulateColourblindness(text.hex, colourblindType)
        const simulatedBgHex = simulateColourblindness(bg.hex, colourblindType)
        const simulatedRatio = getContrastRatioFromHex(simulatedTextHex, simulatedBgHex)
        const simulatedLevel = getWCAGLevel(simulatedRatio)

        // Check if contrast degrades significantly (drops by more than 1 ratio point)
        // or if it fails WCAG AA under simulation when it passed originally
        const passesOriginal = originalLevel === 'AA' || originalLevel === 'AAA'
        const passesSimulated = simulatedLevel === 'AA' || simulatedLevel === 'AAA'
        const degraded = originalRatio - simulatedRatio > 1
        const failsUnderSimulation = passesOriginal && !passesSimulated

        pairs.push({
          text,
          background: bg,
          originalRatio,
          originalLevel,
          simulatedTextHex,
          simulatedBgHex,
          simulatedRatio,
          simulatedLevel,
          degraded,
          failsUnderSimulation,
        })
      }
    }

    const problemPairs = pairs.filter((p) => p.failsUnderSimulation || p.degraded)
    const passingPairs = pairs.filter((p) => !p.failsUnderSimulation && !p.degraded)

    return { pairs, problemPairs, passingPairs }
  }, [textColours, backgroundColours, hasRolesAssigned, colourblindType])

  if (!hasRolesAssigned) {
    return (
      <div className="p-4 bg-muted/50 border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Type className="h-4 w-4" />
            <span>/</span>
            <Square className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Text/Background Contrast Check</p>
            <p className="text-sm text-muted-foreground mt-1">
              Assign text and background roles in the{' '}
              <span className="font-medium">Contrast Matrix</span> tab to see how your
              text/background pairs perform under colour vision simulation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!contrastAnalysis || contrastAnalysis.pairs.length === 0) {
    return null
  }

  const { problemPairs, passingPairs } = contrastAnalysis
  const typeName = getColourblindTypeName(colourblindType).split(' ')[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4 text-blue-500" />
          <span>/</span>
          <Square className="h-4 w-4 text-orange-500" />
          Text/Background Contrast
        </h4>
        <span className="text-xs text-muted-foreground">
          Under {typeName} simulation
        </span>
      </div>

      {/* Problem pairs */}
      {problemPairs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {problemPairs.length} pair{problemPairs.length > 1 ? 's' : ''} with reduced contrast
          </p>
          <div className="space-y-2">
            {problemPairs.map((pair) => (
              <motion.div
                key={`${pair.text.id}-${pair.background.id}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  pair.failsUnderSimulation
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Original preview */}
                  <div className="text-center">
                    <div
                      className="w-16 h-10 rounded flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: pair.background.hex, color: pair.text.hex }}
                    >
                      Aa
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">Original</div>
                    <div className={`text-xs font-medium ${
                      pair.originalLevel === 'AAA' || pair.originalLevel === 'AA'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {pair.originalRatio.toFixed(1)}:1
                    </div>
                  </div>

                  <span className="text-muted-foreground">→</span>

                  {/* Simulated preview */}
                  <div className="text-center">
                    <div
                      className="w-16 h-10 rounded flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: pair.simulatedBgHex, color: pair.simulatedTextHex }}
                    >
                      Aa
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">{typeName}</div>
                    <div className={`text-xs font-medium ${
                      pair.simulatedLevel === 'AAA' || pair.simulatedLevel === 'AA'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {pair.simulatedRatio.toFixed(1)}:1
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium">{pair.text.name}</span>
                      <span className="text-muted-foreground"> on </span>
                      <span className="font-medium">{pair.background.name}</span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      pair.failsUnderSimulation
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {pair.failsUnderSimulation ? (
                        <>
                          <X className="h-3 w-3 inline mr-1" />
                          Fails WCAG AA under {typeName}
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Contrast drops by {(pair.originalRatio - pair.simulatedRatio).toFixed(1)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Passing pairs summary */}
      {passingPairs.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          problemPairs.length === 0
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
            : 'border-border bg-muted/30'
        }`}>
          <div className="flex items-center gap-2">
            <Check className={`h-4 w-4 ${
              problemPairs.length === 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            }`} />
            <span className={`text-sm ${
              problemPairs.length === 0
                ? 'text-green-700 dark:text-green-300 font-medium'
                : 'text-muted-foreground'
            }`}>
              {passingPairs.length} pair{passingPairs.length > 1 ? 's' : ''} maintain good contrast under {typeName}
            </span>
          </div>
          {problemPairs.length === 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-6">
              All text/background combinations remain accessible
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface AccessibilityWarningsProps {
  categories: { category: string; colours: { id: string; hex: string; name: string }[] }[]
}

function AccessibilityWarnings({ categories }: AccessibilityWarningsProps) {
  const accessibility = useMemo(() => {
    if (categories.length === 0) return null
    return checkCategoryAccessibility(
      categories.map((cat) => ({
        category: cat.category,
        colours: cat.colours.map((c) => ({ hex: c.hex, name: c.name })),
      }))
    )
  }, [categories])

  if (!accessibility || categories.length === 0) {
    return (
      <div className="p-4 bg-muted/50 border border-border rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-5 w-5" />
          <span>
            Add at least 2 colours to a category to check colourblind compatibility within that group.
          </span>
        </div>
      </div>
    )
  }

  const hasIssues = Object.values(accessibility.byType).some(
    (result) => !result.accessible
  )

  if (!hasIssues) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Eye className="h-5 w-5" />
          <span className="font-medium">
            All colours within each category are distinguishable for common colour vision deficiencies
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-500">
        <AlertTriangle className="h-4 w-4" />
        Potential Issues Within Categories
      </h4>
      <p className="text-sm text-muted-foreground">
        Colours in the same category may appear together (e.g., status indicators). These pairs may be hard to distinguish:
      </p>

      {Object.entries(accessibility.byCategory).map(([category, typeResults]) => {
        const hasIssuesInCategory = Object.values(typeResults).some((r) => !r.accessible)
        if (!hasIssuesInCategory) return null

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
              {categoryLabels[category] || category}
            </p>

            {Object.entries(typeResults).map(([type, result]) => {
              if (result.accessible) return null

              return (
                <div key={type} className="mt-2">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {getColourblindTypeName(type as ColourblindType).split(' ')[0]}: {result.problematicPairs.length} pair(s)
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.problematicPairs.slice(0, 3).map(([hex1, hex2], index) => (
                      <div key={index} className="flex rounded overflow-hidden border border-amber-300">
                        <div
                          className="w-6 h-6"
                          style={{ backgroundColor: hex1 }}
                        />
                        <div
                          className="w-6 h-6"
                          style={{ backgroundColor: hex2 }}
                        />
                      </div>
                    ))}
                    {result.problematicPairs.length > 3 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 self-center">
                        +{result.problematicPairs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )
      })}
    </div>
  )
}
