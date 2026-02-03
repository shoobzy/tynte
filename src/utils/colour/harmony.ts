import { ColourHarmony, HSL } from '../../types/colour'
import { hexToHsl, hslToHex, hexToOklch, oklchToHex } from './conversions'

/**
 * Rotate hue by degrees (0-360)
 */
function rotateHue(hsl: HSL, degrees: number): HSL {
  return {
    ...hsl,
    h: (hsl.h + degrees + 360) % 360,
  }
}

/**
 * Generate complementary colour (opposite on colour wheel)
 */
export function generateComplementary(hex: string): string[] {
  const hsl = hexToHsl(hex)
  return [hex, hslToHex(rotateHue(hsl, 180))]
}

/**
 * Generate analogous colours (adjacent on colour wheel)
 */
export function generateAnalogous(hex: string, angle: number = 30): string[] {
  const hsl = hexToHsl(hex)
  return [
    hslToHex(rotateHue(hsl, -angle)),
    hex,
    hslToHex(rotateHue(hsl, angle)),
  ]
}

/**
 * Generate triadic colours (evenly spaced by 120 degrees)
 */
export function generateTriadic(hex: string): string[] {
  const hsl = hexToHsl(hex)
  return [
    hex,
    hslToHex(rotateHue(hsl, 120)),
    hslToHex(rotateHue(hsl, 240)),
  ]
}

/**
 * Generate tetradic/rectangular colours (two complementary pairs)
 */
export function generateTetradic(hex: string): string[] {
  const hsl = hexToHsl(hex)
  return [
    hex,
    hslToHex(rotateHue(hsl, 60)),
    hslToHex(rotateHue(hsl, 180)),
    hslToHex(rotateHue(hsl, 240)),
  ]
}

/**
 * Generate split-complementary colours
 */
export function generateSplitComplementary(hex: string): string[] {
  const hsl = hexToHsl(hex)
  return [
    hex,
    hslToHex(rotateHue(hsl, 150)),
    hslToHex(rotateHue(hsl, 210)),
  ]
}

/**
 * Generate square colours (evenly spaced by 90 degrees)
 */
export function generateSquare(hex: string): string[] {
  const hsl = hexToHsl(hex)
  return [
    hex,
    hslToHex(rotateHue(hsl, 90)),
    hslToHex(rotateHue(hsl, 180)),
    hslToHex(rotateHue(hsl, 270)),
  ]
}

/**
 * Generate monochromatic colours (same hue, different lightness/saturation)
 */
export function generateMonochromatic(hex: string, count: number = 5): string[] {
  const hsl = hexToHsl(hex)
  const colours: string[] = []

  // Generate variations from light to dark
  const step = 80 / (count - 1)
  for (let i = 0; i < count; i++) {
    const lightness = 90 - (i * step)
    colours.push(hslToHex({
      h: hsl.h,
      s: hsl.s,
      l: Math.max(10, Math.min(90, lightness)),
    }))
  }

  return colours
}

/**
 * Generate harmony based on type
 */
export function generateHarmony(hex: string, type: ColourHarmony): string[] {
  switch (type) {
    case 'complementary':
      return generateComplementary(hex)
    case 'analogous':
      return generateAnalogous(hex)
    case 'triadic':
      return generateTriadic(hex)
    case 'tetradic':
      return generateTetradic(hex)
    case 'split-complementary':
      return generateSplitComplementary(hex)
    case 'square':
      return generateSquare(hex)
    case 'monochromatic':
      return generateMonochromatic(hex)
    default:
      return [hex]
  }
}

/**
 * Get harmony type display name
 */
export function getHarmonyName(type: ColourHarmony): string {
  const names: Record<ColourHarmony, string> = {
    'complementary': 'Complementary',
    'analogous': 'Analogous',
    'triadic': 'Triadic',
    'tetradic': 'Tetradic',
    'split-complementary': 'Split Complementary',
    'square': 'Square',
    'monochromatic': 'Monochromatic',
  }
  return names[type]
}

/**
 * Get harmony type description
 */
export function getHarmonyDescription(type: ColourHarmony): string {
  const descriptions: Record<ColourHarmony, string> = {
    'complementary': 'Two colours opposite each other on the colour wheel. High contrast and vibrant.',
    'analogous': 'Three colours adjacent to each other. Harmonious and serene.',
    'triadic': 'Three colours evenly spaced around the colour wheel. Balanced and vibrant.',
    'tetradic': 'Four colours forming two complementary pairs. Rich and varied.',
    'split-complementary': 'A colour and two colours adjacent to its complement. High contrast with less tension.',
    'square': 'Four colours evenly spaced around the colour wheel. Bold and dynamic.',
    'monochromatic': 'Variations of a single hue. Clean and cohesive.',
  }
  return descriptions[type]
}

