import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, Trash2, RefreshCw, ChevronDown, Pipette } from 'lucide-react'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { Input } from '../ui/Input'
import { Dropdown } from '../ui/Dropdown'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { ColourStop } from '../../types/colour'
import { copyToClipboard, supportsEyeDropper } from '../../utils/helpers'
import { generateRandomColour } from '../../utils/colour/harmony'
import {
  hexToHsl,
  hslToHex,
  isValidHex,
  normaliseHex,
} from '../../utils/colour/conversions'

type GradientType = 'linear' | 'radial' | 'conic'

const gradientTypeOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
]

// Inline colour picker for gradient stops
interface InlineColourPickerProps {
  value: string
  onChange: (hex: string) => void
  paletteColours: { hex: string; name: string }[]
  onClose: () => void
}

function InlineColourPicker({ value, onChange, paletteColours, onClose }: InlineColourPickerProps) {
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
    <div className="p-3 bg-muted/30 space-y-3">
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

      {/* Done button */}
      <div className="flex justify-end pt-1">
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

export function GradientGenerator() {
  const { palettes, activePaletteId, addGradient } = usePaletteStore()
  const toast = useToast()

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [stops, setStops] = useState<ColourStop[]>([
    { colour: '#6366f1', position: 0 },
    { colour: '#ec4899', position: 100 },
  ])
  const [gradientName, setGradientName] = useState('')
  const [nameError, setNameError] = useState('')
  const [expandedStopIndex, setExpandedStopIndex] = useState<number | null>(0)

  // Get all colours from the active palette
  const paletteColours = useMemo(() => {
    if (!activePalette) return []
    return activePalette.categories.flatMap((cat) =>
      cat.colours.map((c) => ({ hex: c.hex, name: c.name }))
    )
  }, [activePalette])

  const cssGradient = generateCSSGradient(gradientType, angle, stops)

  const handleAddStop = () => {
    if (stops.length >= 10) {
      toast.warning('Maximum 10 colour stops allowed')
      return
    }

    // Find a good position for new stop
    const positions = stops.map((s) => s.position).sort((a, b) => a - b)
    let newPosition = 50

    // Find largest gap
    let maxGap = 0
    let gapPosition = 50
    for (let i = 0; i < positions.length - 1; i++) {
      const gap = positions[i + 1] - positions[i]
      if (gap > maxGap) {
        maxGap = gap
        gapPosition = positions[i] + gap / 2
      }
    }
    newPosition = Math.round(gapPosition)

    setStops([...stops, { colour: '#888888', position: newPosition }])
  }

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) {
      toast.warning('Minimum 2 colour stops required')
      return
    }
    setStops(stops.filter((_, i) => i !== index))
  }

  const handleUpdateStop = (index: number, updates: Partial<ColourStop>) => {
    setStops(stops.map((stop, i) => (i === index ? { ...stop, ...updates } : stop)))
  }

  const handleCopyCSS = async () => {
    const success = await copyToClipboard(cssGradient)
    if (success) {
      toast.success('CSS copied to clipboard')
    }
  }

  const handleAddToPalette = () => {
    if (!activePaletteId || !activePalette) {
      toast.error('Please select or create a palette first')
      return
    }

    const name = gradientName.trim()

    // Check if name is empty
    if (!name) {
      setNameError('Please enter a gradient name')
      return
    }

    // Check if name already exists
    const nameExists = activePalette.gradients.some(
      (g) => g.name.toLowerCase() === name.toLowerCase()
    )

    if (nameExists) {
      setNameError('A gradient with this name already exists')
      return
    }

    addGradient(activePaletteId, {
      name,
      type: gradientType,
      angle,
      stops,
    })

    setGradientName('')
    setNameError('')
    toast.success('Gradient added to palette')
  }

  const handleRandomGradient = () => {
    const numStops = Math.floor(Math.random() * 3) + 2 // 2-4 stops
    const newStops: ColourStop[] = []

    for (let i = 0; i < numStops; i++) {
      newStops.push({
        colour: generateRandomColour(),
        position: Math.round((i / (numStops - 1)) * 100),
      })
    }

    setStops(newStops)
    setAngle(Math.floor(Math.random() * 360))
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Preview</label>
          <Button variant="ghost" size="sm" onClick={handleRandomGradient}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Random
          </Button>
        </div>
        <motion.div
          className="h-48 rounded-lg border border-border"
          style={{ background: cssGradient }}
          layout
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Gradient Type</label>
          <Dropdown
            options={gradientTypeOptions}
            value={gradientType}
            onChange={(v) => setGradientType(v as GradientType)}
          />
        </div>

        {/* Angle (only for linear and conic) */}
        {(gradientType === 'linear' || gradientType === 'conic') && (
          <div className="space-y-2">
            <Slider
              value={angle}
              onChange={setAngle}
              min={0}
              max={360}
              step={1}
              label="Angle"
              valueFormat={(v) => `${v}°`}
            />
          </div>
        )}
      </div>

      {/* Colour stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Colour Stops</label>
          <Button variant="outline" size="sm" onClick={handleAddStop}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Stop
          </Button>
        </div>

        {/* Stop bar visualization */}
        <div className="relative h-8 rounded-lg border border-border overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: cssGradient }}
          />
          {stops.map((stop, index) => (
            <motion.div
              key={index}
              className="absolute top-0 bottom-0 w-3 cursor-ew-resize"
              style={{
                left: `calc(${stop.position}% - 6px)`,
                backgroundColor: stop.colour,
                borderLeft: '2px solid white',
                borderRight: '2px solid white',
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragMomentum={false}
              onDrag={() => {
                // Drag position handling - in production you'd calculate based on parent width
              }}
            />
          ))}
        </div>

        {/* Stop list */}
        <div className="space-y-2">
          {stops
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((stop) => {
              const originalIndex = stops.findIndex(
                (s) => s.colour === stop.colour && s.position === stop.position
              )
              const isExpanded = expandedStopIndex === originalIndex

              return (
                <motion.div
                  key={originalIndex}
                  layout
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-2">
                    {/* Colour swatch button */}
                    <button
                      className={`w-10 h-8 rounded border-2 transition-all ${
                        isExpanded ? 'border-primary' : 'border-border hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: stop.colour }}
                      onClick={() => setExpandedStopIndex(isExpanded ? null : originalIndex)}
                      title="Click to edit colour"
                    />

                    {/* Hex value display */}
                    <span className="text-xs font-mono text-muted-foreground uppercase w-16">
                      {stop.colour}
                    </span>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={stop.position}
                        onChange={(e) =>
                          handleUpdateStop(originalIndex, {
                            position: Math.max(0, Math.min(100, Number(e.target.value))),
                          })
                        }
                        min={0}
                        max={100}
                        className="w-16 px-2 py-1 text-xs font-mono border border-border rounded bg-background text-center"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedStopIndex(isExpanded ? null : originalIndex)}
                      title="Edit colour"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.div>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:text-muted-foreground"
                      onClick={() => handleRemoveStop(originalIndex)}
                      disabled={stops.length <= 2}
                      title="Remove colour stop"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Inline colour picker */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                      >
                        <InlineColourPicker
                          value={stop.colour}
                          onChange={(hex) => handleUpdateStop(originalIndex, { colour: hex })}
                          paletteColours={paletteColours}
                          onClose={() => setExpandedStopIndex(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
        </div>
      </div>

      {/* CSS Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">CSS Output</label>
          <Button variant="outline" size="sm" onClick={handleCopyCSS}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy CSS
          </Button>
        </div>
        <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto">
          {cssGradient}
        </pre>
      </div>

      {/* Save to palette */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={gradientName}
              onChange={(e) => {
                setGradientName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="Gradient name"
              className={`w-full px-3 py-2 text-sm border rounded-md bg-background ${
                nameError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-border'
              }`}
            />
          </div>
          <Button onClick={handleAddToPalette}>
            <Plus className="h-4 w-4 mr-2" />
            Add to Palette
          </Button>
        </div>
        {nameError && (
          <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
        )}
      </div>
    </div>
  )
}

function generateCSSGradient(
  type: GradientType,
  angle: number,
  stops: ColourStop[]
): string {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position)
  const stopsString = sortedStops
    .map((stop) => `${stop.colour} ${stop.position}%`)
    .join(', ')

  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${stopsString})`
    case 'radial':
      return `radial-gradient(circle, ${stopsString})`
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${stopsString})`
    default:
      return `linear-gradient(${angle}deg, ${stopsString})`
  }
}
