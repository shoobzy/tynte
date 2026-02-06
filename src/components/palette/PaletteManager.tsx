import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Check,
  X,
  Shuffle,
  Palette as PaletteIcon,
  FolderPlus,
  ChevronDown,
  Trash2,
  Layers,
  Eye,
  Sparkles,
  Image,
  Download,
  ScanEye,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { ConfirmModal } from '../ui/ConfirmModal'
import { CategoryGroup } from './CategoryGroup'
import { GradientCard } from './GradientCard'
import { ColourPicker } from './ColourPicker'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import { generateCompleteRandomPalette } from '../../utils/colour/harmony'
import { ColourCategory } from '../../types/palette'
import { Dropdown } from '../ui/Dropdown'
import { getCategoryLabel, defaultCategories } from '../../data/presets'

const features = [
  {
    icon: Layers,
    title: 'Palette Organisation',
    description: 'Organise colours by category with custom groups and drag-and-drop reordering.',
    view: 'palette' as const,
  },
  {
    icon: ScanEye,
    title: 'Contrast Checker',
    description: 'Test colour combinations against WCAG AA and AAA accessibility standards.',
    view: 'accessibility' as const,
    tab: 'contrast',
  },
  {
    icon: Eye,
    title: 'Colourblind Simulation',
    description: 'Preview how your palette appears to users with 7 types of colour vision deficiency.',
    view: 'accessibility' as const,
    tab: 'colourblind',
  },
  {
    icon: Sparkles,
    title: 'Harmony Generator',
    description: 'Generate complementary, triadic, tetradic, and other colour harmonies.',
    view: 'generators' as const,
    tab: 'harmony',
  },
  {
    icon: Image,
    title: 'Image Extraction',
    description: 'Extract dominant colours from any image to build your palette.',
    view: 'generators' as const,
    tab: 'extract',
  },
  {
    icon: Download,
    title: 'Multi-format Export',
    description: 'Export to CSS custom properties, Tailwind config, or Figma design tokens.',
    view: 'export' as const,
  },
]

