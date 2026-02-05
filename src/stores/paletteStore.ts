import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Palette, ColourCategory, CategoryColours } from '../types/palette'
import { Colour, Gradient } from '../types/colour'
import { generateId } from '../utils/helpers'
import { hexToRgb, hexToHsl, hexToOklch } from '../utils/colour/conversions'

interface PaletteStore {
  palettes: Palette[]
  activePaletteId: string | null

  // Palette actions
  createPalette: (name: string, description?: string) => string
  updatePalette: (id: string, updates: Partial<Omit<Palette, 'id' | 'createdAt'>>) => void
  deletePalette: (id: string) => void
  duplicatePalette: (id: string) => string
  setActivePalette: (id: string | null) => void
  toggleFavourite: (id: string) => void

  // Colour actions
  addColour: (paletteId: string, hex: string, category: ColourCategory, name?: string) => void
  updateColour: (paletteId: string, colourId: string, updates: Partial<Omit<Colour, 'id' | 'createdAt'>>) => void
  deleteColour: (paletteId: string, colourId: string) => void
  reorderColours: (paletteId: string, category: ColourCategory, oldIndex: number, newIndex: number) => void
  moveColourToCategory: (paletteId: string, colourId: string, fromCategory: ColourCategory, toCategory: ColourCategory) => void
  toggleColourLock: (paletteId: string, colourId: string) => void
  revertColour: (paletteId: string, colourId: string) => boolean

  // Gradient actions
  addGradient: (paletteId: string, gradient: Omit<Gradient, 'id' | 'createdAt'>) => void
  updateGradient: (paletteId: string, gradientId: string, updates: Partial<Omit<Gradient, 'id' | 'createdAt'>>) => void
  deleteGradient: (paletteId: string, gradientId: string) => void
  clearGradients: (paletteId: string) => void

  // Bulk actions
  addColoursToCategory: (paletteId: string, colours: (string | { hex: string; name: string })[], category: ColourCategory) => void
  clearCategory: (paletteId: string, category: ColourCategory) => void

  // Category management
  addCategory: (paletteId: string, category: ColourCategory) => void
  deleteCategory: (paletteId: string, category: ColourCategory) => void
  renameCategory: (paletteId: string, oldCategory: ColourCategory, newCategory: ColourCategory) => void

  // Getters
  getActivePalette: () => Palette | null
  getPaletteById: (id: string) => Palette | undefined
  getAllColours: (paletteId: string) => Colour[]
  getColoursByCategory: (paletteId: string, category: ColourCategory) => Colour[]
}

function createColourFromHex(hex: string, name?: string): Colour {
  const rgb = hexToRgb(hex)
  const hsl = hexToHsl(hex)
  const oklch = hexToOklch(hex)

  return {
    id: generateId(),
    hex: hex.toLowerCase(),
    rgb,
    hsl,
    oklch,
    name: name || hex.toUpperCase(),
    locked: false,
    createdAt: Date.now(),
  }
}

function createEmptyCategories(): CategoryColours[] {
  const categories: ColourCategory[] = [
    'primary',
    'secondary',
    'accent',
    'neutral',
    'success',
    'warning',
    'error',
    'info',
  ]

  return categories.map((category) => ({
    category,
    colours: [],
  }))
}

