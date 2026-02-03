import { RGB, ContrastResult, WCAGLevel } from '../../types/colour'
import { hexToRgb } from './conversions'

/**
 * Calculate the relative luminance of a colour
 * Based on WCAG 2.1 specification
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(rgb: RGB): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate the contrast ratio between two luminance values
 * Returns a value between 1 and 21
 */
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate contrast ratio between two hex colours
 */
export function getContrastRatioFromHex(hex1: string, hex2: string): number {
  const l1 = getLuminance(hexToRgb(hex1))
  const l2 = getLuminance(hexToRgb(hex2))
  return getContrastRatio(l1, l2)
}

/**
 * Get full contrast analysis between two colours
 */
export function getContrastResult(hex1: string, hex2: string): ContrastResult {
  const ratio = getContrastRatioFromHex(hex1, hex2)

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
    wcagAALarge: ratio >= 3,
    wcagAAALarge: ratio >= 4.5,
  }
}

/**
 * Get WCAG compliance level as a string
 */
export function getWCAGLevel(ratio: number, isLargeText: boolean = false): WCAGLevel {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA'
    if (ratio >= 3) return 'AA'
    return 'Fail'
  }

  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

/**
 * Check if a colour is light (for determining text colour)
 */
export function isLightColour(hex: string): boolean {
  const luminance = getLuminance(hexToRgb(hex))
  return luminance > 0.179
}

/**
 * Get optimal text colour (black or white) for a background
 */
export function getOptimalTextColour(backgroundHex: string): string {
  return isLightColour(backgroundHex) ? '#000000' : '#ffffff'
}

/**
 * Find the best contrasting colour from a list
 */
export function findBestContrast(
  targetHex: string,
  candidates: string[]
): string | null {
  if (candidates.length === 0) return null

  let bestColour = candidates[0]
  let bestRatio = getContrastRatioFromHex(targetHex, candidates[0])

  for (let i = 1; i < candidates.length; i++) {
    const ratio = getContrastRatioFromHex(targetHex, candidates[i])
    if (ratio > bestRatio) {
      bestRatio = ratio
      bestColour = candidates[i]
    }
  }

  return bestColour
}

/**
 * Generate a contrast matrix for a list of colours
 */
export function generateContrastMatrix(colours: string[]): number[][] {
  const matrix: number[][] = []

  for (let i = 0; i < colours.length; i++) {
    matrix[i] = []
    for (let j = 0; j < colours.length; j++) {
      if (i === j) {
        matrix[i][j] = 1
      } else {
        matrix[i][j] = getContrastRatioFromHex(colours[i], colours[j])
      }
    }
  }

  return matrix
}

/**
 * Check if all colour pairs meet minimum contrast requirements
 */
export function checkAllContrast(
  colours: string[],
  minRatio: number = 4.5
): { passing: boolean; failures: [string, string, number][] } {
  const failures: [string, string, number][] = []

  for (let i = 0; i < colours.length; i++) {
    for (let j = i + 1; j < colours.length; j++) {
      const ratio = getContrastRatioFromHex(colours[i], colours[j])
      if (ratio < minRatio) {
        failures.push([colours[i], colours[j], ratio])
      }
    }
  }

  return {
    passing: failures.length === 0,
    failures,
  }
}

/**
 * Suggest a modified colour that meets contrast requirements
 */
export function suggestContrastingColour(
  backgroundHex: string,
  foregroundHex: string,
  targetRatio: number = 4.5
): string {
  const bgLuminance = getLuminance(hexToRgb(backgroundHex))
  const fgRgb = hexToRgb(foregroundHex)

  // Determine if we need to lighten or darken
  const isBackgroundLight = bgLuminance > 0.5

  // Binary search for the right lightness adjustment
  let low = 0
  let high = 1
  let bestHex = foregroundHex

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2

    // Adjust RGB values
    let adjustedRgb: RGB
    if (isBackgroundLight) {
      // Darken the foreground
      adjustedRgb = {
        r: Math.round(fgRgb.r * (1 - mid)),
        g: Math.round(fgRgb.g * (1 - mid)),
        b: Math.round(fgRgb.b * (1 - mid)),
      }
    } else {
      // Lighten the foreground
      adjustedRgb = {
        r: Math.round(fgRgb.r + (255 - fgRgb.r) * mid),
        g: Math.round(fgRgb.g + (255 - fgRgb.g) * mid),
        b: Math.round(fgRgb.b + (255 - fgRgb.b) * mid),
      }
    }

    const adjustedLuminance = getLuminance(adjustedRgb)
    const ratio = getContrastRatio(bgLuminance, adjustedLuminance)

    if (ratio >= targetRatio) {
      bestHex = `#${adjustedRgb.r.toString(16).padStart(2, '0')}${adjustedRgb.g.toString(16).padStart(2, '0')}${adjustedRgb.b.toString(16).padStart(2, '0')}`
      high = mid
    } else {
      low = mid
    }
  }

  return bestHex
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}