/**
 * All available harmony types
 */
export const harmonyTypes: ColourHarmony[] = [
  'complementary',
  'analogous',
  'triadic',
  'tetradic',
  'split-complementary',
  'square',
  'monochromatic',
]

/**
 * Generate a random colour
 */
export function generateRandomColour(): string {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(Math.random() * 40) + 50 // 50-90% saturation
  const l = Math.floor(Math.random() * 40) + 30 // 30-70% lightness
  return hslToHex({ h, s, l })
}

/**
 * Generate a random palette with specified count
 */
export function generateRandomPalette(count: number = 5): string[] {
  const baseColour = generateRandomColour()
  const hsl = hexToHsl(baseColour)
  const colours: string[] = [baseColour]

  for (let i = 1; i < count; i++) {
    const hueShift = (360 / count) * i + (Math.random() * 20 - 10)
    const satShift = Math.random() * 20 - 10
    const lightShift = Math.random() * 20 - 10

    colours.push(hslToHex({
      h: (hsl.h + hueShift + 360) % 360,
      s: Math.max(20, Math.min(100, hsl.s + satShift)),
      l: Math.max(20, Math.min(80, hsl.l + lightShift)),
    }))
  }

  return colours
}

/**
 * Scale step names (Tailwind-style)
 */
const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/**
 * Generate a 50-950 scale from a base colour using OKLCH
 */
function generateScale(h: number, s: number, categoryName: string): { hex: string; name: string }[] {
  // Generate a mid-tone base colour (500 level)
  const baseHex = hslToHex({ h, s, l: 55 })
  const baseOklch = hexToOklch(baseHex)

  // Lightness values for each step (OKLCH uses 0-1 range)
  const lightnessSteps = [0.97, 0.93, 0.85, 0.76, 0.65, 0.55, 0.45, 0.38, 0.30, 0.22, 0.14]

  // Chroma adjustments (reduce at extremes for more natural colours)
  const chromaMultipliers = [0.15, 0.25, 0.45, 0.65, 0.85, 1.0, 0.95, 0.85, 0.75, 0.65, 0.55]

  return lightnessSteps.map((lightness, i) => {
    const adjustedChroma = baseOklch.c * chromaMultipliers[i]
    const hex = oklchToHex({
      l: lightness,
      c: Math.min(0.4, adjustedChroma),
      h: baseOklch.h,
    })
    return {
      hex,
      name: `${categoryName}-${scaleSteps[i]}`,
    }
  })
}

/**
 * Generate a complete random palette with all semantic categories populated
 * Returns an object with colours for each category using 50-950 scale
 */
export function generateCompleteRandomPalette(): Record<string, { hex: string; name: string }[]> {
  // Generate a random base hue for the brand colours
  const baseHue = Math.floor(Math.random() * 360)

  // Primary: Based on random hue
  const primary = generateScale(
    baseHue,
    Math.floor(Math.random() * 20) + 70, // 70-90% saturation
    'Primary'
  )

  // Secondary: Complementary or analogous
  const secondaryHue = (baseHue + 180 + Math.floor(Math.random() * 40) - 20) % 360
  const secondary = generateScale(
    secondaryHue,
    Math.floor(Math.random() * 20) + 50, // 50-70% saturation
    'Secondary'
  )

  // Accent: Triadic position with high saturation
  const accentHue = (baseHue + 120 + Math.floor(Math.random() * 30) - 15) % 360
  const accent = generateScale(
    accentHue,
    Math.floor(Math.random() * 15) + 80, // 80-95% saturation
    'Accent'
  )

  // Neutral: Desaturated greys with slight hue tint
  const neutral = generateScale(baseHue, 8, 'Neutral') // Very low saturation

  // Success: Green hues (100-140)
  const successHue = Math.floor(Math.random() * 40) + 100
  const success = generateScale(successHue, 70, 'Success')

  // Warning: Yellow/Orange hues (30-50)
  const warningHue = Math.floor(Math.random() * 20) + 35
  const warning = generateScale(warningHue, 85, 'Warning')

  // Error: Red hues (0-15 or 345-360)
  const errorHue = Math.random() > 0.5
    ? Math.floor(Math.random() * 15)
    : Math.floor(Math.random() * 15) + 345
  const error = generateScale(errorHue, 75, 'Error')

  // Info: Blue hues (200-230)
  const infoHue = Math.floor(Math.random() * 30) + 200
  const info = generateScale(infoHue, 75, 'Info')

  return {
    primary,
    secondary,
    accent,
    neutral,
    success,
    warning,
    error,
    info,
  }
}
