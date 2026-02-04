import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, RefreshCw, ChevronDown, Pipette } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Slider } from '../ui/Slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { ColourScale, ColourScalePreview } from '../palette/ColourScale'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import {
  generateScaleHSL,
  generateScaleOKLCH,
  generateCustomScale,
  generateTints,
  generateShades,
  generateTones,
  scaleStepNames,
} from '../../utils/colour/scales'
import { generateRandomColour } from '../../utils/colour/harmony'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { copyToClipboard, supportsEyeDropper } from '../../utils/helpers'
import {
  hexToHsl,
  hslToHex,
  isValidHex,
  normaliseHex,
} from '../../utils/colour/conversions'
import { ColourScale as ColourScaleType, ColourCategory } from '../../types/palette'
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

export function ScaleGenerator() {
  const { scaleBaseColour, setScaleBaseColour, setGeneratedScale } = useUIStore()
  const { palettes, activePaletteId, addColoursToCategory } = usePaletteStore()
  const toast = useToast()

  const [method, setMethod] = useState<'oklch' | 'hsl'>('oklch')
  const [customSteps, setCustomSteps] = useState(11)
  const [scale, setScale] = useState<ColourScaleType | null>(null)
  const [customScaleColours, setCustomScaleColours] = useState<string[]>([])
  const [tints, setTints] = useState<string[]>([])
  const [shades, setShades] = useState<string[]>([])
  const [tones, setTones] = useState<string[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [coloursToAdd, setColoursToAdd] = useState<string[]>([])
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
    // Generate main scale
    const newScale = method === 'oklch'
      ? generateScaleOKLCH(scaleBaseColour)
      : generateScaleHSL(scaleBaseColour)
    setScale(newScale)
    setGeneratedScale(newScale)

    // Generate custom scale
    setCustomScaleColours(generateCustomScale(scaleBaseColour, customSteps, method))

    // Generate tints, shades, tones
    setTints(generateTints(scaleBaseColour, 5))
    setShades(generateShades(scaleBaseColour, 5))
    setTones(generateTones(scaleBaseColour, 5))
  }, [scaleBaseColour, method, customSteps, setGeneratedScale])

  const handleRandomBase = () => {
    setScaleBaseColour(generateRandomColour())
  }

  const handleCopyScale = async () => {
    if (!scale) return
    const values = scaleStepNames.map((step) => `${step}: ${scale[step]}`).join('\n')
    const success = await copyToClipboard(values)
    if (success) {
      toast.success('Scale copied to clipboard')
    }
  }

  const handleAddScaleToPalette = () => {
    if (!activePaletteId || !scale) {
      toast.error('Please select or create a palette first')
      return
    }
    const hexValues = scaleStepNames.map((step) => scale[step])
    setColoursToAdd(hexValues)
    setShowCategoryModal(true)
  }

  const handleAddColoursToPalette = (colours: string[]) => {
    if (!activePaletteId) {
      toast.error('Please select or create a palette first')
      return
    }
    setColoursToAdd(colours)
    setShowCategoryModal(true)
  }

  const handleCategorySelect = (category: ColourCategory) => {
    if (activePaletteId) {
      addColoursToCategory(activePaletteId, coloursToAdd, category)
      toast.success(`Added ${coloursToAdd.length} colours to ${category}`)
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
              style={{ backgroundColor: scaleBaseColour }}
            />
            <div>
              <label className="text-sm font-medium">Base Colour</label>
              <p className="text-xs font-mono text-muted-foreground">
                {scaleBaseColour.toUpperCase()}
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
                value={scaleBaseColour}
                onChange={setScaleBaseColour}
                paletteColours={paletteColours}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Method selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Generation Method</label>
        <div className="flex gap-2">
          <Button
            variant={method === 'oklch' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMethod('oklch')}
          >
            OKLCH (Perceptual)
          </Button>
          <Button
            variant={method === 'hsl' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMethod('hsl')}
          >
            HSL (Traditional)
          </Button>
        </div>
      </div>

      {/* Main scale */}
      {scale && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Tailwind-style Scale (50-950)</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyScale}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy
              </Button>
              <Button size="sm" onClick={handleAddScaleToPalette}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Palette
              </Button>
            </div>
          </div>
          <ColourScale scale={scale} />
        </div>
      )}

      {/* Tabs for different scale types */}
      <Tabs defaultValue="custom">
        <TabsList>
          <TabsTrigger value="custom">Custom Steps</TabsTrigger>
          <TabsTrigger value="tints">Tints</TabsTrigger>
          <TabsTrigger value="shades">Shades</TabsTrigger>
          <TabsTrigger value="tones">Tones</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <Slider
            value={customSteps}
            onChange={setCustomSteps}
            min={3}
            max={21}
            step={1}
            label="Number of Steps"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {customSteps} colour scale
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddColoursToPalette(customScaleColours)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Palette
              </Button>
            </div>
            <ColourScalePreview scale={customScaleColours} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {customScaleColours.map((colour, index) => (
                <ColourChip key={index} colour={colour} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tints" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tints are created by adding white to the base colour, making it lighter.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Base + 5 Tints</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddColoursToPalette([scaleBaseColour, ...tints])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Palette
              </Button>
            </div>
            <ColourScalePreview scale={[scaleBaseColour, ...tints]} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <ColourChip colour={scaleBaseColour} label="Base" />
              {tints.map((colour, index) => (
                <ColourChip key={index} colour={colour} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shades" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Shades are created by adding black to the base colour, making it darker.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Base + 5 Shades</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddColoursToPalette([scaleBaseColour, ...shades])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Palette
              </Button>
            </div>
            <ColourScalePreview scale={[scaleBaseColour, ...shades]} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <ColourChip colour={scaleBaseColour} label="Base" />
              {shades.map((colour, index) => (
                <ColourChip key={index} colour={colour} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tones" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tones are created by adding grey to the base colour, reducing its saturation.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Base + 5 Tones</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddColoursToPalette([scaleBaseColour, ...tones])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add to Palette
              </Button>
            </div>
            <ColourScalePreview scale={[scaleBaseColour, ...tones]} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <ColourChip colour={scaleBaseColour} label="Base" />
              {tones.map((colour, index) => (
                <ColourChip key={index} colour={colour} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CategorySelectModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        colours={coloursToAdd}
        title="Add Scale Colours"
      />
    </div>
  )
}

interface ColourChipProps {
  colour: string
  label?: string
}

function ColourChip({ colour, label }: ColourChipProps) {
  const toast = useToast()
  const textColour = getOptimalTextColour(colour)

  const handleClick = async () => {
    await copyToClipboard(colour)
    toast.success(`${colour.toUpperCase()} copied`)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-3 py-1.5 rounded-md text-xs font-mono border border-border"
      style={{ backgroundColor: colour, color: textColour }}
      onClick={handleClick}
    >
      {label || colour.toUpperCase()}
    </motion.button>
  )
}
