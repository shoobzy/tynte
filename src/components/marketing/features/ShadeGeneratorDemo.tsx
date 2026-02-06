import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { generateScaleOKLCH, scaleStepNames } from '../../../utils/colour/scales'
import { getOptimalTextColour } from '../../../utils/colour/contrast'
import { isValidHex, normaliseHex } from '../../../utils/colour/conversions'
import { InlineColourPicker } from '../../ui/InlineColourPicker'

export function ShadeGeneratorDemo() {
  const [baseColour, setBaseColour] = useState('#6217c7')
  const [isExpanded, setIsExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const normalisedBase = isValidHex(baseColour) ? normaliseHex(baseColour) : '#6217c7'
  const scale = generateScaleOKLCH(normalisedBase)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="space-y-6">
        {/* Colour input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">Base Colour</label>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-md border border-border flex-shrink-0"
              style={{ backgroundColor: normalisedBase }}
            />
            <span className="flex-1 text-left font-mono text-sm uppercase">{normalisedBase}</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsExpanded(false)}
                />
                <motion.div
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  className="absolute top-full left-0 right-0 z-20 pt-2"
                >
                  <div className="border border-border rounded-lg bg-card shadow-lg">
                    <InlineColourPicker value={normalisedBase} onChange={setBaseColour} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Scale preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Generated Scale (50-950)</p>
          <div className="grid grid-cols-11 gap-1">
            {scaleStepNames.map((step, index) => {
              const colour = scale[step]
              const textColour = getOptimalTextColour(colour)
              return (
                <motion.div
                  key={step}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: colour, color: textColour }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  title={`${step}: ${colour}`}
                >
                  {step}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Expanded view of key shades */}
        <div className="grid grid-cols-3 gap-3">
          {[100, 500, 900].map((step) => {
            const colour = scale[step as keyof typeof scale]
            const textColour = getOptimalTextColour(colour)
            return (
              <motion.div
                key={step}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: colour, color: textColour }}
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-lg font-semibold">{step}</p>
                <p className="text-xs font-mono opacity-80">{colour}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
