import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Eye,
  Sparkles,
  FileOutput,
  Contrast,
  Plus,
  Star,
  Trash2,
  Copy,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '../ui/Dropdown'
import { ConfirmModal } from '../ui/ConfirmModal'
import { useUIStore } from '../../stores/uiStore'
import { usePaletteStore } from '../../stores/paletteStore'
import { formatDate } from '../../utils/helpers'

type View = 'palette' | 'accessibility' | 'generators' | 'preview' | 'export'

const navItems: { id: View; label: string; icon: typeof Palette }[] = [
  { id: 'palette', label: 'Palette', icon: Palette },
  { id: 'accessibility', label: 'Accessibility', icon: Contrast },
  { id: 'generators', label: 'Generators', icon: Sparkles },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'export', label: 'Export', icon: FileOutput },
]

export function Sidebar() {
  const {
    sidebarOpen,
    currentView,
    requestNavigation,
    showNavDiscardConfirm,
    confirmNavigation,
    cancelNavigation,
  } = useUIStore()
  const {
    palettes,
    activePaletteId,
    setActivePalette,
    createPalette,
    deletePalette,
    duplicatePalette,
    toggleFavourite,
  } = usePaletteStore()

  const sortedPalettes = [...palettes].sort((a, b) => {
    // Favourites first
    if (a.isFavourite && !b.isFavourite) return -1
    if (!a.isFavourite && b.isFavourite) return 1
    // Then by date
    return b.updatedAt - a.updatedAt
  })

  return (
    <>
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed lg:sticky top-14 left-0 z-40
              w-[280px] h-[calc(100vh-3.5rem)]
              bg-card border-r border-border
              flex flex-col
              overflow-hidden
            `}
          >
            {/* Navigation */}
            <nav className="p-3 border-b border-border">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentView === item.id

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      onClick={() => requestNavigation(item.id)}
                      className="w-full !justify-start"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </nav>

            {/* Palettes list */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Palettes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => createPalette(`Palette ${palettes.length + 1}`)}
                  className="h-7 px-2"
                  title="Add palette"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-1">
                {sortedPalettes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No palettes yet</p>
                    <p className="text-xs mt-1">Create your first palette</p>
                  </div>
                ) : (
                  sortedPalettes.map((palette) => {
                    const isActive = palette.id === activePaletteId
                    const colourCount = palette.categories.reduce(
                      (sum, cat) => sum + cat.colours.length,
                      0
                    )

                    return (
                      <motion.div
                        key={palette.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          group relative rounded-lg p-2 cursor-pointer
                          transition-colors
                          ${isActive
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted border border-transparent'
                          }
                        `}
                        onClick={() => setActivePalette(palette.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {palette.isFavourite && (
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm truncate">
                                {palette.name}
                              </span>
                            </div>
                            <div className={`text-xs mt-0.5 ${isActive ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                              {colourCount} colours · {formatDate(palette.updatedAt)}
                            </div>
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                  title="More options"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              }
                            >
                              <DropdownItem onClick={() => toggleFavourite(palette.id)}>
                                <Star className={`h-4 w-4 ${palette.isFavourite ? 'fill-current' : ''}`} />
                                {palette.isFavourite ? 'Unfavourite' : 'Favourite'}
                              </DropdownItem>
                              <DropdownItem onClick={() => duplicatePalette(palette.id)}>
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </DropdownItem>
                              <DropdownSeparator />
                              <DropdownItem
                                destructive
                                onClick={() => deletePalette(palette.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Colour preview */}
                        {colourCount > 0 && (
                          <div className="flex gap-0.5 mt-2">
                            {palette.categories
                              .flatMap((cat) => cat.colours)
                              .slice(0, 8)
                              .map((colour) => (
                                <div
                                  key={colour.id}
                                  className="h-4 flex-1 rounded-sm first:rounded-l last:rounded-r"
                                  style={{ backgroundColor: colour.hex }}
                                />
                              ))}
                            {colourCount > 8 && (
                              <div className="h-4 flex-1 rounded-r bg-muted flex items-center justify-center">
                                <span className="text-[8px] text-muted-foreground">
                                  +{colourCount - 8}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
              Tynte v1.0.0
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>

    {/* Unsaved changes confirmation modal - outside AnimatePresence to always render */}
    <ConfirmModal
      isOpen={showNavDiscardConfirm}
      onClose={cancelNavigation}
      onConfirm={confirmNavigation}
      title="Discard unsaved changes?"
      description="You have unsaved changes that will be lost if you navigate away. Are you sure you want to continue?"
      confirmLabel="Discard Changes"
      variant="destructive"
    />
    </>
  )
}