export const usePaletteStore = create<PaletteStore>()(
  persist(
    (set, get) => ({
      palettes: [],
      activePaletteId: null,

      createPalette: (name, description = '') => {
        const id = generateId()
        const now = Date.now()

        const newPalette: Palette = {
          id,
          name,
          description,
          categories: createEmptyCategories(),
          gradients: [],
          tags: [],
          createdAt: now,
          updatedAt: now,
          isFavourite: false,
        }

        set((state) => ({
          palettes: [...state.palettes, newPalette],
          activePaletteId: id,
        }))

        return id
      },

      updatePalette: (id, updates) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === id
              ? { ...palette, ...updates, updatedAt: Date.now() }
              : palette
          ),
        }))
      },

      deletePalette: (id) => {
        set((state) => ({
          palettes: state.palettes.filter((palette) => palette.id !== id),
          activePaletteId:
            state.activePaletteId === id ? null : state.activePaletteId,
        }))
      },

      duplicatePalette: (id) => {
        const palette = get().getPaletteById(id)
        if (!palette) return ''

        const newId = generateId()
        const now = Date.now()

        const duplicated: Palette = {
          ...palette,
          id: newId,
          name: `${palette.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          isFavourite: false,
          categories: palette.categories.map((cat) => ({
            ...cat,
            colours: cat.colours.map((colour) => ({
              ...colour,
              id: generateId(),
              createdAt: now,
            })),
          })),
          gradients: palette.gradients.map((gradient) => ({
            ...gradient,
            id: generateId(),
            createdAt: now,
          })),
        }

        set((state) => ({
          palettes: [...state.palettes, duplicated],
        }))

        return newId
      },

      setActivePalette: (id) => {
        set({ activePaletteId: id })
      },

      toggleFavourite: (id) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === id
              ? { ...palette, isFavourite: !palette.isFavourite, updatedAt: Date.now() }
              : palette
          ),
        }))
      },

      addColour: (paletteId, hex, category, name) => {
        const colour = createColourFromHex(hex, name)

        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            const categoryExists = palette.categories.some(
              (cat) => cat.category === category
            )

            let updatedCategories: CategoryColours[]

            if (categoryExists) {
              updatedCategories = palette.categories.map((cat) =>
                cat.category === category
                  ? { ...cat, colours: [...cat.colours, colour] }
                  : cat
              )
            } else {
              updatedCategories = [
                ...palette.categories,
                { category, colours: [colour] },
              ]
            }

            return {
              ...palette,
              categories: updatedCategories,
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      updateColour: (paletteId, colourId, updates) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            return {
              ...palette,
              categories: palette.categories.map((cat) => ({
                ...cat,
                colours: cat.colours.map((colour) => {
                  if (colour.id !== colourId) return colour

                  // Respect locked status - only allow updating the locked property itself
                  if (colour.locked && !('locked' in updates)) {
                    return colour
                  }

                  // If hex is being updated, recalculate other colour formats and save previous
                  if (updates.hex && updates.hex.toLowerCase() !== colour.hex.toLowerCase()) {
                    return {
                      ...colour,
                      ...updates,
                      previousHex: colour.hex,
                      hex: updates.hex.toLowerCase(),
                      rgb: hexToRgb(updates.hex),
                      hsl: hexToHsl(updates.hex),
                      oklch: hexToOklch(updates.hex),
                    }
                  }

                  return { ...colour, ...updates }
                }),
              })),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      deleteColour: (paletteId, colourId) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            return {
              ...palette,
              categories: palette.categories.map((cat) => ({
                ...cat,
                colours: cat.colours.filter((colour) => colour.id !== colourId),
              })),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      reorderColours: (paletteId, category, oldIndex, newIndex) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            return {
              ...palette,
              categories: palette.categories.map((cat) => {
                if (cat.category !== category) return cat

                const colours = [...cat.colours]
                const [removed] = colours.splice(oldIndex, 1)
                colours.splice(newIndex, 0, removed)

                return { ...cat, colours }
              }),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      moveColourToCategory: (paletteId, colourId, fromCategory, toCategory) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            let movedColour: Colour | null = null

            const updatedCategories = palette.categories.map((cat) => {
              if (cat.category === fromCategory) {
                movedColour = cat.colours.find((c) => c.id === colourId) || null
                return {
                  ...cat,
                  colours: cat.colours.filter((c) => c.id !== colourId),
                }
              }
              if (cat.category === toCategory && movedColour) {
                return {
                  ...cat,
                  colours: [...cat.colours, movedColour],
                }
              }
              return cat
            })

            return {
              ...palette,
              categories: updatedCategories,
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      toggleColourLock: (paletteId, colourId) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            return {
              ...palette,
              categories: palette.categories.map((cat) => ({
                ...cat,
                colours: cat.colours.map((colour) =>
                  colour.id === colourId
                    ? { ...colour, locked: !colour.locked }
                    : colour
                ),
              })),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      revertColour: (paletteId, colourId) => {
        const palette = get().getPaletteById(paletteId)
        if (!palette) return false

        let found = false
        for (const cat of palette.categories) {
          const colour = cat.colours.find((c) => c.id === colourId)
          if (colour?.previousHex) {
            found = true
            break
          }
        }

        if (!found) return false

        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            return {
              ...palette,
              categories: palette.categories.map((cat) => ({
                ...cat,
                colours: cat.colours.map((colour) => {
                  if (colour.id !== colourId || !colour.previousHex) return colour

                  const previousHex = colour.previousHex
                  return {
                    ...colour,
                    previousHex: colour.hex,
                    hex: previousHex,
                    rgb: hexToRgb(previousHex),
                    hsl: hexToHsl(previousHex),
                    oklch: hexToOklch(previousHex),
                  }
                }),
              })),
              updatedAt: Date.now(),
            }
          }),
        }))

        return true
      },

      addGradient: (paletteId, gradient) => {
        const newGradient: Gradient = {
          ...gradient,
          id: generateId(),
          createdAt: Date.now(),
        }

        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === paletteId
              ? {
                  ...palette,
                  gradients: [...palette.gradients, newGradient],
                  updatedAt: Date.now(),
                }
              : palette
          ),
        }))
      },

      updateGradient: (paletteId, gradientId, updates) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === paletteId
              ? {
                  ...palette,
                  gradients: palette.gradients.map((gradient) =>
                    gradient.id === gradientId
                      ? { ...gradient, ...updates }
                      : gradient
                  ),
                  updatedAt: Date.now(),
                }
              : palette
          ),
        }))
      },

      deleteGradient: (paletteId, gradientId) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === paletteId
              ? {
                  ...palette,
                  gradients: palette.gradients.filter(
                    (gradient) => gradient.id !== gradientId
                  ),
                  updatedAt: Date.now(),
                }
              : palette
          ),
        }))
      },

      clearGradients: (paletteId) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === paletteId
              ? {
                  ...palette,
                  gradients: [],
                  updatedAt: Date.now(),
                }
              : palette
          ),
        }))
      },

      addColoursToCategory: (paletteId, colourInputs, category) => {
        const colours = colourInputs.map((input) => {
          if (typeof input === 'string') {
            return createColourFromHex(input)
          }
          return createColourFromHex(input.hex, input.name)
        })

        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette

            const categoryExists = palette.categories.some(
              (cat) => cat.category === category
            )

            let updatedCategories: CategoryColours[]

            if (categoryExists) {
              updatedCategories = palette.categories.map((cat) =>
                cat.category === category
                  ? { ...cat, colours: [...cat.colours, ...colours] }
                  : cat
              )
            } else {
              updatedCategories = [
                ...palette.categories,
                { category, colours },
              ]
            }

            return {
              ...palette,
              categories: updatedCategories,
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      clearCategory: (paletteId, category) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === paletteId
              ? {
                  ...palette,
                  categories: palette.categories.map((cat) =>
                    cat.category === category ? { ...cat, colours: [] } : cat
                  ),
                  updatedAt: Date.now(),
                }
              : palette
          ),
        }))
      },

      addCategory: (paletteId, category) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette
            // Don't add if category already exists
            if (palette.categories.some((cat) => cat.category === category)) {
              return palette
            }
            return {
              ...palette,
              categories: [...palette.categories, { category, colours: [] }],
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      deleteCategory: (paletteId, category) => {
        set((state) => ({
          palettes: state.palettes.map((palette) =>
            palette.id === paletteId
              ? {
                  ...palette,
                  categories: palette.categories.filter((cat) => cat.category !== category),
                  updatedAt: Date.now(),
                }
              : palette
          ),
        }))
      },

      renameCategory: (paletteId, oldCategory, newCategory) => {
        set((state) => ({
          palettes: state.palettes.map((palette) => {
            if (palette.id !== paletteId) return palette
            // Don't rename if new category already exists
            if (palette.categories.some((cat) => cat.category === newCategory)) {
              return palette
            }
            return {
              ...palette,
              categories: palette.categories.map((cat) =>
                cat.category === oldCategory ? { ...cat, category: newCategory } : cat
              ),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      getActivePalette: () => {
        const { palettes, activePaletteId } = get()
        return palettes.find((p) => p.id === activePaletteId) || null
      },

      getPaletteById: (id) => {
        return get().palettes.find((p) => p.id === id)
      },

      getAllColours: (paletteId) => {
        const palette = get().getPaletteById(paletteId)
        if (!palette) return []
        return palette.categories.flatMap((cat) => cat.colours)
      },

      getColoursByCategory: (paletteId, category) => {
        const palette = get().getPaletteById(paletteId)
        if (!palette) return []
        const cat = palette.categories.find((c) => c.category === category)
        return cat?.colours || []
      },
    }),
    {
      name: 'tynte-palettes',
    }
  )
)
