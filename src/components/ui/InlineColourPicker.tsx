import { useState, useRef, useEffect, useCallback } from 'react'
import { Pipette } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Slider } from './Slider'
import { hexToHsl, hslToHex, isValidHex, normaliseHex } from '../../utils/colour/conversions'
import { supportsEyeDropper } from '../../utils/helpers'

interface InlineColourPickerProps {
  value: string
  onChange: (hex: string) => void
  paletteColours?: { hex: string; name: string }[]
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  onClose?: () => void
}

export function InlineColourPicker({
  value,
  onChange,
  paletteColours = [],
  onError,
  onSuccess,
  onClose,
}: InlineColourPickerProps) {
  const [hexInput, setHexInput] = useState(value)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const baseHsl = hexToHsl(value)
  // Track hue in state to preserve slider position (hex doesn't preserve hue for s=0 colors)
  const [hue, setHue] = useState(baseHsl.h)
  const hsl = { ...baseHsl, h: hue }

  useEffect(() => {
    setHexInput(value)
    // Only sync hue from hex if saturation > 0 (otherwise hue is meaningless in hex)
    if (baseHsl.s > 0) {
      setHue(baseHsl.h)
    }
  }, [value, baseHsl.h, baseHsl.s])

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
    setHue(h)
    const newHex = hslToHex({ ...hsl, h })
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
    <div className="p-3 bg-muted/30 rounded-lg space-y-3">
      {/* Canvas picker */}
      <div className="relative overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          width={280}
          height={120}
          className="w-full h-28 cursor-crosshair border border-border rounded-lg"
          onClick={handleCanvasClick}
        />
        {/* Current colour indicator */}
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            backgroundColor: value,
            left: `${Math.min(100, Math.max(0, hsl.s))}%`,
            top: `${Math.min(100, Math.max(0, 100 - hsl.l))}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Hue slider */}
      <Slider
        value={hsl.h}
        onChange={handleHueChange}
        min={0}
        max={359}
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
