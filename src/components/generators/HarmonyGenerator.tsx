import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { InlineColourPicker } from '../ui/InlineColourPicker'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import {
  generateHarmony,
  harmonyTypes,
  getHarmonyName,
  getHarmonyDescription,
  generateRandomColour,
} from '../../utils/colour/harmony'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { copyToClipboard } from '../../utils/helpers'
import { ColourHarmony } from '../../types/colour'
import { ColourCategory } from '../../types/palette'
import { CategorySelectModal } from './CategorySelectModal'

export function HarmonyGenerator() {
  const {
    harmonyType,
    setHarmonyType,
    harmonyBaseColour,
    setHarmonyBaseColour,
  } = useUIStore()

  const { palettes, activePaletteId, addColoursToCategory } = usePaletteStore()
  const toast = useToast()

  const [generatedColours, setGeneratedColours] = useState<string[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [pickerExpanded, setPickerExpanded] = useState(true)

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  // Get colours from the active palette grouped by category
  const paletteColourGroups = useMemo(() => {
    if (!activePalette) return []
    return activePalette.categories
      .filter((cat) => cat.colours.length > 0)
      .map((cat) => ({
        category: cat.category,
        colours: cat.colours.map((c) => ({ hex: c.hex, name: c.name })),
      }))
  }, [activePalette])

  useEffect(() => {
    const colours = generateHarmony(harmonyBaseColour, harmonyType)
    setGeneratedColours(colours)
  }, [harmonyBaseColour, harmonyType])

  const handleRandomBase = () => {
    setHarmonyBaseColour(generateRandomColour())
  }

  const handleCopyAll = async () => {
    const text = generatedColours.join(', ')
    const success = await copyToClipboard(text)
    if (success) {
      toast.success('Colours copied to clipboard')
    }
  }

  const handleAddToPalette = () => {
    if (!activePaletteId) {
      toast.error('Please select or create a palette first')
      return
    }
    setShowCategoryModal(true)
  }

  const handleCategorySelect = (category: ColourCategory) => {
    if (activePaletteId) {
      addColoursToCategory(activePaletteId, generatedColours, category)
      toast.success(`Added ${generatedColours.length} colours to ${category}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Base colour input */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setPickerExpanded(!pickerExpanded)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md border border-border"
              style={{ backgroundColor: harmonyBaseColour }}
            />
            <div>
              <label className="text-sm font-medium">Base Colour</label>
              <p className="text-xs font-mono text-muted-foreground">
                {harmonyBaseColour.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRandomBase()
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Random
            </Button>
            <motion.div
              animate={{ rotate: pickerExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {pickerExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border"
            >
              <InlineColourPicker
                value={harmonyBaseColour}
                onChange={setHarmonyBaseColour}
                paletteColourGroups={paletteColourGroups}
                onError={(msg) => toast.error(msg)}
                onSuccess={(msg) => toast.success(msg)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Harmony type selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Harmony Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {harmonyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setHarmonyType(type)}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${harmonyType === type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="text-sm font-medium">{getHarmonyName(type)}</div>
              <HarmonyPreview baseColour={harmonyBaseColour} type={type} />
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {getHarmonyDescription(harmonyType)}
      </p>

      {/* Generated colours */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Generated Colours</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyAll}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy All
            </Button>
            <Button size="sm" onClick={handleAddToPalette}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add to Palette
            </Button>
          </div>
        </div>

        {/* Colour wheel visualization */}
        <div className="flex justify-center py-4">
          <ColourWheel
            baseColour={harmonyBaseColour}
            colours={generatedColours}
            type={harmonyType}
          />
        </div>

        {/* Colour swatches */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {generatedColours.map((colour, index) => {
            const textColour = getOptimalTextColour(colour)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 h-24 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: colour }}
                onClick={async () => {
                  await copyToClipboard(colour)
                  toast.success(`${colour.toUpperCase()} copied`)
                }}
              >
                <span
                  className="text-xs font-mono font-medium"
                  style={{ color: textColour }}
                >
                  {colour.toUpperCase()}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Colour details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {generatedColours.map((colour, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
              onClick={async () => {
                await copyToClipboard(colour)
                toast.success(`${colour.toUpperCase()} copied`)
              }}
            >
              <div
                className="w-8 h-8 rounded-md flex-shrink-0"
                style={{ backgroundColor: colour }}
              />
              <span className="text-xs font-mono truncate">
                {colour.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <CategorySelectModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        colours={generatedColours}
        title="Add Harmony Colours"
      />
    </div>
  )
}

interface HarmonyPreviewProps {
  baseColour: string
  type: ColourHarmony
}

function HarmonyPreview({ baseColour, type }: HarmonyPreviewProps) {
  const colours = generateHarmony(baseColour, type)

  return (
    <div className="flex gap-0.5 mt-2">
      {colours.slice(0, 5).map((colour, index) => (
        <div
          key={index}
          className="h-3 flex-1 rounded-sm first:rounded-l last:rounded-r"
          style={{ backgroundColor: colour }}
        />
      ))}
    </div>
  )
}

interface ColourWheelProps {
  baseColour: string
  colours: string[]
  type: ColourHarmony
}

function ColourWheel({ colours }: ColourWheelProps) {
  const size = 200
  const center = size / 2
  const radius = 80
  const dotRadius = 12

  // Calculate positions on the colour wheel
  const getPosition = (index: number, total: number) => {
    // Calculate hue offset from the first colour
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    }
  }

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Colour wheel background */}
      <defs>
        <linearGradient id="hue-gradient" gradientTransform="rotate(90)">
          {Array.from({ length: 12 }).map((_, i) => (
            <stop
              key={i}
              offset={`${(i / 12) * 100}%`}
              stopColor={`hsl(${(i / 12) * 360}, 80%, 50%)`}
            />
          ))}
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle
        cx={center}
        cy={center}
        r={radius + 20}
        fill="none"
        stroke="url(#hue-gradient)"
        strokeWidth="15"
        className="opacity-20"
      />

      {/* Connection lines */}
      {colours.length > 1 && (
        <polygon
          points={colours
            .map((_, index) => {
              const pos = getPosition(index, colours.length)
              return `${pos.x},${pos.y}`
            })
            .join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/30"
          strokeDasharray="4 4"
        />
      )}

      {/* Colour dots */}
      {colours.map((colour, index) => {
        const pos = getPosition(index, colours.length)
        const isBase = index === 0

        return (
          <g key={index}>
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              cx={pos.x}
              cy={pos.y}
              r={isBase ? dotRadius + 4 : dotRadius}
              fill={colour}
              stroke="white"
              strokeWidth="3"
              className="drop-shadow-md"
            />
            {isBase && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={dotRadius + 8}
                fill="none"
                stroke={colour}
                strokeWidth="2"
                className="opacity-50"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
