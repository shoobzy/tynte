import { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ColourCategory } from '../../types/palette'
import { defaultCategories, getCategoryLabel } from '../../data/presets'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { usePaletteStore } from '../../stores/paletteStore'

interface CategorySelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (category: ColourCategory) => void
  colours: string[]
  title?: string
}

export function CategorySelectModal({
  isOpen,
  onClose,
  onSelect,
  colours,
  title = 'Add to Palette',
}: CategorySelectModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ColourCategory>('primary')
  const { palettes, activePaletteId } = usePaletteStore()

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  // Combine default categories with any custom categories from the active palette
  const allCategories = useMemo(() => {
    const categories = [...defaultCategories] as ColourCategory[]

    if (activePalette) {
      activePalette.categories.forEach((cat) => {
        if (!categories.includes(cat.category)) {
          categories.push(cat.category)
        }
      })
    }

    return categories
  }, [activePalette])

  const handleConfirm = () => {
    onSelect(selectedCategory)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {/* Preview of colours being added */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Colours to add ({colours.length})
          </label>
          <div className="flex gap-1 flex-wrap">
            {colours.slice(0, 12).map((colour, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-[10px] font-mono"
                style={{
                  backgroundColor: colour,
                  color: getOptimalTextColour(colour),
                }}
                title={colour}
              >
                {index + 1}
              </div>
            ))}
            {colours.length > 12 && (
              <div className="w-8 h-8 rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{colours.length - 12}
              </div>
            )}
          </div>
        </div>

        {/* Category selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Select group
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${selectedCategory === category
                    ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                  }
                `}
              >
                <span className="text-sm font-medium">
                  {getCategoryLabel(category)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Add to {getCategoryLabel(selectedCategory)}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
