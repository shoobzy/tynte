import { useState, useRef, useEffect, useCallback } from 'react'
import { Pipette } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Slider } from './Slider'
import { hexToHsv, hsvToHex, isValidHex, normaliseHex } from '../../utils/colour/conversions'
import { supportsEyeDropper } from '../../utils/helpers'
import { categoryLabels } from '../../data/presets'

export interface PaletteColourGroup {
  category: string
  colours: { hex: string; name: string }[]
}

interface InlineColourPickerProps {
  value: string
  onChange: (hex: string) => void
  /** @deprecated Use paletteColourGroups for grouped display */
  paletteColours?: { hex: string; name: string }[]
  paletteColourGroups?: PaletteColourGroup[]
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  onClose?: () => void
}

export function InlineColourPicker({
  value,
  onChange,
  paletteColours = [],
  paletteColourGroups,
  onError,
  onSuccess,
  onClose,
}: InlineColourPickerProps) {
  const [hexInput, setHexInput] = useState(value)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const baseHsv = hexToHsv(value)
  // Track hue and saturation in state to preserve slider positions
  // (hex doesn't preserve hue when s=0, or saturation when v=0)
  const [hue, setHue] = useState(baseHsv.h)
  const [saturation, setSaturation] = useState(baseHsv.s)
  const hsv = { ...baseHsv, h: hue, s: baseHsv.v > 0 ? baseHsv.s : saturation }

  useEffect(() => {
    setHexInput(value)
    // Only sync hue from hex if saturation > 0 (otherwise hue is meaningless in hex)
    if (baseHsv.s > 0) {
      setHue(baseHsv.h)
    }
    // Only sync saturation from hex if brightness > 0 (otherwise saturation is meaningless in hex)
    if (baseHsv.v > 0) {
      setSaturation(baseHsv.s)
    }
  }, [value, baseHsv.h, baseHsv.s, baseHsv.v])

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
    satGradient.addColorStop(1, `hsl(${hsv.h}, 100%, 50%)`)

    ctx.fillStyle = satGradient
    ctx.fillRect(0, 0, width, height)

    // Vertical value gradient (transparent to black)
    const valueGradient = ctx.createLinearGradient(0, 0, 0, height)
    valueGradient.addColorStop(0, 'rgba(0,0,0,0)')
    valueGradient.addColorStop(1, 'black')

    ctx.fillStyle = valueGradient
    ctx.fillRect(0, 0, width, height)
  }, [hsv.h])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const saturation = Math.round((x / rect.width) * 100)
      const value = Math.round(100 - (y / rect.height) * 100)

      const newHex = hsvToHex({
        h: hsv.h,
        s: Math.min(100, Math.max(0, saturation)),
        v: Math.min(100, Math.max(0, value)),
      })

      onChange(newHex)
    },
    [hsv.h, onChange]
  )

  const handleHueChange = (h: number) => {
    setHue(h)
    const newHex = hsvToHex({ ...hsv, h })
    onChange(newHex)
  }

  const handleSaturationChange = (s: number) => {
    setSaturation(s)
    const newHex = hsvToHex({ ...hsv, s })
    onChange(newHex)
  }

  const handleValueChange = (v: number) => {
    const newHex = hsvToHex({ ...hsv, v })
    onChange(newHex)
  }

  const handleHexSubmit = () => {
    if (isValidHex(hexInput)) {
      const normalised = normaliseHex(hexInput)
      onChange(normalised)
    } else {
      onError?.('Invalid hex colour')
      setHexInput(value)
    }
  }

  const handleEyeDropper = async () => {
    if (!supportsEyeDropper()) {
      onError?.('EyeDropper not supported in this browser')
      return
    }

    try {
      // @ts-expect-error EyeDropper API types
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      onChange(result.sRGBHex)
      onSuccess?.('Colour picked')
    } catch {
      // User cancelled
    }
  }

  return (
    <div className="p-3 bg-muted/50 rounded-lg space-y-3">
      {/* Canvas picker - outer padding prevents thumb clipping */}
      <div className="p-2">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={280}
            height={120}
            className="w-full h-28 cursor-crosshair border border-border rounded-lg block"
            onClick={handleCanvasClick}
          />
          {/* Current colour indicator */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
            style={{
              backgroundColor: value,
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1.5px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>

      {/* HSV sliders */}
      <div className="space-y-2">
        <Slider
          value={hsv.h}
          onChange={handleHueChange}
          min={0}
          max={359}
          step={1}
          label="Hue"
          valueFormat={(v) => `${v}°`}
          gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
        />
        <Slider
          value={hsv.s}
          onChange={handleSaturationChange}
          min={0}
          max={100}
          step={1}
          label="Saturation"
          valueFormat={(v) => `${v}%`}
          gradient={`linear-gradient(to right, ${hsvToHex({ h: hsv.h, s: 0, v: hsv.v })}, ${hsvToHex({ h: hsv.h, s: 100, v: hsv.v })})`}
        />
        <Slider
          value={hsv.v}
          onChange={handleValueChange}
          min={0}
          max={100}
          step={1}
          label="Brightness"
          valueFormat={(v) => `${v}%`}
          gradient={`linear-gradient(to right, ${hsvToHex({ h: hsv.h, s: hsv.s, v: 0 })}, ${hsvToHex({ h: hsv.h, s: hsv.s, v: 100 })})`}
        />
      </div>

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

      {/* Palette colours - grouped by category */}
      {paletteColourGroups && paletteColourGroups.some(g => g.colours.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">From palette:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto px-1 -mx-1">
            {paletteColourGroups.filter(g => g.colours.length > 0).map((group) => (
              <div key={group.category} className="px-1">
                <label className="text-xs text-muted-foreground">
                  {categoryLabels[group.category] || group.category}
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1 py-1 -my-1">
                  {group.colours.map((colour, index) => (
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
            ))}
          </div>
        </div>
      )}

      {/* Palette colours - flat list (legacy) */}
      {!paletteColourGroups && paletteColours.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">From palette:</p>
          <div className="flex flex-wrap gap-1.5 p-1 -m-1">
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

      {/* Done button (optional) */}
      {onClose && (
        <div className="flex justify-end pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </div>
  )
}
