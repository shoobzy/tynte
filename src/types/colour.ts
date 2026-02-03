export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface HSV {
  h: number
  s: number
  v: number
}

export interface OKLCH {
  l: number
  c: number
  h: number
}

export interface LAB {
  l: number
  a: number
  b: number
}

export interface CMYK {
  c: number
  m: number
  y: number
  k: number
}

export type ColourFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'oklch' | 'lab' | 'cmyk'

export type ColourRole = 'text' | 'background' | 'both'

export interface Colour {
  id: string
  hex: string
  rgb: RGB
  hsl: HSL
  oklch: OKLCH
  name: string
  locked: boolean
  role?: ColourRole
  createdAt: number
}

export interface ColourStop {
  colour: string
  position: number
}

export interface Gradient {
  id: string
  name: string
  type: 'linear' | 'radial' | 'conic'
  angle: number
  stops: ColourStop[]
  createdAt: number
}

export type ColourHarmony =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'square'
  | 'monochromatic'

export type ColourblindType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly'

export interface ContrastResult {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
  wcagAALarge: boolean
  wcagAAALarge: boolean
}

export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail'
