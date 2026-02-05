import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Eye, Info, Check, X, Type, Square, Lightbulb, ChevronDown, ChevronUp, Lock, CheckCircle, RotateCcw } from 'lucide-react'
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
  suggestContrastFix,
  suggestDistinguishableFix,
  areColoursDistinguishable,
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

  const reviewedWarnings = activePalette?.reviewedWarnings || []

  // Calculate warning counts for each CVD type (total and unreviewed)
  const warningsByType = useMemo(() => {
    const warnings: Record<ColourblindType, { total: number; unreviewed: number }> = {} as Record<ColourblindType, { total: number; unreviewed: number }>

    for (const type of colourblindTypes) {
      let totalCount = 0
      let unreviewedCount = 0

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
              totalCount++
              const warningKey = `contrast:${text.id}:${bg.id}:${type}`
              if (!reviewedWarnings.includes(warningKey)) {
                unreviewedCount++
              }
            }
          }
        }
      }

      // Check category accessibility issues
      if (categoriesWithColours.length > 0) {
        const categoryData = categoriesWithColours.map((cat) => ({
          category: cat.category,
          colours: cat.colours.map((c) => ({ hex: c.hex, name: c.name, id: c.id })),
        }))
        const accessibility = checkCategoryAccessibility(categoryData)
        if (accessibility && accessibility.byType[type] && !accessibility.byType[type].accessible) {
          for (const pair of accessibility.byType[type].problematicPairs) {
            totalCount++
            // Find colour IDs for this pair
            const allColours = categoriesWithColours.flatMap((cat) => cat.colours)
            const c1 = allColours.find((c) => c.hex === pair.hex1)
            const c2 = allColours.find((c) => c.hex === pair.hex2)
            if (c1 && c2) {
              const warningKey = `distinguish:${c1.id}:${c2.id}:${type}`
              if (!reviewedWarnings.includes(warningKey)) {
                unreviewedCount++
              }
            } else {
              unreviewedCount++ // Can't check, assume unreviewed
            }
          }
        }
      }

      warnings[type] = { total: totalCount, unreviewed: unreviewedCount }
    }

    return warnings
  }, [textColours, backgroundColours, hasRolesAssigned, categoriesWithColours, reviewedWarnings])

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
            const hiddenTypesUnreviewed = !showAll
              ? colourblindTypes
                  .filter((type) => !commonColourblindTypes.includes(type))
                  .reduce((sum, type) => sum + (warningsByType[type]?.unreviewed || 0), 0)
              : 0

            return (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className={hiddenTypesUnreviewed > 0 ? 'text-amber-600 dark:text-amber-400' : ''}
              >
                {showAll ? 'Show Common' : 'Show All'}
                {hiddenTypesUnreviewed > 0 && (
                  <span className="ml-1.5 flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {hiddenTypesUnreviewed}
                  </span>
                )}
              </Button>
            )
          })()}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {displayTypes.map((type) => {
            const counts = warningsByType[type] || { total: 0, unreviewed: 0 }
            const hasUnreviewed = counts.unreviewed > 0
            const allReviewed = counts.total > 0 && counts.unreviewed === 0
            return (
              <button
                key={type}
                onClick={() => setColourblindType(type)}
                className={`
                  p-3 rounded-lg border text-left transition-all relative
                  ${colourblindType === type
                    ? 'border-primary bg-primary/5'
                    : hasUnreviewed
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
                  {hasUnreviewed && (
                    <span className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      {counts.unreviewed}
                    </span>
                  )}
                  {allReviewed && (
                    <span className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      {counts.total}
                      <CheckCircle className="h-3 w-3" />
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
                className="bg-card border border-border rounded-lg overflow-hidden relative"
              >
                {colour.locked && (
                  <div className="absolute top-1 right-1 z-10 bg-background/80 rounded p-0.5" title="Locked">
                    <Lock className="h-3 w-3 text-amber-500" />
                  </div>
                )}
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
        paletteId={activePaletteId || ''}
      />

      {/* Accessibility warnings */}
      <AccessibilityWarnings
        categories={categoriesWithColours}
        paletteId={activePaletteId || ''}
        colourblindType={colourblindType}
      />
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
  textColours: { id: string; hex: string; name: string; role?: ColourRole; locked?: boolean }[]
  backgroundColours: { id: string; hex: string; name: string; role?: ColourRole; locked?: boolean }[]
  hasRolesAssigned: boolean
  colourblindType: ColourblindType
  paletteId: string
}

function TextBackgroundContrastSection({
  textColours,
  backgroundColours,
  hasRolesAssigned,
  colourblindType,
  paletteId,
}: TextBackgroundContrastSectionProps) {
  const { updateColour, markWarningReviewed, unmarkWarningReviewed } = usePaletteStore()
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showReviewed, setShowReviewed] = useState(false)

  const getWarningKey = (textId: string, bgId: string) =>
    `contrast:${textId}:${bgId}:${colourblindType}`

  const toggleSuggestion = (pairKey: string) => {
    setExpandedSuggestions((prev) => {
      const next = new Set(prev)
      if (next.has(pairKey)) {
        next.delete(pairKey)
      } else {
        next.add(pairKey)
      }
      return next
    })
  }

  const applySuggestion = (colourId: string, newHex: string) => {
    updateColour(paletteId, colourId, { hex: newHex })
  }

  // Get all palette colours for suggesting alternatives
  const { palettes, activePaletteId: storeActivePaletteId } = usePaletteStore()
  const activePalette = palettes.find((p) => p.id === (paletteId || storeActivePaletteId))
  const allPaletteColours = activePalette?.categories.flatMap((cat) => cat.colours) || []

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
      suggestedFix: { hex: string; adjustedLightness: number } | null
      paletteAlternatives: { id: string; hex: string; name: string; ratio: number }[]
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

        // Find palette colours that would work as alternatives
        let paletteAlternatives: { id: string; hex: string; name: string; ratio: number }[] = []
        let suggestedFix = null

        if (failsUnderSimulation || degraded) {
          // Check existing palette colours
          paletteAlternatives = allPaletteColours
            .filter((c) => c.id !== text.id && c.id !== bg.id)
            .map((c) => {
              const simText = simulateColourblindness(c.hex, colourblindType)
              const simBg = simulateColourblindness(bg.hex, colourblindType)
              const ratio = getContrastRatioFromHex(simText, simBg)
              return { id: c.id, hex: c.hex, name: c.name, ratio }
            })
            .filter((c) => c.ratio >= 4.5)
            .sort((a, b) => b.ratio - a.ratio)
            .slice(0, 4)

          // Also generate a suggested fix
          suggestedFix = suggestContrastFix(text.hex, bg.hex, colourblindType)
        }

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
          suggestedFix,
          paletteAlternatives,
        })
      }
    }

    const problemPairs = pairs.filter((p) => p.failsUnderSimulation || p.degraded)
    const passingPairs = pairs.filter((p) => !p.failsUnderSimulation && !p.degraded)

    return { pairs, problemPairs, passingPairs }
  }, [textColours, backgroundColours, hasRolesAssigned, colourblindType, allPaletteColours])

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

  const { problemPairs: allProblemPairs, passingPairs } = contrastAnalysis
  const reviewedWarnings = activePalette?.reviewedWarnings || []

  // Separate reviewed and unreviewed problem pairs
  const problemPairs = allProblemPairs.filter(
    (p) => !reviewedWarnings.includes(getWarningKey(p.text.id, p.background.id))
  )
  const reviewedPairs = allProblemPairs.filter(
    (p) => reviewedWarnings.includes(getWarningKey(p.text.id, p.background.id))
  )

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
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between text-sm text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {problemPairs.length} pair{problemPairs.length > 1 ? 's' : ''} with reduced contrast
            </span>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {problemPairs.map((pair) => {
                  const pairKey = `${pair.text.id}-${pair.background.id}`
                  const isExpanded = expandedSuggestions.has(pairKey)

                  return (
                    <motion.div
                      key={pairKey}
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

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {(pair.suggestedFix || pair.paletteAlternatives.length > 0) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSuggestion(pairKey)}
                            >
                              <Lightbulb className="h-4 w-4 mr-1" />
                              {isExpanded ? 'Hide' : 'Suggest fix'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markWarningReviewed(paletteId, getWarningKey(pair.text.id, pair.background.id))}
                            title="Mark as reviewed"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Reviewed
                          </Button>
                        </div>
                      </div>

                      {/* Expanded suggestion */}
                      <AnimatePresence>
                        {isExpanded && (pair.suggestedFix || pair.paletteAlternatives.length > 0) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-4">
                              {/* Palette alternatives (quick picks) */}
                              {pair.paletteAlternatives.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Use existing palette colour instead of <span className="font-medium">{pair.text.name}</span>:
                                    {pair.text.locked && (
                                      <span className="inline-flex items-center gap-1 ml-2 text-amber-600 dark:text-amber-400">
                                        <Lock className="h-3 w-3" />
                                        <span>Locked</span>
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {pair.paletteAlternatives.map((alt) => (
                                      <button
                                        key={alt.id}
                                        onClick={() => {
                                          if (!pair.text.locked) {
                                            applySuggestion(pair.text.id, alt.hex)
                                            toggleSuggestion(pairKey)
                                          }
                                        }}
                                        disabled={pair.text.locked}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-card transition-colors ${
                                          pair.text.locked
                                            ? 'border-border opacity-50 cursor-not-allowed'
                                            : 'border-border hover:border-primary'
                                        }`}
                                      >
                                        <div
                                          className="w-6 h-6 rounded"
                                          style={{ backgroundColor: alt.hex }}
                                        />
                                        <div className="text-left">
                                          <div className="text-xs font-medium">{alt.name}</div>
                                          <div className="text-[10px] text-green-600 dark:text-green-400">
                                            {alt.ratio.toFixed(1)}:1
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Generated suggestion */}
                              {pair.suggestedFix && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {pair.paletteAlternatives.length > 0 ? 'Or adjust ' : 'Adjust '}
                                    <span className="font-medium">{pair.text.name}</span> lightness:
                                    {pair.text.locked && (
                                      <span className="inline-flex items-center gap-1 ml-2 text-amber-600 dark:text-amber-400">
                                        <Lock className="h-3 w-3" />
                                        <span>Locked</span>
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    {/* Current colour */}
                                    <div className="text-center">
                                      <div
                                        className="w-10 h-10 rounded-lg border border-border"
                                        style={{ backgroundColor: pair.text.hex }}
                                      />
                                      <div className="text-[10px] text-muted-foreground mt-1">Current</div>
                                    </div>

                                    <span className="text-muted-foreground">→</span>

                                    {/* Suggested colour */}
                                    <div className="text-center">
                                      <div
                                        className="w-10 h-10 rounded-lg border-2 border-primary"
                                        style={{ backgroundColor: pair.suggestedFix.hex }}
                                      />
                                      <div className="text-[10px] text-muted-foreground mt-1">{pair.suggestedFix.hex}</div>
                                    </div>

                                    <span className="text-muted-foreground">=</span>

                                    {/* Preview with suggested colour */}
                                    <div className="text-center">
                                      <div
                                        className="w-14 h-9 rounded flex items-center justify-center text-sm font-bold"
                                        style={{ backgroundColor: pair.background.hex, color: pair.suggestedFix.hex }}
                                      >
                                        Aa
                                      </div>
                                      {(() => {
                                        const newSimText = simulateColourblindness(pair.suggestedFix.hex, colourblindType)
                                        const newSimBg = simulateColourblindness(pair.background.hex, colourblindType)
                                        const newRatio = getContrastRatioFromHex(newSimText, newSimBg)
                                        const newLevel = getWCAGLevel(newRatio)
                                        return (
                                          <div className={`text-[10px] font-medium mt-1 ${
                                            newLevel === 'AAA' || newLevel === 'AA'
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-red-600 dark:text-red-400'
                                          }`}>
                                            {newRatio.toFixed(1)}:1
                                          </div>
                                        )
                                      })()}
                                    </div>

                                    {/* Apply button */}
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (!pair.text.locked) {
                                          applySuggestion(pair.text.id, pair.suggestedFix!.hex)
                                          toggleSuggestion(pairKey)
                                        }
                                      }}
                                      disabled={pair.text.locked}
                                    >
                                      {pair.text.locked ? (
                                        <Lock className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Check className="h-3 w-3 mr-1" />
                                      )}
                                      {pair.text.locked ? 'Locked' : 'Apply'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reviewed pairs (collapsed) */}
      {reviewedPairs.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowReviewed(!showReviewed)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <CheckCircle className="h-4 w-4" />
            {reviewedPairs.length} reviewed
            {showReviewed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {showReviewed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {reviewedPairs.map((pair) => {
                  const pairKey = `${pair.text.id}-${pair.background.id}`

                  return (
                    <div
                      key={pairKey}
                      className="p-3 rounded-lg border border-border bg-muted/30 opacity-60"
                    >
                      <div className="flex items-center gap-4">
                        {/* Original preview */}
                        <div className="text-center">
                          <div
                            className="w-12 h-8 rounded flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: pair.background.hex, color: pair.text.hex }}
                          >
                            Aa
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">{pair.text.name}</span>
                            <span className="text-muted-foreground"> on </span>
                            <span className="font-medium">{pair.background.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pair.simulatedRatio.toFixed(1)}:1 under {typeName}
                          </div>
                        </div>

                        {/* Unreview button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unmarkWarningReviewed(paletteId, getWarningKey(pair.text.id, pair.background.id))}
                          title="Mark as unreviewed"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Unreview
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Passing pairs summary */}
      {passingPairs.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          problemPairs.length === 0 && reviewedPairs.length === 0
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
            : 'border-border bg-muted/50'
        }`}>
          <div className="flex items-center gap-2">
            <Check className={`h-4 w-4 ${
              problemPairs.length === 0 && reviewedPairs.length === 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            }`} />
            <span className={`text-sm ${
              problemPairs.length === 0 && reviewedPairs.length === 0
                ? 'text-green-700 dark:text-green-300 font-medium'
                : 'text-muted-foreground'
            }`}>
              {passingPairs.length} pair{passingPairs.length > 1 ? 's' : ''} maintain good contrast under {typeName}
            </span>
          </div>
          {problemPairs.length === 0 && reviewedPairs.length === 0 && (
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
  categories: { category: string; colours: { id: string; hex: string; name: string; locked?: boolean }[] }[]
  paletteId: string
  colourblindType: ColourblindType
}

function AccessibilityWarnings({ categories, paletteId, colourblindType }: AccessibilityWarningsProps) {
  const { updateColour, palettes, markWarningReviewed, unmarkWarningReviewed } = usePaletteStore()
  const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showReviewed, setShowReviewed] = useState(false)

  const activePalette = palettes.find((p) => p.id === paletteId)
  const allPaletteColours = activePalette?.categories.flatMap((cat) => cat.colours) || []
  const reviewedWarnings = activePalette?.reviewedWarnings || []

  const getWarningKey = (id1: string, id2: string) =>
    `distinguish:${id1}:${id2}:${colourblindType}`

  const togglePair = (pairKey: string) => {
    setExpandedPairs((prev) => {
      const next = new Set(prev)
      if (next.has(pairKey)) {
        next.delete(pairKey)
      } else {
        next.add(pairKey)
      }
      return next
    })
  }

  const applySuggestion = (colourId: string, newHex: string) => {
    updateColour(paletteId, colourId, { hex: newHex })
  }

  // Build detailed analysis with suggestions
  const analysis = useMemo(() => {
    if (categories.length === 0) return null

    const categoryIssues: {
      category: string
      categoryLabel: string
      pairs: {
        colour1: { id: string; hex: string; name: string; locked?: boolean }
        colour2: { id: string; hex: string; name: string; locked?: boolean }
        paletteAlternatives: { id: string; hex: string; name: string }[]
        suggestedFix: { hex: string; adjustedLightness: number } | null
      }[]
    }[] = []

    for (const cat of categories) {
      if (cat.colours.length < 2) continue

      const pairs: typeof categoryIssues[0]['pairs'] = []

      // Check pairs within this category for the selected CVD type
      for (let i = 0; i < cat.colours.length; i++) {
        for (let j = i + 1; j < cat.colours.length; j++) {
          const c1 = cat.colours[i]
          const c2 = cat.colours[j]

          if (!areColoursDistinguishable(c1.hex, c2.hex, colourblindType, 20)) {
            // Find palette alternatives that would be distinguishable from c2
            const paletteAlternatives = allPaletteColours
              .filter((c) => c.id !== c1.id && c.id !== c2.id)
              .filter((c) => areColoursDistinguishable(c.hex, c2.hex, colourblindType, 25))
              .slice(0, 4)

            // Generate a suggested fix
            const suggestedFix = suggestDistinguishableFix(c1.hex, c2.hex, colourblindType, 25)

            pairs.push({
              colour1: c1,
              colour2: c2,
              paletteAlternatives,
              suggestedFix,
            })
          }
        }
      }

      if (pairs.length > 0) {
        categoryIssues.push({
          category: cat.category,
          categoryLabel: categoryLabels[cat.category] || cat.category,
          pairs,
        })
      }
    }

    return categoryIssues
  }, [categories, colourblindType, allPaletteColours])

  if (!analysis || categories.length === 0) {
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

  // Separate reviewed and unreviewed pairs
  const analysisWithReviewed = analysis.map((catIssue) => {
    const unreviewedPairs = catIssue.pairs.filter(
      (p) => !reviewedWarnings.includes(getWarningKey(p.colour1.id, p.colour2.id))
    )
    const reviewedPairs = catIssue.pairs.filter(
      (p) => reviewedWarnings.includes(getWarningKey(p.colour1.id, p.colour2.id))
    )
    return { ...catIssue, unreviewedPairs, reviewedPairs }
  })

  const totalUnreviewed = analysisWithReviewed.reduce((sum, cat) => sum + cat.unreviewedPairs.length, 0)
  const totalReviewed = analysisWithReviewed.reduce((sum, cat) => sum + cat.reviewedPairs.length, 0)
  const allReviewedPairs = analysisWithReviewed.flatMap((cat) =>
    cat.reviewedPairs.map((p) => ({ ...p, categoryLabel: cat.categoryLabel }))
  )

  if (totalUnreviewed === 0 && totalReviewed === 0) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Eye className="h-5 w-5" />
          <span className="font-medium">
            All colours within each category are distinguishable under {getColourblindTypeName(colourblindType).split(' ')[0]}
          </span>
        </div>
      </div>
    )
  }

  const typeName = getColourblindTypeName(colourblindType).split(' ')[0]

  return (
    <div className="space-y-3">
      {totalUnreviewed > 0 && (
        <>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {totalUnreviewed} indistinguishable pair{totalUnreviewed > 1 ? 's' : ''} within categories
            </span>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <p className="text-sm text-muted-foreground">
                  These colour pairs may be hard to distinguish under {typeName} simulation:
                </p>

                {analysisWithReviewed.filter((cat) => cat.unreviewedPairs.length > 0).map((catIssue) => (
                  <div
                    key={catIssue.category}
                    className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3"
                  >
                    <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                      {catIssue.categoryLabel}
                    </p>

                {catIssue.unreviewedPairs.map((pair, pairIndex) => {
                  const pairKey = `${catIssue.category}-${pair.colour1.id}-${pair.colour2.id}`
                  const isExpanded = expandedPairs.has(pairKey)

                  return (
                    <div key={pairIndex} className="bg-card/50 rounded-lg p-2">
                      <div className="flex items-center gap-3">
                        {/* Colour pair preview */}
                        <div className="flex rounded overflow-hidden border border-amber-300 dark:border-amber-600">
                          <div
                            className="w-8 h-8"
                            style={{ backgroundColor: pair.colour1.hex }}
                            title={pair.colour1.name}
                          />
                          <div
                            className="w-8 h-8"
                            style={{ backgroundColor: pair.colour2.hex }}
                            title={pair.colour2.name}
                          />
                        </div>

                        {/* Names */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{pair.colour1.name}</span>
                            <span className="text-muted-foreground"> & </span>
                            <span className="font-medium">{pair.colour2.name}</span>
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Hard to distinguish under {typeName}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          {(pair.paletteAlternatives.length > 0 || pair.suggestedFix) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePair(pairKey)}
                            >
                              <Lightbulb className="h-4 w-4 mr-1" />
                              {isExpanded ? 'Hide' : 'Suggest fix'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markWarningReviewed(paletteId, getWarningKey(pair.colour1.id, pair.colour2.id))}
                            title="Mark as reviewed"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Reviewed
                          </Button>
                        </div>
                      </div>

                      {/* Expanded suggestions */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-4">
                              {/* Palette alternatives */}
                              {pair.paletteAlternatives.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Replace <span className="font-medium">{pair.colour1.name}</span> with an existing palette colour:
                                    {pair.colour1.locked && (
                                      <span className="inline-flex items-center gap-1 ml-2 text-amber-600 dark:text-amber-400">
                                        <Lock className="h-3 w-3" />
                                        <span>Locked</span>
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {pair.paletteAlternatives.map((alt) => (
                                      <button
                                        key={alt.id}
                                        onClick={() => {
                                          if (!pair.colour1.locked) {
                                            applySuggestion(pair.colour1.id, alt.hex)
                                            togglePair(pairKey)
                                          }
                                        }}
                                        disabled={pair.colour1.locked}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-card transition-colors ${
                                          pair.colour1.locked
                                            ? 'border-border opacity-50 cursor-not-allowed'
                                            : 'border-border hover:border-primary'
                                        }`}
                                      >
                                        <div
                                          className="w-6 h-6 rounded"
                                          style={{ backgroundColor: alt.hex }}
                                        />
                                        <span className="text-xs font-medium">{alt.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Generated suggestion */}
                              {pair.suggestedFix && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {pair.paletteAlternatives.length > 0 ? 'Or adjust ' : 'Adjust '}
                                    <span className="font-medium">{pair.colour1.name}</span> lightness:
                                    {pair.colour1.locked && (
                                      <span className="inline-flex items-center gap-1 ml-2 text-amber-600 dark:text-amber-400">
                                        <Lock className="h-3 w-3" />
                                        <span>Locked</span>
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <div className="text-center">
                                      <div
                                        className="w-8 h-8 rounded border border-border"
                                        style={{ backgroundColor: pair.colour1.hex }}
                                      />
                                      <div className="text-[10px] text-muted-foreground mt-1">Current</div>
                                    </div>

                                    <span className="text-muted-foreground">→</span>

                                    <div className="text-center">
                                      <div
                                        className="w-8 h-8 rounded border-2 border-primary"
                                        style={{ backgroundColor: pair.suggestedFix.hex }}
                                      />
                                      <div className="text-[10px] text-muted-foreground mt-1">{pair.suggestedFix.hex}</div>
                                    </div>

                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (!pair.colour1.locked) {
                                          applySuggestion(pair.colour1.id, pair.suggestedFix!.hex)
                                          togglePair(pairKey)
                                        }
                                      }}
                                      disabled={pair.colour1.locked}
                                    >
                                      {pair.colour1.locked ? (
                                        <Lock className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Check className="h-3 w-3 mr-1" />
                                      )}
                                      {pair.colour1.locked ? 'Locked' : 'Apply'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      {/* Reviewed pairs (collapsed) */}
      {totalReviewed > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowReviewed(!showReviewed)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <CheckCircle className="h-4 w-4" />
            {totalReviewed} reviewed
            {showReviewed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {showReviewed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {allReviewedPairs.map((pair) => {
                  const pairKey = `reviewed-${pair.colour1.id}-${pair.colour2.id}`

                  return (
                    <div
                      key={pairKey}
                      className="p-3 rounded-lg border border-border bg-muted/30 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        {/* Colour pair preview */}
                        <div className="flex rounded overflow-hidden border border-border">
                          <div
                            className="w-6 h-6"
                            style={{ backgroundColor: pair.colour1.hex }}
                            title={pair.colour1.name}
                          />
                          <div
                            className="w-6 h-6"
                            style={{ backgroundColor: pair.colour2.hex }}
                            title={pair.colour2.name}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">{pair.colour1.name}</span>
                            <span className="text-muted-foreground"> & </span>
                            <span className="font-medium">{pair.colour2.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pair.categoryLabel}
                          </div>
                        </div>

                        {/* Unreview button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unmarkWarningReviewed(paletteId, getWarningKey(pair.colour1.id, pair.colour2.id))}
                          title="Mark as unreviewed"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Unreview
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* All clear message when only reviewed items exist */}
      {totalUnreviewed === 0 && totalReviewed > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Eye className="h-5 w-5" />
            <span className="font-medium">
              All distinguishability issues have been reviewed
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
