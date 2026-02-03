import { OKLCH } from '../../types/colour'
import { ColourScale } from '../../types/palette'
import { hexToHsl, hslToHex, hexToOklch, oklchToHex } from './conversions'

/**
 * Generate a colour scale (50-950) from a base colour using HSL
 */
export function generateScaleHSL(baseHex: string): ColourScale {
  const baseHsl = hexToHsl(baseHex)

  // Scale lightness values for each step
  // These values are tuned to match Tailwind's colour scales
  const lightnessSteps: Record<keyof ColourScale, number> = {
    50: 97,
    100: 94,
    200: 86,
    300: 77,
    400: 66,
    500: 55,
    600: 45,
    700: 37,
    800: 29,
    900: 22,
    950: 14,
  }

  // Saturation adjustments (slightly less saturated at extremes)
  const saturationAdjust: Record<keyof ColourScale, number> = {
    50: -15,
    100: -10,
    200: -5,
    300: 0,
    400: 0,
    500: 0,
    600: 0,
    700: 0,
    800: 5,
    900: 5,
    950: 10,
  }

  const scale: ColourScale = {} as ColourScale
  const steps: (keyof ColourScale)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  for (const step of steps) {
    const lightness = lightnessSteps[step]
    const adjustedSat = Math.max(0, Math.min(100, baseHsl.s + saturationAdjust[step]))
    scale[step] = hslToHex({
      h: baseHsl.h,
      s: adjustedSat,
      l: lightness,
    })
  }

  return scale
}

/**
 * Generate a colour scale using OKLCH for more perceptually uniform results
 */
export function generateScaleOKLCH(baseHex: string): ColourScale {
  const baseOklch = hexToOklch(baseHex)

  // Lightness values for each step (OKLCH uses 0-1 range)
  const lightnessSteps: Record<keyof ColourScale, number> = {
    50: 0.97,
    100: 0.93,
    200: 0.85,
    300: 0.76,
    400: 0.65,
    500: 0.55,
    600: 0.45,
    700: 0.38,
    800: 0.30,
    900: 0.22,
    950: 0.14,
  }

  // Chroma adjustments (reduce at extremes for more natural colours)
  const chromaMultiplier: Record<keyof ColourScale, number> = {
    50: 0.15,
    100: 0.25,
    200: 0.45,
    300: 0.65,
    400: 0.85,
    500: 1.0,
    600: 0.95,
    700: 0.85,
    800: 0.75,
    900: 0.65,
    950: 0.55,
  }

  const scale: ColourScale = {} as ColourScale
  const scaleSteps: (keyof ColourScale)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  for (const step of scaleSteps) {
    const lightness = lightnessSteps[step]
    const adjustedChroma = baseOklch.c * chromaMultiplier[step]
    const oklch: OKLCH = {
      l: lightness,
      c: Math.min(0.4, adjustedChroma), // Cap chroma to avoid out-of-gamut colours
      h: baseOklch.h,
    }
    scale[step] = oklchToHex(oklch)
  }

  return scale
}

/**
 * Generate a scale with custom step count
 */
export function generateCustomScale(
  baseHex: string,
  steps: number = 11,
  method: 'hsl' | 'oklch' = 'oklch'
): string[] {
  if (method === 'hsl') {
    const baseHsl = hexToHsl(baseHex)
    const colours: string[] = []

    for (let i = 0; i < steps; i++) {
      const lightness = 97 - (i / (steps - 1)) * 85
      colours.push(hslToHex({
        h: baseHsl.h,
        s: baseHsl.s,
        l: Math.max(10, lightness),
      }))
    }

    return colours
  }

  // OKLCH method
  const baseOklch = hexToOklch(baseHex)
  const colours: string[] = []

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const lightness = 0.97 - t * 0.85
    const chromaMultiplier = t < 0.5
      ? 0.15 + (t * 2) * 0.85
      : 1 - (t - 0.5) * 0.9

    colours.push(oklchToHex({
      l: lightness,
      c: Math.min(0.4, baseOklch.c * chromaMultiplier),
      h: baseOklch.h,
    }))
  }

  return colours
}

/**
 * Generate tints (lighter versions) of a colour
 */
export function generateTints(baseHex: string, count: number = 5): string[] {
  const baseHsl = hexToHsl(baseHex)
  const tints: string[] = []

  const maxLightness = 95
  const step = (maxLightness - baseHsl.l) / count

  for (let i = 1; i <= count; i++) {
    tints.push(hslToHex({
      h: baseHsl.h,
      s: Math.max(0, baseHsl.s - i * 5),
      l: Math.min(maxLightness, baseHsl.l + step * i),
    }))
  }

  return tints
}

/**
 * Generate shades (darker versions) of a colour
 */
export function generateShades(baseHex: string, count: number = 5): string[] {
  const baseHsl = hexToHsl(baseHex)
  const shades: string[] = []

  const minLightness = 10
  const step = (baseHsl.l - minLightness) / count

  for (let i = 1; i <= count; i++) {
    shades.push(hslToHex({
      h: baseHsl.h,
      s: baseHsl.s,
      l: Math.max(minLightness, baseHsl.l - step * i),
    }))
  }

  return shades
}

/**
 * Generate tones (adding grey) of a colour
 */
export function generateTones(baseHex: string, count: number = 5): string[] {
  const baseHsl = hexToHsl(baseHex)
  const tones: string[] = []

  const step = baseHsl.s / (count + 1)

  for (let i = 1; i <= count; i++) {
    tones.push(hslToHex({
      h: baseHsl.h,
      s: Math.max(0, baseHsl.s - step * i),
      l: baseHsl.l,
    }))
  }

  return tones
}

/**
 * Mix two colours together
 */
export function mixColours(hex1: string, hex2: string, ratio: number = 0.5): string {
  const hsl1 = hexToHsl(hex1)
  const hsl2 = hexToHsl(hex2)

  // Handle hue interpolation across the 360 boundary
  let h1 = hsl1.h
  let h2 = hsl2.h
  const diff = Math.abs(h1 - h2)

  if (diff > 180) {
    if (h1 > h2) {
      h2 += 360
    } else {
      h1 += 360
    }
  }

  const mixedHue = (h1 * (1 - ratio) + h2 * ratio) % 360

  return hslToHex({
    h: mixedHue,
    s: hsl1.s * (1 - ratio) + hsl2.s * ratio,
    l: hsl1.l * (1 - ratio) + hsl2.l * ratio,
  })
}

/**
 * Create a gradient between two colours
 */
export function createGradientStops(
  startHex: string,
  endHex: string,
  steps: number = 5
): string[] {
  const colours: string[] = []

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    colours.push(mixColours(startHex, endHex, ratio))
  }

  return colours
}

/**
 * Adjust the brightness of a colour
 */
export function adjustBrightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  return hslToHex({
    h: hsl.h,
    s: hsl.s,
    l: Math.max(0, Math.min(100, hsl.l + amount)),
  })
}

/**
 * Adjust the saturation of a colour
 */
export function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  return hslToHex({
    h: hsl.h,
    s: Math.max(0, Math.min(100, hsl.s + amount)),
    l: hsl.l,
  })
}

/**
 * Shift the hue of a colour
 */
export function shiftHue(hex: string, degrees: number): string {
  const hsl = hexToHsl(hex)
  return hslToHex({
    h: (hsl.h + degrees + 360) % 360,
    s: hsl.s,
    l: hsl.l,
  })
}

/**
 * Scale step names for display
 */
export const scaleStepNames: (keyof ColourScale)[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
]
