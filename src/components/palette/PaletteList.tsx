import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Plus, Star, Clock, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { usePaletteStore } from '../../stores/paletteStore'
import { formatDate } from '../../utils/helpers'

interface PaletteListProps {
  showFavouritesOnly?: boolean
}

export function PaletteList({ showFavouritesOnly = false }: PaletteListProps) {
  const {
    palettes,
    activePaletteId,
    setActivePalette,
    createPalette,
    deletePalette,
    toggleFavourite,
  } = usePaletteStore()

  const filteredPalettes = showFavouritesOnly
    ? palettes.filter((p) => p.isFavourite)
    : palettes

  const sortedPalettes = [...filteredPalettes].sort((a, b) => {
    if (a.isFavourite && !b.isFavourite) return -1
    if (!a.isFavourite && b.isFavourite) return 1
    return b.updatedAt - a.updatedAt
  })

  const handleNewPalette = () => {
    createPalette(`Palette ${palettes.length + 1}`)
  }

  if (sortedPalettes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Palette className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {showFavouritesOnly ? 'No favourite palettes' : 'No palettes yet'}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm">
          {showFavouritesOnly
            ? 'Star a palette to add it to your favourites'
            : 'Create your first palette to start building your colour system'}
        </p>
        {!showFavouritesOnly && (
          <Button onClick={handleNewPalette}>
            <Plus className="h-4 w-4 mr-2" />
            Create Palette
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          {showFavouritesOnly ? 'Favourite Palettes' : 'All Palettes'}
          <span className="ml-2 text-sm text-muted-foreground">
            ({sortedPalettes.length})
          </span>
        </h3>
        {!showFavouritesOnly && (
          <Button variant="outline" size="sm" onClick={handleNewPalette}>
            <Plus className="h-4 w-4 mr-1" />
            New Palette
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedPalettes.map((palette) => {
            const isActive = palette.id === activePaletteId
            const colourCount = palette.categories.reduce(
              (sum, cat) => sum + cat.colours.length,
              0
            )
            const allColours = palette.categories.flatMap((cat) => cat.colours)

            return (
              <motion.div
                key={palette.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                  group relative bg-card border rounded-lg overflow-hidden
                  cursor-pointer transition-all hover:shadow-md
                  ${isActive ? 'ring-2 ring-primary border-primary' : 'border-border'}
                `}
                onClick={() => setActivePalette(palette.id)}
              >
                {/* Colour preview strip */}
                <div className="h-20 flex">
                  {allColours.length > 0 ? (
                    allColours.slice(0, 10).map((colour) => (
                      <div
                        key={colour.id}
                        className="flex-1"
                        style={{ backgroundColor: colour.hex }}
                      />
                    ))
                  ) : (
                    <div className="w-full bg-muted flex items-center justify-center">
                      <Palette className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">{palette.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{colourCount} colours</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(palette.updatedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavourite(palette.id)
                        }}
                        title={palette.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            palette.isFavourite
                              ? 'fill-yellow-500 text-yellow-500'
                              : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePalette(palette.id)
                        }}
                        title="Delete palette"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {palette.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {palette.description}
                    </p>
                  )}

                  {palette.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {palette.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-xs bg-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {palette.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                          +{palette.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    Active
                  </div>
                )}

                {/* Favourite indicator */}
                {palette.isFavourite && (
                  <div className="absolute top-2 left-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
