import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, RefreshCw, ChevronDown, Pipette } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Slider } from '../ui/Slider'
import { useToast } from '../ui/Toast'
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
import { copyToClipboard, supportsEyeDropper } from '../../utils/helpers'
import {
  hexToHsl,
  hslToHex,
  isValidHex,
  normaliseHex,
} from '../../utils/colour/conversions'
import { ColourHarmony } from '../../types/colour'
import { ColourCategory } from '../../types/palette'
import { CategorySelectModal } from './CategorySelectModal'

// Inline colour picker for base colour
interface InlineColourPickerProps {
  value: string
  onChange: (hex: string) => void
  paletteColours: { hex: string; name: string }[]
}

function InlineColourPicker({ value, onChange, paletteColours }: InlineColourPickerProps) {
  const [hexInput, setHexInput] = useState(value)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const toast = useToast()
  const hsl = hexToHsl(value)

  useEffect(() => {
    setHexInput(value)
  }, [value])

  // Draw the colour gradient canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Horizontal saturation gradient (white to full colour)
    const satGradient = ctx.createLinearGradient(0, 0, width, 0)
    satGradient.addColorStop(0, 'white')
    satGradient.addColorStop(1, `hsl(${hsl.h}, 100%, 50%)`)

    ctx.fillStyle = satGradient
    ctx.fillRect(0, 0, width, height)

    // Vertical lightness gradient (transparent to black)
    const lightGradient = ctx.createLinearGradient(0, 0, 0, height)
    lightGradient.addColorStop(0, 'rgba(0,0,0,0)')
    lightGradient.addColorStop(1, 'black')

    ctx.fillStyle = lightGradient
    ctx.fillRect(0, 0, width, height)
  }, [hsl.h])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const saturation = Math.round((x / rect.width) * 100)
      const lightness = Math.round(100 - (y / rect.height) * 100)

      const newHex = hslToHex({
        h: hsl.h,
        s: Math.min(100, Math.max(0, saturation)),
        l: Math.min(100, Math.max(0, lightness / 2 + 25)),
      })

      onChange(newHex)
    },
    [hsl.h, onChange]
  )

  const handleHueChange = (h: number) => {
    const newHex = hslToHex({ ...hsl, h })
    onChange(newHex)
  }

  const handleHexSubmit = () => {
    if (isValidHex(hexInput)) {
      const normalised = normaliseHex(hexInput)
      onChange(normalised)
    } else {
      toast.error('Invalid hex colour')
      setHexInput(value)
    }
  }

  const handleEyeDropper = async () => {
    if (!supportsEyeDropper()) {
      toast.error('EyeDropper not supported in this browser')
      return
    }

    try {
      // @ts-expect-error EyeDropper API types
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      onChange(result.sRGBHex)
      toast.success('Colour picked')
    } catch {
      // User cancelled
    }
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg space-y-3">
      {/* Canvas picker */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={120}
          className="w-full h-28 rounded-lg cursor-crosshair border border-border"
          onClick={handleCanvasClick}
        />
        {/* Current colour indicator */}
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            backgroundColor: value,
            left: `${hsl.s}%`,
            top: `${100 - hsl.l * 2 + 50}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Hue slider */}
      <Slider
        value={hsl.h}
        onChange={handleHueChange}
        min={0}
        max={360}
        step={1}
        label="Hue"
        gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
      />

      {/* Hex input and preview */}
      <div className="flex gap-2">
        <Input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={handleHexSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
          className="font-mono uppercase flex-1 h-9"
          maxLength={7}
        />
        <div
          className="w-9 h-9 rounded-md border border-border flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        {supportsEyeDropper() && (
          <Button variant="outline" size="icon" onClick={handleEyeDropper} className="h-9 w-9" title="Pick from screen">
            <Pipette className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Palette colours */}
      {paletteColours.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">From palette:</p>
          <div className="flex flex-wrap gap-1.5">
            {paletteColours.map((colour, index) => (
              <button
                key={index}
                className={`w-7 h-7 rounded border border-border hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all ${
                  colour.hex.toLowerCase() === value.toLowerCase() ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
                style={{ backgroundColor: colour.hex }}
                onClick={() => onChange(colour.hex)}
                title={`${colour.name} (${colour.hex})`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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

  // Get all colours from the active palette
  const paletteColours = useMemo(() => {
    if (!activePalette) return []
    return activePalette.categories.flatMap((cat) =>
      cat.colours.map((c) => ({ hex: c.hex, name: c.name }))
    )
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
                paletteColours={paletteColours}
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
