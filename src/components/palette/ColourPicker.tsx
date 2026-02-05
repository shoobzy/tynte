import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pipette, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Slider } from '../ui/Slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { useToast } from '../ui/Toast'
import { useUIStore } from '../../stores/uiStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import {
  hexToHsl,
  hslToHex,
  hexToRgb,
  rgbToHex,
  isValidHex,
  normaliseHex,
} from '../../utils/colour/conversions'
import { supportsEyeDropper } from '../../utils/helpers'
import { ColourCategory } from '../../types/palette'

interface ColourPickerProps {
  value: string
  onChange: (hex: string) => void
  onAddToPalette?: (hex: string, category: ColourCategory) => void
}

export function ColourPicker({
  value,
  onChange,
  onAddToPalette,
}: ColourPickerProps) {
  const [hexInput, setHexInput] = useState(value)
  const hsl = hexToHsl(value)
  const rgb = hexToRgb(value)
  const toast = useToast()
  const { addRecentColour, recentColours } = usePreferencesStore()
  const { selectedCategory } = useUIStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Update hex input when value changes externally
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

      // Convert SV to SL (simplified)
      const l = lightness * (1 - saturation / 200)
      void l // Used in conversion calculation

      const newHex = hslToHex({
        h: hsl.h,
        s: Math.min(100, Math.max(0, saturation)),
        l: Math.min(100, Math.max(0, lightness / 2 + 25)),
      })

      onChange(newHex)
      addRecentColour(newHex)
    },
    [hsl.h, onChange, addRecentColour]
  )

  const handleHueChange = (h: number) => {
    const newHex = hslToHex({ ...hsl, h })
    onChange(newHex)
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: Math.min(255, Math.max(0, value)) }
    const newHex = rgbToHex(newRgb)
    onChange(newHex)
  }

  const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
    const maxValues = { h: 360, s: 100, l: 100 }
    const newHsl = { ...hsl, [channel]: Math.min(maxValues[channel], Math.max(0, value)) }
    const newHex = hslToHex(newHsl)
    onChange(newHex)
  }

  const handleHexSubmit = () => {
    if (isValidHex(hexInput)) {
      const normalised = normaliseHex(hexInput)
      onChange(normalised)
      addRecentColour(normalised)
    } else {
      toast.error('Invalid hex colour')
      setHexInput(value)
    }
  }

  const handleEyeDropper = async () => {
    if (!supportsEyeDropper()) {
      toast.error('EyeDropper API not supported in this browser')
      return
    }

    try {
      // @ts-expect-error EyeDropper API types
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      onChange(result.sRGBHex)
      addRecentColour(result.sRGBHex)
      toast.success('Colour picked')
    } catch {
      // User cancelled
    }
  }

  const handleAddToPalette = () => {
    if (onAddToPalette) {
      onAddToPalette(value, selectedCategory)
      toast.success('Colour added to palette')
    }
  }

  return (
    <div className="space-y-4">
      {/* Colour gradient picker */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={160}
          className="w-full h-40 rounded-lg cursor-crosshair border border-border"
          onClick={handleCanvasClick}
        />
        {/* Current colour indicator */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
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

      {/* Hex input and actions */}
      <div className="flex gap-2">
        <Input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={handleHexSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
          className="font-mono uppercase flex-1"
          maxLength={7}
        />
        <div
          className="w-10 h-10 rounded-md border border-border"
          style={{ backgroundColor: value }}
        />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        {supportsEyeDropper() && (
          <Button variant="outline" onClick={handleEyeDropper} className="flex-1">
            <Pipette className="h-4 w-4 mr-2" />
            Pick from Screen
          </Button>
        )}
        {onAddToPalette && (
          <Button onClick={handleAddToPalette} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add to Palette
          </Button>
        )}
      </div>

      {/* Tabs for different colour modes */}
      <Tabs defaultValue="rgb">
        <TabsList className="w-full">
          <TabsTrigger value="rgb" className="flex-1">RGB</TabsTrigger>
          <TabsTrigger value="hsl" className="flex-1">HSL</TabsTrigger>
        </TabsList>

        <TabsContent value="rgb" className="space-y-3">
          <Slider
            value={rgb.r}
            onChange={(v) => handleRgbChange('r', v)}
            min={0}
            max={255}
            label="Red"
            gradient={`linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`}
          />
          <Slider
            value={rgb.g}
            onChange={(v) => handleRgbChange('g', v)}
            min={0}
            max={255}
            label="Green"
            gradient={`linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`}
          />
          <Slider
            value={rgb.b}
            onChange={(v) => handleRgbChange('b', v)}
            min={0}
            max={255}
            label="Blue"
            gradient={`linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`}
          />
        </TabsContent>

        <TabsContent value="hsl" className="space-y-3">
          <Slider
            value={hsl.h}
            onChange={(v) => handleHslChange('h', v)}
            min={0}
            max={360}
            label="Hue"
            valueFormat={(v) => `${v}°`}
            gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
          />
          <Slider
            value={hsl.s}
            onChange={(v) => handleHslChange('s', v)}
            min={0}
            max={100}
            label="Saturation"
            valueFormat={(v) => `${v}%`}
          />
          <Slider
            value={hsl.l}
            onChange={(v) => handleHslChange('l', v)}
            min={0}
            max={100}
            label="Lightness"
            valueFormat={(v) => `${v}%`}
          />
        </TabsContent>
      </Tabs>

      {/* Recent colours */}
      {recentColours.length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Recent Colours
          </label>
          <div className="flex flex-wrap gap-1.5 p-1 -m-1">
            {recentColours.slice(0, 12).map((hex) => (
              <motion.button
                key={hex}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-7 h-7 rounded-md border border-border
                  ${hex === value ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
                style={{ backgroundColor: hex }}
                onClick={() => {
                  onChange(hex)
                  setHexInput(hex)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
