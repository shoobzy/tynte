import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, ChevronDown } from 'lucide-react'
import { getContrastResult, formatContrastRatio, getWCAGLevel } from '../../../utils/colour/contrast'
import { isValidHex, normaliseHex } from '../../../utils/colour/conversions'
import { InlineColourPicker } from '../../ui/InlineColourPicker'

interface ColourPickerButtonProps {
  label: string
  value: string
  onChange: (hex: string) => void
}

function ColourPickerButton({ label, value, onChange }: ColourPickerButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-md border border-border flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="flex-1 text-left font-mono text-sm uppercase">{value}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="pt-2">
          <InlineColourPicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

// Default colors: white text on primary-600 (#6217c7) achieves AAA contrast (7:1+)
export function AccessibilityDemo() {
  const [foreground, setForeground] = useState('#ffffff')
  const [background, setBackground] = useState('#6217c7')

  const normalisedFg = isValidHex(foreground) ? normaliseHex(foreground) : '#1e1e1e'
  const normalisedBg = isValidHex(background) ? normaliseHex(background) : '#ffffff'

  const result = getContrastResult(normalisedFg, normalisedBg)
  const wcagLevel = getWCAGLevel(result.ratio)

  const getBadgeClass = (level: string) => {
    if (level === 'AAA') return 'contrast-badge-aaa'
    if (level === 'AA' || level === 'AA Large') return 'contrast-badge-aa'
    return 'contrast-badge-fail'
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="space-y-6">
        {/* Colour inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColourPickerButton
            label="Text Colour"
            value={normalisedFg}
            onChange={setForeground}
          />
          <ColourPickerButton
            label="Background"
            value={normalisedBg}
            onChange={setBackground}
          />
        </div>

        {/* Preview */}
        <motion.div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: normalisedBg }}
          layout
        >
          <p
            className="text-2xl font-semibold"
            style={{ color: normalisedFg }}
          >
            Sample Text
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: normalisedFg }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </motion.div>

        {/* Results */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Contrast Ratio</p>
            <p className="text-3xl font-bold">{formatContrastRatio(result.ratio)}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`contrast-badge ${getBadgeClass(wcagLevel)}`}>
              {wcagLevel}
            </span>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                {result.wcagAA ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                AA
              </span>
              <span className="flex items-center gap-1">
                {result.wcagAAA ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                AAA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
