import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { ColourScale as ColourScaleType } from '../../types/palette'
import { copyToClipboard } from '../../utils/helpers'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { scaleStepNames } from '../../utils/colour/scales'

interface ColourScaleProps {
  scale: ColourScaleType
  name?: string
  onAddToPalette?: (hexValues: string[]) => void
}

export function ColourScale({ scale, name, onAddToPalette }: ColourScaleProps) {
  const [hoveredStep, setHoveredStep] = useState<keyof ColourScaleType | null>(null)
  const toast = useToast()

  const handleCopyStep = async (step: keyof ColourScaleType) => {
    const success = await copyToClipboard(scale[step])
    if (success) {
      toast.success(`${step}: ${scale[step]} copied`)
    }
  }

  const handleCopyAll = async () => {
    const values = scaleStepNames.map((step) => `${step}: ${scale[step]}`).join('\n')
    const success = await copyToClipboard(values)
    if (success) {
      toast.success('Scale copied to clipboard')
    }
  }

  const handleAddToPalette = () => {
    if (onAddToPalette) {
      const hexValues = scaleStepNames.map((step) => scale[step])
      onAddToPalette(hexValues)
      toast.success('Scale added to palette')
    }
  }

  return (
    <div className="space-y-3">
      {name && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{name}</h4>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopyAll}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy All
            </Button>
            {onAddToPalette && (
              <Button variant="ghost" size="sm" onClick={handleAddToPalette}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Palette
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex rounded-lg overflow-hidden border border-border">
        {scaleStepNames.map((step) => {
          const hex = scale[step]
          const textColour = getOptimalTextColour(hex)
          const isHovered = hoveredStep === step

          return (
            <motion.div
              key={step}
              className="flex-1 relative cursor-pointer"
              style={{ backgroundColor: hex }}
              onMouseEnter={() => setHoveredStep(step)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => handleCopyStep(step)}
              whileHover={{ flex: 2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-16 flex flex-col items-center justify-center">
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                    style={{ color: textColour }}
                  >
                    <div className="text-xs font-medium">{step}</div>
                    <div className="text-[10px] font-mono opacity-80">
                      {hex.toUpperCase()}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed list view */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {scaleStepNames.map((step) => {
          const hex = scale[step]

          return (
            <div
              key={step}
              className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleCopyStep(step)}
            >
              <div
                className="w-8 h-8 rounded-md flex-shrink-0"
                style={{ backgroundColor: hex }}
              />
              <div className="min-w-0">
                <div className="text-xs font-medium">{step}</div>
                <div className="text-xs font-mono text-muted-foreground truncate">
                  {hex.toUpperCase()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ColourScalePreviewProps {
  scale: ColourScaleType | string[]
  compact?: boolean
}

export function ColourScalePreview({ scale, compact = false }: ColourScalePreviewProps) {
  const values = Array.isArray(scale)
    ? scale
    : scaleStepNames.map((step) => scale[step])

  return (
    <div className={`flex rounded-lg overflow-hidden ${compact ? '' : 'border border-border'}`}>
      {values.map((hex, index) => (
        <div
          key={index}
          className={`flex-1 ${compact ? 'h-6' : 'h-10'}`}
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  )
}