export function PaletteManager() {
  const {
    palettes,
    activePaletteId,
    createPalette,
    updatePalette,
    addColour,
    addColoursToCategory,
    addCategory,
    updateGradient,
    deleteGradient,
    clearGradients,
  } = usePaletteStore()

  const {
    currentView,
    setCurrentView,
    pickerOpen,
    setPickerOpen,
    pickerColour,
    setPickerColour,
    selectedCategory,
    setSelectedCategory,
    setHasUnsavedEdits,
    setAccessibilityTab,
    setGeneratorTab,
  } = useUIStore()

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [showNameDiscardConfirm, setShowNameDiscardConfirm] = useState(false)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [gradientsExpanded, setGradientsExpanded] = useState(true)
  const [showClearGradientsConfirm, setShowClearGradientsConfirm] = useState(false)

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  useEffect(() => {
    if (activePalette) {
      setEditedName(activePalette.name)
    }
  }, [activePalette])

  const hasUnsavedNameChanges = isEditingName && activePalette && editedName.trim() !== activePalette.name

  // Sync unsaved name changes state with the global UI store
  useEffect(() => {
    setHasUnsavedEdits(!!hasUnsavedNameChanges)
    return () => setHasUnsavedEdits(false) // Cleanup on unmount
  }, [hasUnsavedNameChanges, setHasUnsavedEdits])

  const handleSaveName = () => {
    if (activePalette && editedName.trim()) {
      updatePalette(activePalette.id, { name: editedName.trim() })
    }
    setIsEditingName(false)
  }

  const handleCancelNameEdit = () => {
    if (hasUnsavedNameChanges) {
      setShowNameDiscardConfirm(true)
    } else {
      discardNameChanges()
    }
  }

  const discardNameChanges = () => {
    if (activePalette) {
      setEditedName(activePalette.name)
    }
    setIsEditingName(false)
    setShowNameDiscardConfirm(false)
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

  const handleFeatureClick = (feature: typeof features[number]) => {
    // Create a palette first if needed
    if (!activePalette) {
      const paletteId = createPalette('My Palette')
      const palette = generateCompleteRandomPalette()
      Object.entries(palette).forEach(([category, colours]) => {
        addColoursToCategory(paletteId, colours, category as ColourCategory)
      })
    }

    // Navigate to the feature (skip if it's the palette view since we're already there)
    if (feature.view !== 'palette') {
      setCurrentView(feature.view)
      if (feature.tab) {
        if (feature.view === 'accessibility') {
          setAccessibilityTab(feature.tab as 'contrast' | 'matrix' | 'colourblind' | 'report')
        } else if (feature.view === 'generators') {
          setGeneratorTab(feature.tab as 'harmony' | 'scale' | 'gradient' | 'extract')
        }
      }
    }
  }

  // Get all categories (default + custom from the palette)
  const allCategories = activePalette
    ? [...new Set([...defaultCategories, ...activePalette.categories.map((c) => c.category)])]
    : defaultCategories

  const categoryOptions = allCategories.map((cat) => ({
    value: cat,
    label: getCategoryLabel(cat),
  }))

  // No active palette - show welcome state
  if (!activePalette) {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <PaletteIcon className="h-14 w-14 text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-3">Welcome to Tynte</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-lg">
            A professional colour palette generator for designers and developers.
            Build accessible, beautiful colour systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={() => createPalette('My First Palette')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Palette
            </Button>
            <Button
              variant="outline"
              size="lg"
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

        {/* Features Section */}
        <div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">What you can do</h3>
            <p className="text-muted-foreground">
              Everything you need to create and validate your colour palette
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <button
                key={feature.title}
                className="group p-5 rounded-lg border border-border bg-card text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
                onClick={() => handleFeatureClick(feature)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-primary/10 text-primary dark:text-violet-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
              <Button variant="ghost" size="icon" onClick={handleSaveName} title="Save" aria-label="Save palette name">
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelNameEdit}
                title="Cancel"
                aria-label="Cancel editing"
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

        {/* Gradients Section */}
        {activePalette.gradients.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-muted/50 cursor-pointer"
              onClick={() => setGradientsExpanded(!gradientsExpanded)}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: gradientsExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
                <span className="font-medium">Gradients</span>
                <span className="text-sm text-muted-foreground">
                  ({activePalette.gradients.length})
                </span>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearGradientsConfirm(true)}
                  className="text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Gradients */}
            <AnimatePresence>
              {gradientsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {activePalette.gradients.map((gradient) => (
                        <GradientCard
                          key={gradient.id}
                          gradient={gradient}
                          onUpdate={(updates) =>
                            updateGradient(activePalette.id, gradient.id, updates)
                          }
                          onDelete={() => deleteGradient(activePalette.id, gradient.id)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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
          <div>
            <label className="block text-sm font-medium mb-2">Group</label>
            <Dropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value as ColourCategory)}
              className="w-full"
            />
          </div>

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

      {/* Clear Gradients Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearGradientsConfirm}
        onClose={() => setShowClearGradientsConfirm(false)}
        onConfirm={() => clearGradients(activePalette?.id || '')}
        title="Clear all gradients?"
        description={`This will remove all ${activePalette?.gradients.length || 0} gradient${(activePalette?.gradients.length || 0) !== 1 ? 's' : ''} from this palette. This action cannot be undone.`}
        confirmLabel="Clear All"
        variant="destructive"
      />

      {/* Discard Name Changes Confirmation Modal */}
      <ConfirmModal
        isOpen={showNameDiscardConfirm}
        onClose={() => setShowNameDiscardConfirm(false)}
        onConfirm={discardNameChanges}
        title="Discard changes?"
        description="You have unsaved changes to the palette name. Are you sure you want to discard them?"
        confirmLabel="Discard"
        variant="destructive"
      />
    </div>
  )
}
