import { RGB, ColourblindType } from '../../types/colour'
import { hexToRgb, rgbToHex, hexToHsl, hslToHex } from './conversions'
import { getContrastRatioFromHex } from './contrast'

/**
 * Simple LRU cache for colour simulations
 * Caches simulation results to avoid recalculating the same colours
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private readonly maxSize: number

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined
    // Move to end (most recently used)
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Delete oldest entry (first item in map)
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  get size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
  }
}

// Cache for CVD simulations - key format: "hex:type"
const simulationCache = new LRUCache<string, string>(500)

/**
 * Transformation matrices for different types of colour blindness
 * Based on research by Machado, Oliveira, and Fernandes (2009)
 */
const colourblindMatrices: Record<ColourblindType, number[][]> = {
  // Protanopia (red-blind) - complete
  protanopia: [
    [0.56667, 0.43333, 0.00000],
    [0.55833, 0.44167, 0.00000],
    [0.00000, 0.24167, 0.75833],
  ],

  // Deuteranopia (green-blind) - complete
  deuteranopia: [
    [0.62500, 0.37500, 0.00000],
    [0.70000, 0.30000, 0.00000],
    [0.00000, 0.30000, 0.70000],
  ],

  // Tritanopia (blue-blind) - complete
  tritanopia: [
    [0.95000, 0.05000, 0.00000],
    [0.00000, 0.43333, 0.56667],
    [0.00000, 0.47500, 0.52500],
  ],

  // Achromatopsia (complete colour blindness)
  achromatopsia: [
    [0.21260, 0.71520, 0.07220],
    [0.21260, 0.71520, 0.07220],
    [0.21260, 0.71520, 0.07220],
  ],

  // Protanomaly (red-weak) - partial
  protanomaly: [
    [0.81667, 0.18333, 0.00000],
    [0.33333, 0.66667, 0.00000],
    [0.00000, 0.12500, 0.87500],
  ],

  // Deuteranomaly (green-weak) - partial
  deuteranomaly: [
    [0.80000, 0.20000, 0.00000],
    [0.25833, 0.74167, 0.00000],
    [0.00000, 0.14167, 0.85833],
  ],

  // Tritanomaly (blue-weak) - partial
  tritanomaly: [
    [0.96667, 0.03333, 0.00000],
    [0.00000, 0.73333, 0.26667],
    [0.00000, 0.18333, 0.81667],
  ],
}

/**
 * Apply a colour blindness transformation matrix to an RGB colour
 */
function applyMatrix(rgb: RGB, matrix: number[][]): RGB {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  return {
    r: Math.round(Math.min(255, Math.max(0, (matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b) * 255))),
    g: Math.round(Math.min(255, Math.max(0, (matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b) * 255))),
    b: Math.round(Math.min(255, Math.max(0, (matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b) * 255))),
  }
}

/**
 * Simulate how a colour appears to someone with colour blindness
 * Results are cached to avoid recalculating the same colour/type combinations
 */
export function simulateColourblindness(hex: string, type: ColourblindType): string {
  const cacheKey = `${hex.toLowerCase()}:${type}`
  const cached = simulationCache.get(cacheKey)
  if (cached) return cached

  const rgb = hexToRgb(hex)
  const matrix = colourblindMatrices[type]
  const simulated = applyMatrix(rgb, matrix)
  const result = rgbToHex(simulated)

  simulationCache.set(cacheKey, result)
  return result
}

/**
 * Clear the CVD simulation cache (useful for testing or memory management)
 */
export function clearSimulationCache(): void {
  simulationCache.clear()
}

/**
 * Get the current size of the simulation cache
 */
export function getSimulationCacheSize(): number {
  return simulationCache.size
}

/**
 * Simulate colour blindness for multiple colours
 */
export function simulateColourblindnessBatch(
  hexValues: string[],
  type: ColourblindType
): string[] {
  return hexValues.map((hex) => simulateColourblindness(hex, type))
}

/**
 * Get all colour blindness simulations for a single colour
 */
