import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Trash2, Pencil, Check, X } from 'lucide-react'
import { Gradient } from '../../types/colour'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ConfirmModal } from '../ui/ConfirmModal'
import { useToast } from '../ui/Toast'
import { useUIStore } from '../../stores/uiStore'
import { copyToClipboard } from '../../utils/helpers'

interface GradientCardProps {
  gradient: Gradient
  onUpdate: (updates: Partial<Omit<Gradient, 'id' | 'createdAt'>>) => void
  onDelete: () => void
}

function generateCSSGradient(gradient: Gradient): string {
  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position)
  const stopsString = sortedStops
    .map((stop) => `${stop.colour} ${stop.position}%`)
    .join(', ')

  switch (gradient.type) {
    case 'linear':
      return `linear-gradient(${gradient.angle}deg, ${stopsString})`
    case 'radial':
      return `radial-gradient(circle, ${stopsString})`
    case 'conic':
      return `conic-gradient(from ${gradient.angle}deg, ${stopsString})`
    default:
      return `linear-gradient(${gradient.angle}deg, ${stopsString})`
  }
}

export function GradientCard({ gradient, onUpdate, onDelete }: GradientCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(gradient.name)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const toast = useToast()
  const setHasUnsavedEdits = useUIStore((state) => state.setHasUnsavedEdits)

  const cssGradient = generateCSSGradient(gradient)
  const hasUnsavedChanges = isEditing && editName !== gradient.name

  // Sync unsaved changes state with the global UI store
  useEffect(() => {
    setHasUnsavedEdits(hasUnsavedChanges)
    return () => setHasUnsavedEdits(false) // Cleanup on unmount
  }, [hasUnsavedChanges, setHasUnsavedEdits])

  const handleCopy = async () => {
    const success = await copyToClipboard(cssGradient)
    if (success) {
      toast.success('CSS copied to clipboard')
    }
  }

  const handleSaveEdit = () => {
    onUpdate({ name: editName || 'Untitled Gradient' })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true)
    } else {
      discardChanges()
    }
  }

  const discardChanges = () => {
    setEditName(gradient.name)
    setIsEditing(false)
    setShowDiscardConfirm(false)
  }

  if (isEditing) {
    return (
      <>
        <motion.div
          layout
          className="bg-card border border-border rounded-lg p-3 space-y-3"
        >
          <div
            className="h-16 rounded-md border border-border"
            style={{ background: cssGradient }}
          />
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Gradient name"
            className="text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </motion.div>

        <ConfirmModal
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          onConfirm={discardChanges}
          title="Discard changes?"
          description="You have unsaved changes to this gradient name. Are you sure you want to discard them?"
          confirmLabel="Discard"
          variant="destructive"
        />
      </>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Gradient preview */}
      <div
        className="h-24 relative cursor-pointer"
        style={{ background: cssGradient }}
        onClick={handleCopy}
      >
        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-black/20 text-white hover:bg-black/40"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            title="Edit gradient"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-black/20 text-white hover:bg-black/40"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            title="Copy CSS"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-black/20 text-white hover:bg-red-500/60"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Delete gradient"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate" title={gradient.name}>
            {gradient.name}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {gradient.type}
          </span>
        </div>

        {/* Colour stops with hex values */}
        <div className="grid grid-cols-4 gap-1">
          {gradient.stops
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((stop, index) => (
              <div
                key={index}
                className="flex flex-col items-start cursor-pointer"
                title={`${stop.colour} at ${stop.position}%`}
                onClick={() => {
                  copyToClipboard(stop.colour)
                  toast.success(`${stop.colour.toUpperCase()} copied`)
                }}
              >
                <div
                  className="w-full h-5 rounded-sm"
                  style={{ backgroundColor: stop.colour }}
                />
                <span className="text-[9px] font-mono text-muted-foreground mt-1 hover:text-foreground">
                  {stop.colour.toUpperCase()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  )
}
