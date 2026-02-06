import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  Eye,
  Contrast,
  Layers,
  ArrowRight,
  Type,
  Square,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { useActivePalette } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import { useToast } from '../ui/Toast'
import { getContrastRatioFromHex, getWCAGLevel } from '../../utils/colour/contrast'
import {
  checkCategoryAccessibility,
  getColourblindTypeName,
  simulateColourblindness,
  colourblindTypes,
} from '../../utils/colour/colourblind'
import { downloadFile } from '../../utils/helpers'
import { Colour, ColourblindType } from '../../types/colour'
import { categoryLabels } from '../../data/presets'

export function AccessibilityReport() {
  const activePalette = useActivePalette()
  const { setAccessibilityTab } = useUIStore()
  const toast = useToast()
  const allColours = activePalette?.categories.flatMap((cat) => cat.colours) || []
  const categoriesWithColours = activePalette?.categories.filter((cat) => cat.colours.length >= 2) || []
  const reviewedWarnings = activePalette?.reviewedWarnings || []

  // Separate colours by role
  const textColours = allColours.filter((c) => c.role === 'text' || c.role === 'both')
  const backgroundColours = allColours.filter((c) => c.role === 'background' || c.role === 'both')
  const hasRolesAssigned = textColours.length > 0 && backgroundColours.length > 0

  // Helper to check if a warning is reviewed
  const isReviewed = (warningKey: string) => reviewedWarnings.includes(warningKey)

  const report = useMemo(() => {
    if (allColours.length < 2) return null

    // Role-based contrast analysis (only text vs background)
    let roleBasedPairs: {
      text: Colour
      background: Colour
      ratio: number
      level: string
    }[] = []

    if (hasRolesAssigned) {
      for (const text of textColours) {
        for (const bg of backgroundColours) {
          if (text.id === bg.id) continue
          const ratio = getContrastRatioFromHex(text.hex, bg.hex)
          const level = getWCAGLevel(ratio)
          roleBasedPairs.push({ text, background: bg, ratio, level })
        }
      }
    }

    const roleBasedTotal = roleBasedPairs.length
    const roleBasedFailing = roleBasedPairs.filter(
      (p) => p.level === 'Fail' || p.level === 'AA Large'
    )
    const roleBasedPassing = roleBasedPairs.filter(
      (p) => p.level === 'AA' || p.level === 'AAA'
    )

    // Category-based colourblind analysis
    // Only check colours within the same category (they're likely to appear together)
    const colourblindResults = checkCategoryAccessibility(
      categoriesWithColours.map((cat) => ({
        category: cat.category,
        colours: cat.colours.map((c) => ({ hex: c.hex, name: c.name })),
      }))
    )

    // Enhance colourblind results with reviewed status
    // We need to look up colour IDs by hex to check reviewed warnings
    const getColourIdByHex = (hex: string, category: string) => {
      const cat = categoriesWithColours.find(c => c.category === category)
      return cat?.colours.find(c => c.hex.toLowerCase() === hex.toLowerCase())?.id
    }

    const categoryIssuesWithReviewed: Record<ColourblindType, {
      pairs: { hex1: string; hex2: string; category: string; reviewed: boolean }[]
      unreviewedCount: number
      reviewedCount: number
    }> = {} as any

    for (const [type, result] of Object.entries(colourblindResults.byType)) {
      const pairsWithReviewed = result.problematicPairs.map(pair => {
        const id1 = getColourIdByHex(pair.hex1, pair.category)
        const id2 = getColourIdByHex(pair.hex2, pair.category)
        const warningKey = id1 && id2 ? `distinguish:${id1}:${id2}:${type}` : null
        const reviewed = warningKey ? isReviewed(warningKey) : false
        return { ...pair, reviewed }
      })
      categoryIssuesWithReviewed[type as ColourblindType] = {
        pairs: pairsWithReviewed,
        unreviewedCount: pairsWithReviewed.filter(p => !p.reviewed).length,
        reviewedCount: pairsWithReviewed.filter(p => p.reviewed).length,
      }
    }

    // Simulated contrast analysis - check text/background pairs under CVD simulation
    const simulatedContrastIssues: Record<ColourblindType, {
      pairs: {
        text: Colour
        background: Colour
        originalRatio: number
        simulatedRatio: number
        failsUnderSimulation: boolean
        degraded: boolean
        reviewed: boolean
      }[]
    }> = {} as Record<ColourblindType, { pairs: typeof simulatedContrastIssues[ColourblindType]['pairs'] }>

    if (hasRolesAssigned) {
      for (const type of colourblindTypes) {
        const problemPairs: typeof simulatedContrastIssues[ColourblindType]['pairs'] = []

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
              const warningKey = `contrast:${text.id}:${bg.id}:${type}`
              problemPairs.push({
                text,
                background: bg,
                originalRatio,
                simulatedRatio,
                failsUnderSimulation,
                degraded,
                reviewed: isReviewed(warningKey),
              })
            }
          }
        }

        simulatedContrastIssues[type] = { pairs: problemPairs }
      }
    }

    // Count total simulated contrast issues (unreviewed only for scoring)
    const totalSimulatedIssues = Object.values(simulatedContrastIssues).reduce(
      (sum, { pairs }) => sum + pairs.filter(p => !p.reviewed).length,
      0
    )
    const totalSimulatedReviewed = Object.values(simulatedContrastIssues).reduce(
      (sum, { pairs }) => sum + pairs.filter(p => p.reviewed).length,
      0
    )
    const typesWithSimulatedIssues = Object.entries(simulatedContrastIssues).filter(
      ([_, { pairs }]) => pairs.some(p => !p.reviewed)
    ).length

    // Count total category issues
    const totalCategoryIssues = Object.values(categoryIssuesWithReviewed).reduce(
      (sum, { unreviewedCount }) => sum + unreviewedCount,
      0
    )
    const totalCategoryReviewed = Object.values(categoryIssuesWithReviewed).reduce(
      (sum, { reviewedCount }) => sum + reviewedCount,
      0
    )

    // Calculate scores
    const contrastScore = hasRolesAssigned && roleBasedTotal > 0
      ? Math.round((roleBasedPassing.length / roleBasedTotal) * 100)
      : 0

    const colourblindTypeResults = colourblindResults.byType
    const totalTypes = Object.keys(colourblindTypeResults).length
    const passingTypes = Object.values(colourblindTypeResults).filter((r) => r.accessible).length

    // Include simulated contrast issues in colourblind score
    const categoryIssueTypes = totalTypes - passingTypes
    const simulatedIssueTypes = typesWithSimulatedIssues
    const totalIssueTypes = Math.max(categoryIssueTypes, simulatedIssueTypes) // Avoid double counting
    const colourblindScore = totalTypes > 0
      ? Math.round(((totalTypes - totalIssueTypes) / totalTypes) * 100)
      : (hasRolesAssigned && totalSimulatedIssues > 0 ? Math.round((1 - Math.min(totalSimulatedIssues / 10, 1)) * 100) : 100)

    // Overall score
    const overallScore = hasRolesAssigned
      ? Math.round(contrastScore * 0.6 + colourblindScore * 0.4)
      : Math.round(colourblindScore)

    return {
      hasRolesAssigned,
      textColourCount: textColours.length,
      backgroundColourCount: backgroundColours.length,
      roleBasedTotal,
      roleBasedPassing: roleBasedPassing.length,
      roleBasedFailing: roleBasedFailing.length,
      roleBasedFailures: roleBasedFailing,
      colourblindResults: colourblindTypeResults,
      colourblindByCategory: colourblindResults.byCategory,
      categoryIssuesWithReviewed,
      totalCategoryIssues,
      totalCategoryReviewed,
      simulatedContrastIssues,
      totalSimulatedIssues,
      totalSimulatedReviewed,
      contrastScore,
      colourblindScore,
      overallScore,
      categoriesChecked: categoriesWithColours.length,
    }
  }, [allColours, textColours, backgroundColours, hasRolesAssigned, categoriesWithColours, reviewedWarnings])

  const handleExportReport = () => {
    if (!report || !activePalette) return

    const lines = [
      `Accessibility Report for "${activePalette.name}"`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      '## Overall Score',
      `${report.overallScore}/100`,
      '',
      '## Colour Roles',
      `Text colours: ${report.textColourCount}`,
      `Background colours: ${report.backgroundColourCount}`,
      '',
      '## Contrast Analysis (Text vs Background)',
      report.hasRolesAssigned
        ? [
            `Total combinations: ${report.roleBasedTotal}`,
            `Passing WCAG AA (4.5:1): ${report.roleBasedPassing} (${report.contrastScore}%)`,
            `Failing WCAG AA: ${report.roleBasedFailing}`,
            '',
            '## Failing Combinations',
            ...report.roleBasedFailures.map(
              (pair) =>
                `- ${pair.text.name} (${pair.text.hex}) on ${pair.background.name} (${pair.background.hex}): ${pair.ratio.toFixed(2)}:1`
            ),
          ].join('\n')
        : 'No colour roles assigned. Assign text and background roles in the Contrast Matrix tab for accurate analysis.',
      '',
      '## Colour Vision Deficiency Analysis (Within Categories)',
      `Categories checked: ${report.categoriesChecked}`,
      ...Object.entries(report.colourblindResults).map(
        ([type, result]) =>
          `- ${getColourblindTypeName(type as ColourblindType)}: ${result.accessible ? 'Pass' : `Fail (${result.problematicPairs.length} issues)`}`
      ),
      '',
      '## Text/Background Contrast Under CVD Simulation',
      report.hasRolesAssigned
        ? [
            `Total issues: ${report.totalSimulatedIssues}`,
            '',
            ...Object.entries(report.simulatedContrastIssues)
              .filter(([_, { pairs }]) => pairs.length > 0)
              .flatMap(([type, { pairs }]) => [
                `### ${getColourblindTypeName(type as ColourblindType)}`,
                ...pairs.map(
                  (pair) =>
                    `- ${pair.text.name} on ${pair.background.name}: ${pair.originalRatio.toFixed(2)}:1 → ${pair.simulatedRatio.toFixed(2)}:1 (${pair.failsUnderSimulation ? 'Fails WCAG' : 'Degraded'})`
                ),
              ]),
          ].join('\n')
        : 'No colour roles assigned.',
      '',
      '## Palette Colours',
      ...allColours.map((c) => `- ${c.name}: ${c.hex}${c.role ? ` (${c.role})` : ''}`),
    ]

    downloadFile(
      lines.join('\n'),
      `${activePalette.name.toLowerCase().replace(/\s+/g, '-')}-accessibility-report.txt`,
      'text/plain'
    )

    toast.success('Report exported')
  }

  const handleGoToMatrix = () => {
    setAccessibilityTab('matrix')
  }

  if (!activePalette || allColours.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Info className="h-12 w-12 mx-auto mb-4 text-icon-muted" />
        <p>Add at least 2 colours to your palette to generate an accessibility report</p>
      </div>
    )
  }

  if (!report) return null

  const getScoreColour = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-500'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-500'
    return 'text-red-600 dark:text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Accessibility Report</h3>
          <p className="text-sm text-muted-foreground">
            {activePalette.name} · {allColours.length} colours
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Role assignment notice */}
      {!report.hasRolesAssigned && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
        >
          <Layers className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Assign colour roles for accurate contrast analysis
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              The report can only check meaningful contrast combinations when you specify which colours
              are used for <strong>text</strong> and which for <strong>backgrounds</strong>. Without roles,
              not all colour pairs would realistically be used together.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={handleGoToMatrix}
            >
              <ArrowRight className="h-3.5 w-3.5 mr-2" />
              Assign Roles in Contrast Matrix
            </Button>
          </div>
        </motion.div>
      )}

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg p-6 text-center"
      >
        <div className={`text-6xl font-bold mb-2 ${getScoreColour(report.overallScore)}`}>
          {report.overallScore}
        </div>
        <div className="text-lg text-muted-foreground mb-4">
          Overall Score
          {!report.hasRolesAssigned && (
            <span className="text-sm ml-2">(colourblind compatibility only)</span>
          )}
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${report.overallScore}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${getScoreBg(report.overallScore)}`}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {!report.hasRolesAssigned
            ? 'Assign colour roles to get a complete accessibility score including contrast analysis.'
            : report.overallScore >= 80
            ? 'Excellent accessibility! Your palette meets most accessibility requirements.'
            : report.overallScore >= 60
            ? 'Good accessibility with some areas for improvement.'
            : 'Accessibility needs attention. Review the issues below.'}
        </p>
      </motion.div>

      {/* Score breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contrast Score */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Contrast className="h-5 w-5 text-primary dark:text-violet-400" />
            <h4 className="font-medium">Contrast Score</h4>
          </div>

          {report.hasRolesAssigned ? (
            <>
              <div className={`text-3xl font-bold ${getScoreColour(report.contrastScore)}`}>
                {report.contrastScore}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {report.roleBasedPassing} of {report.roleBasedTotal} text/background pairs pass WCAG AA
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {report.textColourCount} text × {report.backgroundColourCount} background colours
              </p>

              {report.roleBasedFailing > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-red-600 dark:text-red-500 mb-2">
                    Failing pairs:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {report.roleBasedFailures.slice(0, 5).map((pair, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-16 h-6 rounded text-xs font-medium flex items-center justify-center"
                          style={{ backgroundColor: pair.background.hex, color: pair.text.hex }}
                        >
                          Aa
                        </div>
                        <span className="text-muted-foreground">
                          {pair.ratio.toFixed(2)}:1
                        </span>
                      </div>
                    ))}
                    {report.roleBasedFailing > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{report.roleBasedFailing - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">
              <p className="text-sm">No roles assigned</p>
              <p className="text-xs mt-2">
                Assign text and background roles in the Contrast Matrix to enable contrast scoring.
              </p>
            </div>
          )}
        </div>

        {/* Colourblind Score */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-5 w-5 text-primary dark:text-violet-400" />
            <h4 className="font-medium">Colourblind Compatibility</h4>
          </div>

          <div className={`text-3xl font-bold ${getScoreColour(report.colourblindScore)}`}>
            {report.colourblindScore}%
          </div>

          {report.categoriesChecked > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Distinguishable across{' '}
              {Object.values(report.colourblindResults).filter((r) => r.accessible).length} of{' '}
              {Object.keys(report.colourblindResults).length} CVD types (within categories)
            </p>
          )}

          {report.categoriesChecked > 0 && (report.totalCategoryIssues > 0 || report.totalCategoryReviewed > 0) && (
            <p className="text-sm mt-1">
              {report.totalCategoryIssues > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {report.totalCategoryIssues} category distinguishability issue{report.totalCategoryIssues !== 1 ? 's' : ''}
                </span>
              )}
              {report.totalCategoryIssues > 0 && report.totalCategoryReviewed > 0 && ' · '}
              {report.totalCategoryReviewed > 0 && (
                <span className="text-muted-foreground">
                  {report.totalCategoryReviewed} reviewed
                </span>
              )}
            </p>
          )}

          {report.hasRolesAssigned && (report.totalSimulatedIssues > 0 || report.totalSimulatedReviewed > 0) && (
            <p className="text-sm mt-1">
              {report.totalSimulatedIssues > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {report.totalSimulatedIssues} text/background contrast issue{report.totalSimulatedIssues !== 1 ? 's' : ''} under simulation
                </span>
              )}
              {report.totalSimulatedIssues > 0 && report.totalSimulatedReviewed > 0 && ' · '}
              {report.totalSimulatedReviewed > 0 && (
                <span className="text-muted-foreground">
                  {report.totalSimulatedReviewed} reviewed
                </span>
              )}
            </p>
          )}

          {report.categoriesChecked === 0 && !report.hasRolesAssigned && (
            <p className="text-sm text-muted-foreground mt-2">
              Assign colour roles or add 2+ colours to a category to check colourblind compatibility.
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {colourblindTypes.map((type) => {
              const categoryResult = report.categoryIssuesWithReviewed[type]
              const simulatedResult = report.simulatedContrastIssues[type]
              const categoryUnreviewed = categoryResult?.unreviewedCount || 0
              const categoryReviewed = categoryResult?.reviewedCount || 0
              const simulatedUnreviewed = simulatedResult?.pairs?.filter(p => !p.reviewed).length || 0
              const simulatedReviewed = simulatedResult?.pairs?.filter(p => p.reviewed).length || 0
              const unreviewedIssues = categoryUnreviewed + simulatedUnreviewed
              const totalReviewed = categoryReviewed + simulatedReviewed
              const hasUnreviewedIssues = unreviewedIssues > 0
              const hasReviewedOnly = !hasUnreviewedIssues && totalReviewed > 0

              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span>{getColourblindTypeName(type as ColourblindType).split(' ')[0]}</span>
                  {hasUnreviewedIssues ? (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-500">
                      <XCircle className="h-4 w-4" />
                      <span className="flex items-center gap-1.5">
                        {categoryUnreviewed > 0 && (
                          <span title="Category distinguishability issues">{categoryUnreviewed} cat</span>
                        )}
                        {categoryUnreviewed > 0 && simulatedUnreviewed > 0 && <span>·</span>}
                        {simulatedUnreviewed > 0 && (
                          <span title="Text/background contrast issues" className="flex items-center gap-0.5">
                            {simulatedUnreviewed}
                            <Type className="h-3 w-3" />
                            <Square className="h-3 w-3" />
                          </span>
                        )}
                        {totalReviewed > 0 && (
                          <span className="text-muted-foreground ml-1" title="Reviewed issues">
                            (+{totalReviewed})
                          </span>
                        )}
                      </span>
                    </span>
                  ) : hasReviewedOnly ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      {totalReviewed} reviewed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      Pass
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category breakdown for colourblind issues */}
      {report.categoriesChecked > 0 && Object.keys(report.colourblindByCategory).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            Colourblind Issues by Category
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Colours within the same category may appear together (e.g., status indicators, chart colours).
          </p>
          <div className="space-y-3">
            {Object.entries(report.colourblindByCategory).map(([category, typeResults]) => {
              const hasIssues = Object.values(typeResults).some((r) => !r.accessible)
              const issueCount = Object.values(typeResults).reduce(
                (sum, r) => sum + r.problematicPairs.length,
                0
              )

              return (
                <div
                  key={category}
                  className={`p-3 rounded-lg border ${
                    hasIssues
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                      : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {categoryLabels[category] || category}
                    </span>
                    {hasIssues ? (
                      <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {issueCount} issue{issueCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        All distinguishable
                      </span>
                    )}
                  </div>
                  {hasIssues && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {Object.entries(typeResults)
                        .filter(([_, r]) => !r.accessible)
                        .map(([type, r]) => (
                          <span key={type} className="mr-3">
                            {getColourblindTypeName(type as any).split(' ')[0]}: {r.problematicPairs.length}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Simulated contrast issues breakdown */}
      {report.hasRolesAssigned && (report.totalSimulatedIssues > 0 || report.totalSimulatedReviewed > 0) && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Type className="h-4 w-4" />
              <span>/</span>
              <Square className="h-4 w-4" />
            </div>
            Text/Background Contrast Under CVD Simulation
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            These text/background pairs pass normal contrast requirements but have issues under colour vision simulation.
          </p>
          <div className="space-y-3">
            {Object.entries(report.simulatedContrastIssues)
              .filter(([_, { pairs }]) => pairs.some(p => !p.reviewed))
              .map(([type, { pairs }]) => {
                const unreviewedPairs = pairs.filter(p => !p.reviewed)
                const reviewedCount = pairs.filter(p => p.reviewed).length
                return (
                <div
                  key={type}
                  className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {getColourblindTypeName(type as ColourblindType).split(' ')[0]}
                    </span>
                    <span className="text-sm flex items-center gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {unreviewedPairs.length} issue{unreviewedPairs.length !== 1 ? 's' : ''}
                      </span>
                      {reviewedCount > 0 && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {reviewedCount} reviewed
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {unreviewedPairs.slice(0, 3).map((pair, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div
                          className="w-14 h-6 rounded text-xs font-medium flex items-center justify-center"
                          style={{ backgroundColor: pair.background.hex, color: pair.text.hex }}
                        >
                          Aa
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs">
                            {pair.text.name} on {pair.background.name}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {pair.originalRatio.toFixed(1)}→{pair.simulatedRatio.toFixed(1)}
                        </div>
                        {pair.failsUnderSimulation ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                            Fails
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                            Degraded
                          </span>
                        )}
                      </div>
                    ))}
                    {unreviewedPairs.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{unreviewedPairs.length - 3} more pairs
                      </p>
                    )}
                  </div>
                </div>
              )})}
            {/* Reviewed-only types */}
            {Object.entries(report.simulatedContrastIssues)
              .filter(([_, { pairs }]) => pairs.length > 0 && pairs.every(p => p.reviewed))
              .map(([type, { pairs }]) => (
                <div
                  key={type}
                  className="p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">
                      {getColourblindTypeName(type as ColourblindType).split(' ')[0]}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {pairs.length} reviewed
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Recommendations
        </h4>
        <ul className="space-y-2 text-sm">
          {!report.hasRolesAssigned && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>
                <strong>Assign colour roles</strong> in the Contrast Matrix tab to enable
                accurate contrast analysis. Mark which colours will be used as text and which
                as backgrounds.
              </span>
            </li>
          )}
          {report.hasRolesAssigned && report.roleBasedFailing > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>
                {report.roleBasedFailing} text/background combination(s) don't meet WCAG AA
                (4.5:1 contrast ratio). Use the Contrast Matrix to see fix suggestions.
              </span>
            </li>
          )}
          {report.hasRolesAssigned && report.totalSimulatedIssues > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>
                {report.totalSimulatedIssues} text/background pair(s) have reduced contrast under
                colour vision deficiency simulation. Check the Colourblind Simulator tab for details.
                Consider using colours with higher contrast to maintain readability for all users.
              </span>
            </li>
          )}
          {Object.entries(report.colourblindResults)
            .filter(([_, r]) => !r.accessible)
            .map(([type, result]) => (
              <li key={type} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>
                  {result.problematicPairs.length} colour pair(s) within the same category may be difficult to
                  distinguish for people with{' '}
                  {getColourblindTypeName(type as any).split(' ')[0].toLowerCase()}.
                  Consider using different hues or adding patterns/icons as secondary indicators.
                </span>
              </li>
            ))}
          {report.categoriesChecked === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>
                Add at least 2 colours to a category to enable colourblind compatibility checking.
                Colours in the same category (e.g., semantic colours) should be distinguishable.
              </span>
            </li>
          )}
          {report.hasRolesAssigned && report.overallScore >= 80 && report.categoriesChecked > 0 && (
            <li className="flex items-start gap-2 text-green-600 dark:text-green-500">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Your palette demonstrates excellent accessibility! Continue to test
                specific use cases as you apply these colours.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
