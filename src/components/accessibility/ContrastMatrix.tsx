import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, ChevronDown, RefreshCw, Type, Square, Layers } from 'lucide-react'
import { Button } from '../ui/Button'
import { usePaletteStore } from '../../stores/paletteStore'
import { useUIStore } from '../../stores/uiStore'
import { useToast } from '../ui/Toast'
import {
  getContrastRatioFromHex,
  getWCAGLevel,
} from '../../utils/colour/contrast'
import { ColourRole } from '../../types/colour'

export function ContrastMatrix() {
  const { palettes, activePaletteId, updateColour } = usePaletteStore()
  const { setContrastColours, setAccessibilityTab } = useUIStore()
  const toast = useToast()

  const activePalette = palettes.find((p) => p.id === activePaletteId)
  const allColours = activePalette?.categories.flatMap((cat) => cat.colours) || []
  const categoriesWithColours = activePalette?.categories.filter((cat) => cat.colours.length > 0) || []

  // Separate colours by role
  const textColours = allColours.filter((c) => c.role === 'text' || c.role === 'both')
  const backgroundColours = allColours.filter((c) => c.role === 'background' || c.role === 'both')

  const hasRolesAssigned = textColours.length > 0 && backgroundColours.length > 0

  const handleCellClick = (foreground: string, background: string) => {
    setContrastColours(foreground, background)
    setAccessibilityTab('contrast')
  }

  const handleUpdateColour = (colourId: string, newHex: string) => {
    if (activePaletteId) {
      updateColour(activePaletteId, colourId, { hex: newHex })
      toast.success('Colour updated')
    }
  }

  const handleSetRole = (colourId: string, role: ColourRole | undefined) => {
    if (activePaletteId) {
      updateColour(activePaletteId, colourId, { role })
    }
  }

  if (allColours.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Add colours to your palette to see the contrast matrix</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role assignment section */}
      <RoleAssignmentSection
        categoriesWithColours={categoriesWithColours}
        onSetRole={handleSetRole}
        activePaletteId={activePaletteId}
      />

      {/* Show contrast analysis if roles are assigned */}
      {hasRolesAssigned ? (
        <RoleBasedContrastView
          textColours={textColours}
          backgroundColours={backgroundColours}
          onCellClick={handleCellClick}
          onUpdateColour={handleUpdateColour}
        />
      ) : (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
          <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Assign at least one <strong>text colour</strong> and one <strong>background colour</strong> above to see contrast analysis.
          </p>
        </div>
      )}
    </div>
  )
}

interface RoleAssignmentSectionProps {
  categoriesWithColours: { category: string; colours: { id: string; hex: string; name: string; role?: ColourRole }[] }[]
  onSetRole: (colourId: string, role: ColourRole | undefined) => void
  activePaletteId: string | null
}

