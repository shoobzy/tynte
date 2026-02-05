import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Check, X, Lightbulb } from 'lucide-react'
import { Button } from '../ui/Button'
import { InlineColourPicker, PaletteColourGroup } from '../ui/InlineColourPicker'
import {
  getContrastResult,
  formatContrastRatio,
  getWCAGLevel,
  suggestContrastingColour,
} from '../../utils/colour/contrast'
import { useUIStore } from '../../stores/uiStore'
import { usePaletteStore } from '../../stores/paletteStore'
import { categoryLabels } from '../../data/presets'

export function ContrastChecker() {
  const {
    contrastForeground,
    contrastBackground,
    setContrastColours,
  } = useUIStore()

  const { palettes, activePaletteId } = usePaletteStore()

  const [localForeground, setLocalForeground] = useState(contrastForeground)
  const [localBackground, setLocalBackground] = useState(contrastBackground)

  const activePalette = palettes.find((p) => p.id === activePaletteId)
  const categoriesWithColours = activePalette?.categories.filter((cat) => cat.colours.length > 0) || []

  // Build palette colour groups for InlineColourPicker
  const paletteColourGroups: PaletteColourGroup[] = categoriesWithColours.map((cat) => ({
    category: categoryLabels[cat.category] || cat.category,
    colours: cat.colours.map((c) => ({ hex: c.hex, name: c.name })),
  }))

  useEffect(() => {
    setLocalForeground(contrastForeground)
    setLocalBackground(contrastBackground)
  }, [contrastForeground, contrastBackground])

  const handleApply = () => {
    setContrastColours(localForeground, localBackground)
  }

  const handleSwap = () => {
    const temp = localForeground
    setLocalForeground(localBackground)
    setLocalBackground(temp)
    setContrastColours(localBackground, localForeground)
  }

  const result = getContrastResult(localForeground, localBackground)
  const level = getWCAGLevel(result.ratio)
  const levelLarge = getWCAGLevel(result.ratio, true)

  const suggestedColour = result.ratio < 4.5
    ? suggestContrastingColour(localBackground, localForeground)
    : null

  return (
    <div className="space-y-6">
      {/* Colour pickers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Foreground (Text)</label>
          <div className="border border-border rounded-lg p-3 bg-card">
            <InlineColourPicker
              value={localForeground}
              onChange={setLocalForeground}
              paletteColourGroups={paletteColourGroups}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Background</label>
          <div className="border border-border rounded-lg p-3 bg-card">
            <InlineColourPicker
              value={localBackground}
              onChange={setLocalBackground}
              paletteColourGroups={paletteColourGroups}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSwap}>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Swap Colours
        </Button>
        <Button onClick={handleApply}>
          Apply
        </Button>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg overflow-hidden border border-border"
      >
        <div
          className="p-8"
          style={{ backgroundColor: localBackground }}
        >
          <p
            className="text-4xl font-bold mb-2"
            style={{ color: localForeground }}
          >
            Sample Text
          </p>
          <p
            className="text-lg"
            style={{ color: localForeground }}
          >
            The quick brown fox jumps over the lazy dog.
          </p>
          <p
            className="text-sm mt-4"
            style={{ color: localForeground }}
          >
            This is what small text looks like with these colour combinations.
          </p>
        </div>
      </motion.div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contrast Ratio */}
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-4xl font-bold mb-2">
            {formatContrastRatio(result.ratio)}
          </div>
          <div className="text-sm text-muted-foreground">
            Contrast Ratio
          </div>
        </div>

        {/* Normal Text */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">
            Normal Text (≤18pt)
          </div>
          <div className="space-y-2">
            <ResultBadge
              label="WCAG AA"
              passed={result.wcagAA}
              requirement="4.5:1"
            />
            <ResultBadge
              label="WCAG AAA"
              passed={result.wcagAAA}
              requirement="7:1"
            />
          </div>
        </div>

        {/* Large Text */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">
            Large Text (≥18pt or 14pt bold)
          </div>
          <div className="space-y-2">
            <ResultBadge
              label="WCAG AA"
              passed={result.wcagAALarge}
              requirement="3:1"
            />
            <ResultBadge
              label="WCAG AAA"
              passed={result.wcagAAALarge}
              requirement="4.5:1"
            />
          </div>
        </div>
      </div>

      {/* Level Badge */}
      <div className="flex items-center justify-center gap-4 p-4 bg-card border border-border rounded-lg">
        <LevelBadge level={level} isLarge={false} />
        <LevelBadge level={levelLarge} isLarge={true} />
      </div>

      {/* Suggestion */}
      {suggestedColour && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Contrast is too low for WCAG AA compliance
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Try using{' '}
              <button
                className="font-mono font-bold hover:underline"
                onClick={() => setLocalForeground(suggestedColour)}
              >
                {suggestedColour.toUpperCase()}
              </button>
              {' '}instead for better accessibility.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-8 h-8 rounded-md border border-yellow-300"
                style={{ backgroundColor: suggestedColour }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLocalForeground(suggestedColour)}
              >
                Apply Suggestion
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface ResultBadgeProps {
  label: string
  passed: boolean
  requirement: string
}

function ResultBadge({ label, passed, requirement }: ResultBadgeProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{requirement}</span>
        {passed ? (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
            <Check className="h-4 w-4" />
            Pass
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-500">
            <X className="h-4 w-4" />
            Fail
          </span>
        )}
      </div>
    </div>
  )
}

interface LevelBadgeProps {
  level: string
  isLarge: boolean
}

function LevelBadge({ level, isLarge }: LevelBadgeProps) {
  const getColour = () => {
    if (level === 'AAA') return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-white'
    if (level === 'AA') return 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-white'
    if (level === 'AA Large') return 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-white'
    return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-white'
  }

  return (
    <div className="text-center">
      <div
        className={`
          inline-flex items-center justify-center px-4 py-2 rounded-full
          font-bold text-lg
          ${getColour()}
        `}
      >
        {level}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {isLarge ? 'Large Text' : 'Normal Text'}
      </p>
    </div>
  )
}

