import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Check, X, Shuffle, Palette as PaletteIcon, FolderPlus } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { CategoryGroup } from './CategoryGroup'
import { ColourPicker } from './ColourPicker'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import { generateCompleteRandomPalette } from '../../utils/colour/harmony'
import { ColourCategory } from '../../types/palette'
import { Dropdown } from '../ui/Dropdown'
import { getCategoryLabel, defaultCategories } from '../../data/presets'

export function PaletteManager() {
  const {
    palettes,
    activePaletteId,
    createPalette,
    updatePalette,
    addColour,
    addColoursToCategory,
    addCategory,
  } = usePaletteStore()

  const {
    currentView,
    pickerOpen,
    setPickerOpen,
    pickerColour,
    setPickerColour,
    selectedCategory,
    setSelectedCategory,
  } = useUIStore()

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  useEffect(() => {
    if (activePalette) {
      setEditedName(activePalette.name)
    }
  }, [activePalette])

  const handleSaveName = () => {
    if (activePalette && editedName.trim()) {
      updatePalette(activePalette.id, { name: editedName.trim() })
    }
    setIsEditingName(false)
  }

  const handleAddColour = (hex: string, category: ColourCategory) => {
    if (activePalette) {
      addColour(activePalette.id, hex, category)
      setPickerOpen(false)
    }
  }

  const handleGenerateRandom = () => {
    if (!activePalette) return

    const palette = generateCompleteRandomPalette()
    Object.entries(palette).forEach(([category, colours]) => {
      addColoursToCategory(activePalette.id, colours, category as ColourCategory)
    })
  }

  const handleAddCategory = () => {
    if (!activePalette || !newCategoryName.trim()) return

    // Convert to lowercase kebab-case for the category key
    const categoryKey = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-')
    addCategory(activePalette.id, categoryKey)
    setNewCategoryName('')
    setAddCategoryOpen(false)
  }

  if (currentView !== 'palette') {
    return null
  }

  // No active palette - show create prompt
  if (!activePalette) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PaletteIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to Tynte</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first colour palette to start building your design system
        </p>
        <div className="flex gap-3">
          <Button onClick={() => createPalette('My First Palette')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Palette
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const id = createPalette('Random Palette')
              const palette = generateCompleteRandomPalette()
              Object.entries(palette).forEach(([category, colours]) => {
                addColoursToCategory(id, colours, category as ColourCategory)
              })
            }}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Generate Random
          </Button>
        </div>
      </div>
    )
  }

  // Get all categories (default + custom from the palette)
  const allCategories = activePalette
    ? [...new Set([...defaultCategories, ...activePalette.categories.map((c) => c.category)])]
    : defaultCategories

  const categoryOptions = allCategories.map((cat) => ({
    value: cat,
    label: getCategoryLabel(cat),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="h-9 w-64"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSaveName} title="Save">
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingName(false)}
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{activePalette.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingName(true)}
                className="h-8 w-8"
                title="Edit palette name"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerateRandom}>
            <Shuffle className="h-4 w-4 mr-2" />
            Random
          </Button>
          <Button variant="outline" onClick={() => setAddCategoryOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Colour
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <AnimatePresence>
          {activePalette.categories.map((category) => (
            <motion.div
              key={category.category}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CategoryGroup
                category={category}
                paletteId={activePalette.id}
                isCustom={!defaultCategories.includes(category.category as typeof defaultCategories[number])}
                onAddColour={() => {
                  setSelectedCategory(category.category)
                  setPickerOpen(true)
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Group Button */}
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setAddCategoryOpen(true)}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {/* Colour Picker Modal */}
      <Modal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add Colour"
        size="lg"
      >
        <div className="space-y-4">
          <Dropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value as ColourCategory)}
            className="w-full"
          />

          <ColourPicker
            value={pickerColour}
            onChange={setPickerColour}
            onAddToPalette={handleAddColour}
          />
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={addCategoryOpen}
        onClose={() => {
          setAddCategoryOpen(false)
          setNewCategoryName('')
        }}
        title="Add Group"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Group Name</label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="e.g., Brand, Charts, Gradients"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              This will create a new swatch group for organising your colours.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setAddCategoryOpen(false)
                setNewCategoryName('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