function RoleAssignmentSection({ categoriesWithColours, onSetRole }: RoleAssignmentSectionProps) {
  const [expanded, setExpanded] = useState(true)

  // Flatten all colours for the role sections
  const allColours = categoriesWithColours.flatMap((cat) => cat.colours)

  // Handle toggling a colour in a section
  // - Clicking Text: toggle text role (can be combined with background → 'both')
  // - Clicking Background: toggle background role (can be combined with text → 'both')
  const handleToggleRole = (colourId: string, toggleRole: 'text' | 'background', currentRole?: ColourRole) => {
    const isText = currentRole === 'text' || currentRole === 'both'
    const isBackground = currentRole === 'background' || currentRole === 'both'

    let newRole: ColourRole | undefined

    if (toggleRole === 'text') {
      if (isText) {
        // Remove text role
        newRole = isBackground ? 'background' : undefined
      } else {
        // Add text role
        newRole = isBackground ? 'both' : 'text'
      }
    } else {
      if (isBackground) {
        // Remove background role
        newRole = isText ? 'text' : undefined
      } else {
        // Add background role
        newRole = isText ? 'both' : 'background'
      }
    }

    onSetRole(colourId, newRole)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Assign Colour Roles</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-t border-border space-y-4">
              <p className="text-sm text-muted-foreground">
                Click colours to mark them as text or background. Colours can be selected in both sections if they serve multiple purposes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Text Colours Section */}
                <RoleSection
                  title="Text Colours"
                  icon={<Type className="h-4 w-4" />}
                  targetRole="text"
                  colours={allColours}
                  accentColour="blue"
                  onToggle={handleToggleRole}
                />

                {/* Background Colours Section */}
                <RoleSection
                  title="Background Colours"
                  icon={<Square className="h-4 w-4" />}
                  targetRole="background"
                  colours={allColours}
                  accentColour="orange"
                  onToggle={handleToggleRole}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface RoleSectionProps {
  title: string
  icon: React.ReactNode
  targetRole: 'text' | 'background'
  colours: { id: string; hex: string; name: string; role?: ColourRole }[]
  accentColour: 'blue' | 'orange'
  onToggle: (colourId: string, toggleRole: 'text' | 'background', currentRole?: ColourRole) => void
}

function RoleSection({ title, icon, targetRole, colours, accentColour, onToggle }: RoleSectionProps) {
  // Count colours that have this role (including 'both')
  const selectedCount = colours.filter((c) =>
    c.role === targetRole || c.role === 'both'
  ).length

  const isSelected = (role?: ColourRole) => {
    if (targetRole === 'text') {
      return role === 'text' || role === 'both'
    } else {
      return role === 'background' || role === 'both'
    }
  }

  const getBorderClass = () => {
    return accentColour === 'blue' ? 'border-blue-500' : 'border-orange-500'
  }

  const getHeaderBgClass = () => {
    return accentColour === 'blue'
      ? 'bg-blue-50 dark:bg-blue-900/20'
      : 'bg-orange-50 dark:bg-orange-900/20'
  }

  const getIconClass = () => {
    return accentColour === 'blue'
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-orange-600 dark:text-orange-400'
  }

  const getRingClass = () => {
    return accentColour === 'blue'
      ? 'ring-2 ring-blue-500 ring-offset-2'
      : 'ring-2 ring-orange-500 ring-offset-2'
  }

  return (
    <div className={`border-2 ${getBorderClass()} rounded-lg overflow-hidden`}>
      <div className={`px-3 py-2 ${getHeaderBgClass()} border-b ${getBorderClass()}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${getIconClass()}`}>
            {icon}
            <span className="font-medium text-sm">{title}</span>
          </div>
          {selectedCount > 0 && (
            <span className={`text-xs font-medium ${getIconClass()}`}>
              {selectedCount} selected
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {colours.map((colour) => {
            const selected = isSelected(colour.role)

            return (
              <button
                key={colour.id}
                onClick={() => onToggle(colour.id, targetRole, colour.role)}
                className={`
                  w-8 h-8 rounded-md transition-all hover:scale-110
                  ${selected ? getRingClass() : 'border border-border'}
                `}
                style={{ backgroundColor: colour.hex }}
                title={`${colour.name}${selected ? ' (selected)' : ''}`}
              />
            )
          })}
        </div>
        {colours.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No colours in palette
          </p>
        )}
      </div>
    </div>
  )
}

interface RoleBasedContrastViewProps {
  textColours: { id: string; hex: string; name: string; role?: ColourRole }[]
  backgroundColours: { id: string; hex: string; name: string; role?: ColourRole }[]
  onCellClick: (foreground: string, background: string) => void
  onUpdateColour: (colourId: string, newHex: string) => void
}

function RoleBasedContrastView({
  textColours,
  backgroundColours,
  onCellClick,
  onUpdateColour,
}: RoleBasedContrastViewProps) {
  // Calculate all text vs background combinations
  const pairs = useMemo(() => {
    const results: {
      text: typeof textColours[0]
      background: typeof backgroundColours[0]
      ratio: number
      level: string
    }[] = []

    for (const text of textColours) {
      for (const bg of backgroundColours) {
        if (text.id === bg.id) continue // Skip same colour
        const ratio = getContrastRatioFromHex(text.hex, bg.hex)
        const level = getWCAGLevel(ratio)
        results.push({ text, background: bg, ratio, level })
      }
    }

    return results.sort((a, b) => a.ratio - b.ratio)
  }, [textColours, backgroundColours])

  const failingPairs = pairs.filter((p) => p.level === 'Fail' || p.level === 'AA Large')
  const passingPairs = pairs.filter((p) => p.level === 'AA' || p.level === 'AAA')

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {textColours.length}
          </div>
          <div className="text-xs text-muted-foreground">Text colours</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {backgroundColours.length}
          </div>
          <div className="text-xs text-muted-foreground">Background colours</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold">{pairs.length}</div>
          <div className="text-xs text-muted-foreground">Combinations</div>
        </div>
        <div className="text-center flex-1">
          <div className={`text-2xl font-bold ${failingPairs.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {passingPairs.length}/{pairs.length}
          </div>
          <div className="text-xs text-muted-foreground">Pass WCAG AA</div>
        </div>
      </div>

      {/* Failing pairs */}
      {failingPairs.length > 0 && (
        <div>
          <h4 className="font-medium text-red-600 dark:text-red-500 mb-3 flex items-center gap-2">
            <X className="h-4 w-4" />
            Low Contrast Combinations ({failingPairs.length})
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            These text/background combinations don't meet WCAG AA (4.5:1). Expand to see fix suggestions.
          </p>
          <div className="space-y-2">
            {failingPairs.map((pair) => (
              <TextBgPairCard
                key={`${pair.text.id}-${pair.background.id}`}
                pair={pair}
                availableTextColours={textColours}
                availableBackgroundColours={backgroundColours}
                onClick={() => onCellClick(pair.text.hex, pair.background.hex)}
                onUpdateColour={onUpdateColour}
              />
            ))}
          </div>
        </div>
      )}

      {/* Passing pairs */}
      {passingPairs.length > 0 && (
        <div>
          <h4 className="font-medium text-green-600 dark:text-green-500 mb-3 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Accessible Combinations ({passingPairs.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {passingPairs.map((pair) => (
              <div
                key={`${pair.text.id}-${pair.background.id}`}
                className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => onCellClick(pair.text.hex, pair.background.hex)}
              >
                <div
                  className="flex-1 px-3 py-1.5 rounded text-sm font-medium text-center"
                  style={{ backgroundColor: pair.background.hex, color: pair.text.hex }}
                >
                  Aa
                </div>
                <div className="text-xs text-muted-foreground">
                  {pair.ratio.toFixed(1)}:1
                </div>
                <div className={`text-xs px-1.5 py-0.5 rounded ${
                  pair.level === 'AAA'
                    ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-white'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-white'
                }`}>
                  {pair.level}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pairs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No valid combinations to check (text and background colours are the same)</p>
        </div>
      )}
    </div>
  )
}

interface TextBgPairCardProps {
  pair: {
    text: { id: string; hex: string; name: string }
    background: { id: string; hex: string; name: string }
    ratio: number
    level: string
  }
  availableTextColours: { id: string; hex: string; name: string }[]
  availableBackgroundColours: { id: string; hex: string; name: string }[]
  onClick: () => void
  onUpdateColour: (colourId: string, newHex: string) => void
}

function TextBgPairCard({
  pair,
  availableTextColours,
  availableBackgroundColours,
  onClick,
  onUpdateColour,
}: TextBgPairCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [selectedBgId, setSelectedBgId] = useState<string | null>(null)

  // Find existing text colours that would pass contrast with the current background
  const passingTextColours = useMemo(() => {
    return availableTextColours
      .filter((c) => c.id !== pair.text.id) // Exclude current text colour
      .map((colour) => {
        const ratio = getContrastRatioFromHex(colour.hex, pair.background.hex)
        const level = getWCAGLevel(ratio)
        return { ...colour, ratio, level, passes: level === 'AA' || level === 'AAA' }
      })
      .filter((c) => c.passes)
      .sort((a, b) => b.ratio - a.ratio) // Sort by contrast ratio, highest first
  }, [availableTextColours, pair.text.id, pair.background.hex])

  // Find existing background colours that would pass contrast with the current text
  const passingBgColours = useMemo(() => {
    return availableBackgroundColours
      .filter((c) => c.id !== pair.background.id) // Exclude current background colour
      .map((colour) => {
        const ratio = getContrastRatioFromHex(pair.text.hex, colour.hex)
        const level = getWCAGLevel(ratio)
        return { ...colour, ratio, level, passes: level === 'AA' || level === 'AAA' }
      })
      .filter((c) => c.passes)
      .sort((a, b) => b.ratio - a.ratio) // Sort by contrast ratio, highest first
  }, [availableBackgroundColours, pair.background.id, pair.text.hex])

  const selectedText = selectedTextId
    ? passingTextColours.find((c) => c.id === selectedTextId)
    : passingTextColours[0]

  const selectedBg = selectedBgId
    ? passingBgColours.find((c) => c.id === selectedBgId)
    : passingBgColours[0]

  const handleApplyTextFix = () => {
    if (selectedText) {
      onUpdateColour(pair.text.id, selectedText.hex)
      setExpanded(false)
    }
  }

  const handleApplyBgFix = () => {
    if (selectedBg) {
      onUpdateColour(pair.background.id, selectedBg.hex)
      setExpanded(false)
    }
  }

  return (
    <div className="border-2 border-red-500 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Preview with labels */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-16 h-10 rounded flex items-center justify-center text-sm font-bold relative"
            style={{ backgroundColor: pair.background.hex, color: pair.text.hex }}
          >
            Aa
          </div>
          <div className="flex gap-1 text-[9px]">
            <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
              <Type className="h-2.5 w-2.5" />
              Text
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
              <Square className="h-2.5 w-2.5" />
              Bg
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <span className="font-medium text-blue-600 dark:text-blue-400">{pair.text.name}</span>
            <span className="text-muted-foreground"> on </span>
            <span className="font-medium text-orange-600 dark:text-orange-400">{pair.background.name}</span>
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            {pair.ratio.toFixed(2)}:1 · Fails WCAG AA (needs 4.5:1)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            Details
          </Button>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            key={`fix-${pair.text.id}-${pair.background.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 border-t border-border bg-muted/30 space-y-4">
              {/* Replace text colour section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Type className="h-4 w-4" />
                  Replace text colour
                </div>
                {passingTextColours.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {passingTextColours.map((colour) => (
                        <button
                          key={colour.id}
                          onClick={() => setSelectedTextId(colour.id)}
                          className={`
                            flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all
                            ${selectedText?.id === colour.id
                              ? 'border-primary bg-primary/10 ring-1 ring-primary'
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <div
                            className="w-5 h-5 rounded border border-border"
                            style={{ backgroundColor: colour.hex }}
                          />
                          <span className="text-xs font-medium">{colour.name}</span>
                          <span className="text-[10px] text-green-600 dark:text-green-400">
                            {colour.ratio.toFixed(1)}:1
                          </span>
                        </button>
                      ))}
                    </div>
                    {selectedText && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border">
                        <span className="text-xs text-muted-foreground">Preview:</span>
                        <div
                          className="flex-1 px-3 py-2 rounded text-sm font-medium text-center"
                          style={{ backgroundColor: pair.background.hex, color: selectedText.hex }}
                        >
                          Sample Text
                        </div>
                        <Button size="sm" onClick={handleApplyTextFix}>
                          <RefreshCw className="h-3 w-3 mr-1.5" />
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No existing text colours pass contrast with this background
                  </p>
                )}
              </div>

              {/* Replace background colour section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                  <Square className="h-4 w-4" />
                  Replace background colour
                </div>
                {passingBgColours.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {passingBgColours.map((colour) => (
                        <button
                          key={colour.id}
                          onClick={() => setSelectedBgId(colour.id)}
                          className={`
                            flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all
                            ${selectedBg?.id === colour.id
                              ? 'border-primary bg-primary/10 ring-1 ring-primary'
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <div
                            className="w-5 h-5 rounded border border-border"
                            style={{ backgroundColor: colour.hex }}
                          />
                          <span className="text-xs font-medium">{colour.name}</span>
                          <span className="text-[10px] text-green-600 dark:text-green-400">
                            {colour.ratio.toFixed(1)}:1
                          </span>
                        </button>
                      ))}
                    </div>
                    {selectedBg && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border">
                        <span className="text-xs text-muted-foreground">Preview:</span>
                        <div
                          className="flex-1 px-3 py-2 rounded text-sm font-medium text-center"
                          style={{ backgroundColor: selectedBg.hex, color: pair.text.hex }}
                        >
                          Sample Text
                        </div>
                        <Button size="sm" onClick={handleApplyBgFix}>
                          <RefreshCw className="h-3 w-3 mr-1.5" />
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No existing background colours pass contrast with this text
                  </p>
                )}
              </div>

              {passingTextColours.length === 0 && passingBgColours.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Consider adding more colours to your palette with better contrast options.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