export function getAllSimulations(hex: string): Record<ColourblindType, string> {
  const types: ColourblindType[] = [
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'achromatopsia',
    'protanomaly',
    'deuteranomaly',
    'tritanomaly',
  ]

  const result: Partial<Record<ColourblindType, string>> = {}

  for (const type of types) {
    result[type] = simulateColourblindness(hex, type)
  }

  return result as Record<ColourblindType, string>
}

/**
 * Check if two colours are distinguishable for a specific type of colour blindness
 */
export function areColoursDistinguishable(
  hex1: string,
  hex2: string,
  type: ColourblindType,
  threshold: number = 20
): boolean {
  const sim1 = simulateColourblindness(hex1, type)
  const sim2 = simulateColourblindness(hex2, type)

  const rgb1 = hexToRgb(sim1)
  const rgb2 = hexToRgb(sim2)

  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  )

  return distance >= threshold
}

/**
 * Check if a palette is accessible for all types of colour blindness
 */
export function checkPaletteAccessibility(
  hexValues: string[],
  threshold: number = 20
): Record<ColourblindType, { accessible: boolean; problematicPairs: [string, string][] }> {
  const types: ColourblindType[] = [
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'achromatopsia',
  ]

  const result: Record<ColourblindType, { accessible: boolean; problematicPairs: [string, string][] }> = {} as Record<ColourblindType, { accessible: boolean; problematicPairs: [string, string][] }>

  for (const type of types) {
    const problematicPairs: [string, string][] = []

    for (let i = 0; i < hexValues.length; i++) {
      for (let j = i + 1; j < hexValues.length; j++) {
        if (!areColoursDistinguishable(hexValues[i], hexValues[j], type, threshold)) {
          problematicPairs.push([hexValues[i], hexValues[j]])
        }
      }
    }

    result[type] = {
      accessible: problematicPairs.length === 0,
      problematicPairs,
    }
  }

  return result
}

/**
 * Get human-readable name for colour blindness type
 */
export function getColourblindTypeName(type: ColourblindType): string {
  const names: Record<ColourblindType, string> = {
    protanopia: 'Protanopia (Red-blind)',
    deuteranopia: 'Deuteranopia (Green-blind)',
    tritanopia: 'Tritanopia (Blue-blind)',
    achromatopsia: 'Achromatopsia (Monochromacy)',
    protanomaly: 'Protanomaly (Red-weak)',
    deuteranomaly: 'Deuteranomaly (Green-weak)',
    tritanomaly: 'Tritanomaly (Blue-weak)',
  }
  return names[type]
}

/**
 * Get description for colour blindness type
 */
export function getColourblindTypeDescription(type: ColourblindType): string {
  const descriptions: Record<ColourblindType, string> = {
    protanopia: 'Cannot perceive red light. Affects ~1% of people.',
    deuteranopia: 'Cannot perceive green light. Affects ~1% of people.',
    tritanopia: 'Cannot perceive blue light. Rare condition.',
    achromatopsia: 'Cannot perceive any colour. Very rare condition.',
    protanomaly: 'Reduced sensitivity to red light. Affects ~1% of people.',
    deuteranomaly: 'Reduced sensitivity to green light. Most common CVD type.',
    tritanomaly: 'Reduced sensitivity to blue light. Rare condition.',
  }
  return descriptions[type]
}

/**
 * Colour blindness types for iteration
 */
export const colourblindTypes: ColourblindType[] = [
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
  'protanomaly',
  'deuteranomaly',
  'tritanomaly',
]

/**
 * Common colour blindness types (most prevalent)
 */
export const commonColourblindTypes: ColourblindType[] = [
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
]

/**
 * Check colourblind accessibility within categories
 * Only colours in the same category are checked against each other
 */
