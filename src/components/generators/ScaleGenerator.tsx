import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Copy, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import { ColourInput } from '../ui/Input'
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
import { copyToClipboard } from '../../utils/helpers'
import { ColourScale as ColourScaleType, ColourCategory } from '../../types/palette'
import { CategorySelectModal } from './CategorySelectModal'

export function ScaleGenerator() {
  const { scaleBaseColour, setScaleBaseColour, setGeneratedScale } = useUIStore()
  const { activePaletteId, addColoursToCategory } = usePaletteStore()
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Base Colour</label>
          <Button variant="ghost" size="sm" onClick={handleRandomBase}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Random
          </Button>
        </div>
        <ColourInput
          value={scaleBaseColour}
          onChange={setScaleBaseColour}
        />
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
