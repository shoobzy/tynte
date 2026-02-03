import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Copy,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { Colour } from '../../types/colour'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useToast } from '../ui/Toast'
import { copyToClipboard } from '../../utils/helpers'
import { getOptimalTextColour } from '../../utils/colour/contrast'
import { formatRgb, formatHsl } from '../../utils/colour/conversions'

interface ColourCardProps {
  colour: Colour
  onUpdate: (updates: Partial<Omit<Colour, 'id' | 'createdAt'>>) => void
  onDelete: () => void
  onToggleLock: () => void
  showDetails?: boolean
}

export function ColourCard({
  colour,
  onUpdate,
  onDelete,
  onToggleLock,
  showDetails = true,
}: ColourCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(colour.name)
  const [editHex, setEditHex] = useState(colour.hex)
  const toast = useToast()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: colour.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const textColour = getOptimalTextColour(colour.hex)

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      toast.success(`${label} copied to clipboard`)
    } else {
      toast.error('Failed to copy')
    }
  }

  const handleSaveEdit = () => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexRegex.test(editHex)) {
      toast.error('Invalid hex colour')
      return
    }

    onUpdate({
      name: editName || editHex.toUpperCase(),
      hex: editHex.toLowerCase(),
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditName(colour.name)
    setEditHex(colour.hex)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <motion.div
        layout
        className="bg-card border border-border rounded-lg p-3 space-y-3"
      >
        <div className="flex gap-2">
          <div
            className="w-12 h-12 rounded-md border border-border flex-shrink-0"
            style={{ backgroundColor: editHex }}
          />
          <div className="flex-1 space-y-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Colour name"
              className="h-8 text-sm"
            />
            <Input
              value={editHex}
              onChange={(e) => setEditHex(e.target.value)}
              placeholder="#000000"
              className="h-8 text-sm font-mono"
              maxLength={7}
            />
          </div>
        </div>
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
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        group relative bg-card border border-border rounded-lg overflow-hidden
        ${isDragging ? 'z-50 shadow-xl' : ''}
      `}
    >
      {/* Colour swatch */}
      <div
        className="h-24 relative cursor-pointer"
        style={{ backgroundColor: colour.hex }}
        onClick={() => handleCopy(colour.hex, 'Hex')}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: `${textColour}20` }}
        >
          <GripVertical className="h-4 w-4" style={{ color: textColour }} />
        </div>

        {/* Lock indicator */}
        {colour.locked && (
          <div
            className="absolute top-2 right-2 p-1 rounded"
            style={{ backgroundColor: `${textColour}20` }}
          >
            <Lock className="h-3.5 w-3.5" style={{ color: textColour }} />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            style={{ backgroundColor: `${textColour}20`, color: textColour }}
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            title="Edit colour"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            style={{ backgroundColor: `${textColour}20`, color: textColour }}
            onClick={(e) => {
              e.stopPropagation()
              onToggleLock()
            }}
            title={colour.locked ? 'Unlock colour' : 'Lock colour'}
          >
            {colour.locked ? (
              <Unlock className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            style={{ backgroundColor: `${textColour}20`, color: textColour }}
            onClick={(e) => {
              e.stopPropagation()
              handleCopy(colour.hex, 'Hex')
            }}
            title="Copy hex"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:!bg-red-500/20"
            style={{ backgroundColor: `${textColour}20`, color: textColour }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Delete colour"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate" title={colour.name}>
              {colour.name}
            </span>
          </div>
          <div
            className="text-xs text-muted-foreground font-mono cursor-pointer hover:text-foreground"
            onClick={() => handleCopy(colour.hex, 'Hex')}
          >
            {colour.hex.toUpperCase()}
          </div>
          <div
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => handleCopy(formatRgb(colour.rgb), 'RGB')}
          >
            {formatRgb(colour.rgb)}
          </div>
          <div
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => handleCopy(formatHsl(colour.hsl), 'HSL')}
          >
            {formatHsl(colour.hsl)}
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface MiniColourCardProps {
  colour: string
  onClick?: () => void
  selected?: boolean
}

export function MiniColourCard({ colour, onClick, selected }: MiniColourCardProps) {
  const textColour = getOptimalTextColour(colour)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        w-10 h-10 rounded-lg cursor-pointer shadow-sm
        transition-all
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{ backgroundColor: colour }}
      onClick={onClick}
    >
      {selected && (
        <div className="w-full h-full flex items-center justify-center">
          <Check className="h-4 w-4" style={{ color: textColour }} />
        </div>
      )}
    </motion.div>
  )
}
