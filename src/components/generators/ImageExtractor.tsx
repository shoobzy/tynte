import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Plus, Copy, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { copyToClipboard } from '../../utils/helpers'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { ColourCategory } from '../../types/palette'
import { CategorySelectModal } from './CategorySelectModal'
import ColourExtractorWorker from '../../workers/colourExtractor.worker?worker'
import type { WorkerResult } from '../../workers/colourExtractor.worker'

interface ExtractedColour {
  hex: string
  count: number
  percentage: number
}

export function ImageExtractor() {
  const { activePaletteId, addColoursToCategory } = usePaletteStore()
  const toast = useToast()

  const [image, setImage] = useState<string | null>(null)
  const [colours, setColours] = useState<ExtractedColour[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [colourCount, setColourCount] = useState(8)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<Worker | null>(null)

  // Initialize and clean up the worker
  useEffect(() => {
    workerRef.current = new ColourExtractorWorker()

    workerRef.current.onmessage = (event: MessageEvent<WorkerResult>) => {
      const { type } = event.data

      if (type === 'result') {
        setColours(event.data.colours)
        setIsLoading(false)
      } else if (type === 'error') {
        toast.error('Failed to extract colours')
        setIsLoading(false)
      }
    }

    workerRef.current.onerror = () => {
      toast.error('Worker error occurred')
      setIsLoading(false)
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [toast])

  const extractColours = useCallback(
    (imageUrl: string) => {
      setIsLoading(true)

      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Scale down for performance
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Send pixel data to worker for processing
        if (workerRef.current) {
          workerRef.current.postMessage({
            type: 'extract',
            pixels: imageData.data,
            colourCount,
          })
        } else {
          toast.error('Worker not available')
          setIsLoading(false)
        }
      }

      img.onerror = () => {
        toast.error('Failed to load image')
        setIsLoading(false)
      }

      img.src = imageUrl
    },
    [colourCount, toast]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      setImage(imageUrl)
      extractColours(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]

    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please drop an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      setImage(imageUrl)
      extractColours(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleClear = () => {
    setImage(null)
    setColours([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCopyAll = async () => {
    const text = colours.map((c) => c.hex).join(', ')
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
      const hexValues = colours.map((c) => c.hex)
      addColoursToCategory(activePaletteId, hexValues, category)
      toast.success(`Added ${hexValues.length} colours to ${category}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload area */}
      {!image ? (
        <motion.div
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Drop an image here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse your files
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Supports JPG, PNG, GIF, WebP
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative">
            <img
              src={image}
              alt="Uploaded image"
              className="w-full max-h-64 object-contain rounded-lg border border-border"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur"
              onClick={handleClear}
              title="Clear image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Controls */}
          <Slider
            value={colourCount}
            onChange={(v) => {
              setColourCount(v)
              if (image) extractColours(image)
            }}
            min={4}
            max={16}
            step={1}
            label="Number of Colours"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Extracting colours...</p>
        </div>
      )}

      {/* Extracted colours */}
      {colours.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Extracted Colours</h4>
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

          {/* Colour bar */}
          <div className="flex rounded-lg overflow-hidden border border-border h-16">
            {colours.map((colour, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-1 flex items-center justify-center cursor-pointer hover:flex-[2] transition-all"
                style={{ backgroundColor: colour.hex }}
                onClick={async () => {
                  await copyToClipboard(colour.hex)
                  toast.success(`${colour.hex.toUpperCase()} copied`)
                }}
              >
                <span
                  className="text-xs font-mono opacity-0 hover:opacity-100 transition-opacity"
                  style={{ color: getOptimalTextColour(colour.hex) }}
                >
                  {colour.hex.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Colour list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {colours.map((colour, index) => {
              const textColour = getOptimalTextColour(colour.hex)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                  onClick={async () => {
                    await copyToClipboard(colour.hex)
                    toast.success(`${colour.hex.toUpperCase()} copied`)
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                    style={{ backgroundColor: colour.hex, color: textColour }}
                  >
                    {colour.percentage}%
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono truncate">
                      {colour.hex.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {colour.count.toLocaleString()} pixels
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!image && !isLoading && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Upload an image to extract its dominant colours</p>
        </div>
      )}

      <CategorySelectModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        colours={colours.map((c) => c.hex)}
        title="Add Extracted Colours"
      />
    </div>
  )
}
