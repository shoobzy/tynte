import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronDown, Plus, Trash2, FolderX } from 'lucide-react'
import { ColourCard } from './ColourCard'
import { Button } from '../ui/Button'
import { ConfirmModal } from '../ui/ConfirmModal'
import { CategoryColours } from '../../types/palette'
import { getCategoryLabel } from '../../data/presets'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'

interface CategoryGroupProps {
  category: CategoryColours
  paletteId: string
  isCustom?: boolean
  onAddColour: () => void
}

export function CategoryGroup({
  category,
  paletteId,
  isCustom = false,
  onAddColour,
}: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const {
    updateColour,
    deleteColour,
    toggleColourLock,
    reorderColours,
    clearCategory,
    deleteCategory,
    revertColour,
  } = usePaletteStore()
  const { setSelectedCategory, setPickerOpen } = useUIStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = category.colours.findIndex((c) => c.id === active.id)
      const newIndex = category.colours.findIndex((c) => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderColours(paletteId, category.category, oldIndex, newIndex)
      }
    }
  }

  const handleAddColour = () => {
    setSelectedCategory(category.category)
    setPickerOpen(true)
    onAddColour()
  }

  const hasColours = category.colours.length > 0

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
          <span className="font-medium">
            {getCategoryLabel(category.category)}
          </span>
          {isCustom && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Custom
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            ({category.colours.length})
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={handleAddColour}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
          {hasColours && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
          {isCustom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <FolderX className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Colours */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              {hasColours ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={category.colours.map((c) => c.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {category.colours.map((colour) => (
                        <ColourCard
                          key={colour.id}
                          colour={colour}
                          onUpdate={(updates) =>
                            updateColour(paletteId, colour.id, updates)
                          }
                          onDelete={() => deleteColour(paletteId, colour.id)}
                          onToggleLock={() =>
                            toggleColourLock(paletteId, colour.id)
                          }
                          onRevert={() => revertColour(paletteId, colour.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No colours in this category</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddColour}
                    className="mt-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Colour
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => clearCategory(paletteId, category.category)}
        title={`Clear ${getCategoryLabel(category.category)}?`}
        description={`This will remove all ${category.colours.length} colour${category.colours.length !== 1 ? 's' : ''} from this group. This action cannot be undone.`}
        confirmLabel="Clear All"
        variant="destructive"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteCategory(paletteId, category.category)}
        title={`Delete ${getCategoryLabel(category.category)}?`}
        description={`This will permanently delete this group${hasColours ? ` and all ${category.colours.length} colour${category.colours.length !== 1 ? 's' : ''} in it` : ''}. This action cannot be undone.`}
        confirmLabel="Delete Group"
        variant="destructive"
      />
    </div>
  )
}
