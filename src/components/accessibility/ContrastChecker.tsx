import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Check, X, Lightbulb, ChevronDown, Palette } from 'lucide-react'
import { Button } from '../ui/Button'
import { ColourInput } from '../ui/Input'
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
  const [showPalettePicker, setShowPalettePicker] = useState(false)

  const activePalette = palettes.find((p) => p.id === activePaletteId)
  const categoriesWithColours = activePalette?.categories.filter((cat) => cat.colours.length > 0) || []

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
      {/* Palette colour picker */}
      {categoriesWithColours.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowPalettePicker(!showPalettePicker)}
            className="w-full flex items-center justify-between p-3 bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Pick from Palette</span>
              <span className="text-sm text-muted-foreground">
                ({activePalette?.name})
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                showPalettePicker ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showPalettePicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Foreground picker */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-blue-500" />
                        <label className="text-sm font-medium">Select Foreground (Text)</label>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {categoriesWithColours.map((category) => (
                          <div key={`fg-${category.category}`}>
                            <label className="text-xs text-muted-foreground">
                              {categoryLabels[category.category] || category.category}
                            </label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {category.colours.map((colour) => (
                                <button
                                  key={colour.id}
                                  onClick={() => setLocalForeground(colour.hex)}
                                  className={`
                                    w-7 h-7 rounded-md transition-all hover:scale-110
                                    ${localForeground.toLowerCase() === colour.hex.toLowerCase()
                                      ? 'ring-2 ring-blue-500 ring-offset-2'
                                      : 'border border-border'
                                    }
                                  `}
                                  style={{ backgroundColor: colour.hex }}
                                  title={colour.name}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Background picker */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-orange-500" />
                        <label className="text-sm font-medium">Select Background</label>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {categoriesWithColours.map((category) => (
                          <div key={`bg-${category.category}`}>
                            <label className="text-xs text-muted-foreground">
                              {categoryLabels[category.category] || category.category}
                            </label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {category.colours.map((colour) => (
                                <button
                                  key={colour.id}
                                  onClick={() => setLocalBackground(colour.hex)}
                                  className={`
                                    w-7 h-7 rounded-md transition-all hover:scale-110
                                    ${localBackground.toLowerCase() === colour.hex.toLowerCase()
                                      ? 'ring-2 ring-orange-500 ring-offset-2'
                                      : 'border border-border'
                                    }
                                  `}
                                  style={{ backgroundColor: colour.hex }}
                                  title={colour.name}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Colour inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Foreground (Text)</label>
          <ColourInput
            value={localForeground}
            onChange={setLocalForeground}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Background</label>
          <ColourInput
            value={localBackground}
            onChange={setLocalBackground}
          />
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

