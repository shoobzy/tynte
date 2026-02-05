import { Colour, Gradient } from './colour'

// Built-in category types
export type BuiltInCategory =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

// Allow both built-in and custom string categories
export type ColourCategory = BuiltInCategory | (string & {})

export interface ColourScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface CategoryColours {
  category: ColourCategory
  colours: Colour[]
}

export interface Palette {
  id: string
  name: string
  description: string
  categories: CategoryColours[]
  gradients: Gradient[]
  tags: string[]
  createdAt: number
  updatedAt: number
  isFavourite: boolean
  // Reviewed accessibility warnings (format: "contrast:textId:bgId:cvdType" or "distinguish:id1:id2:cvdType")
  reviewedWarnings?: string[]
}

export interface PalettePreset {
  id: string
  name: string
  description: string
  colours: {
    category: ColourCategory
    hexValues: string[]
  }[]
}