export function checkCategoryAccessibility(
  categories: { category: string; colours: { hex: string; name: string }[] }[],
  threshold: number = 20
): {
  byType: Record<ColourblindType, { accessible: boolean; problematicPairs: { hex1: string; hex2: string; category: string }[] }>
  byCategory: Record<string, Record<ColourblindType, { accessible: boolean; problematicPairs: [string, string][] }>>
} {
  const types: ColourblindType[] = [
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'achromatopsia',
  ]

  // Initialize results
  const byType: Record<ColourblindType, { accessible: boolean; problematicPairs: { hex1: string; hex2: string; category: string }[] }> = {} as any
  const byCategory: Record<string, Record<ColourblindType, { accessible: boolean; problematicPairs: [string, string][] }>> = {}

  for (const type of types) {
    byType[type] = { accessible: true, problematicPairs: [] }
  }

  // Check each category separately
  for (const category of categories) {
    if (category.colours.length < 2) continue

    const hexValues = category.colours.map((c) => c.hex)
    const categoryResult = checkPaletteAccessibility(hexValues, threshold)

    byCategory[category.category] = categoryResult

    // Aggregate into byType results
    for (const type of types) {
      const typeResult = categoryResult[type]
      if (!typeResult.accessible) {
        byType[type].accessible = false
        for (const [hex1, hex2] of typeResult.problematicPairs) {
          byType[type].problematicPairs.push({ hex1, hex2, category: category.category })
        }
      }
    }
  }

  return { byType, byCategory }
}

/**
 * Suggest an accessible alternative colour for contrast issues
 * Adjusts lightness to achieve target contrast ratio under CVD simulation
 */
export function suggestContrastFix(
  textHex: string,
  backgroundHex: string,
  type: ColourblindType,
  targetRatio: number = 4.5
): { hex: string; adjustedLightness: number } | null {
  const hsl = hexToHsl(textHex)
  const originalLightness = hsl.l

  // Determine direction: if text is lighter than mid, try darker; else try lighter
  const bgHsl = hexToHsl(backgroundHex)
  const shouldGoDarker = hsl.l > bgHsl.l

  // Try adjusting lightness in steps
  const step = 5
  const maxAttempts = 20

  for (let i = 1; i <= maxAttempts; i++) {
    // Try going darker or lighter based on initial direction
    const adjustments = shouldGoDarker
      ? [-i * step, i * step]
      : [i * step, -i * step]

    for (const adjustment of adjustments) {
      const newLightness = Math.min(100, Math.max(0, originalLightness + adjustment))
      const newHex = hslToHex({ h: hsl.h, s: hsl.s, l: newLightness })

      // Check contrast under simulation
      const simulatedText = simulateColourblindness(newHex, type)
      const simulatedBg = simulateColourblindness(backgroundHex, type)
      const ratio = getContrastRatioFromHex(simulatedText, simulatedBg)

      if (ratio >= targetRatio) {
        return { hex: newHex, adjustedLightness: newLightness }
      }
    }
  }

  // If we couldn't find a good match, suggest extreme lightness
  const extremeLight = shouldGoDarker ? 10 : 95
  return {
    hex: hslToHex({ h: hsl.h, s: hsl.s, l: extremeLight }),
    adjustedLightness: extremeLight
  }
}

/**
 * Suggest an accessible alternative colour for distinguishability issues
 * Adjusts lightness to make two colours more distinguishable under CVD simulation
 */
export function suggestDistinguishableFix(
  colourToAdjust: string,
  otherColour: string,
  type: ColourblindType,
  threshold: number = 25
): { hex: string; adjustedLightness: number } | null {
  const hsl = hexToHsl(colourToAdjust)
  const otherHsl = hexToHsl(otherColour)
  const originalLightness = hsl.l

  // Determine direction based on which colour is lighter
  const shouldGoDarker = hsl.l > otherHsl.l

  // Try adjusting lightness in steps
  const step = 5
  const maxAttempts = 18

  for (let i = 1; i <= maxAttempts; i++) {
    // Try the preferred direction first, then opposite
    const adjustments = shouldGoDarker
      ? [-i * step, i * step]
      : [i * step, -i * step]

    for (const adjustment of adjustments) {
      const newLightness = Math.min(95, Math.max(5, originalLightness + adjustment))
      const newHex = hslToHex({ h: hsl.h, s: hsl.s, l: newLightness })

      // Check if distinguishable under simulation
      if (areColoursDistinguishable(newHex, otherColour, type, threshold)) {
        return { hex: newHex, adjustedLightness: newLightness }
      }
    }
  }

  return null
}
