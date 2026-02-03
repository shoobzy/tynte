import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, Trash2, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { Dropdown } from '../ui/Dropdown'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { ColourStop } from '../../types/colour'
import { copyToClipboard } from '../../utils/helpers'
import { generateRandomColour } from '../../utils/colour/harmony'

type GradientType = 'linear' | 'radial' | 'conic'

const gradientTypeOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
]

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
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Colour Stops</label>
            {paletteColours.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Use colours from your palette
              </span>
            )}
          </div>
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
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="color"
                        value={stop.colour}
                        onChange={(e) =>
                          handleUpdateStop(originalIndex, { colour: e.target.value })
                        }
                        className="w-10 h-8 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={stop.colour}
                        onChange={(e) =>
                          handleUpdateStop(originalIndex, { colour: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-xs font-mono border border-border rounded bg-background"
                      />
                    </div>

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

                    {paletteColours.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExpandedStopIndex(isExpanded ? null : originalIndex)}
                        title="Select from palette"
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </motion.div>
                      </Button>
                    )}

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

                  {/* Palette colour swatches */}
                  <AnimatePresence>
                    {isExpanded && paletteColours.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                      >
                        <div className="p-2 bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-2">Select from palette:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {paletteColours.map((colour, colourIndex) => (
                              <button
                                key={colourIndex}
                                className="w-7 h-7 rounded border border-border hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all"
                                style={{ backgroundColor: colour.hex }}
                                onClick={() => {
                                  handleUpdateStop(originalIndex, { colour: colour.hex })
                                  setExpandedStopIndex(null)
                                }}
                                title={`${colour.name} (${colour.hex})`}
                              />
                            ))}
                          </div>
                        </div>
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
