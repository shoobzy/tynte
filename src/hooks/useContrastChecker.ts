import { useMemo } from 'react'
import {
  getContrastResult,
  getWCAGLevel,
  formatContrastRatio,
  isLightColour,
  getOptimalTextColour,
  suggestContrastingColour,
} from '../utils/colour/contrast'

export function useContrastChecker(foreground: string, background: string) {
  const result = useMemo(
    () => getContrastResult(foreground, background),
    [foreground, background]
  )

  const level = useMemo(
    () => getWCAGLevel(result.ratio),
    [result.ratio]
  )

  const levelLarge = useMemo(
    () => getWCAGLevel(result.ratio, true),
    [result.ratio]
  )

  const formattedRatio = useMemo(
    () => formatContrastRatio(result.ratio),
    [result.ratio]
  )

  const suggestion = useMemo(
    () =>
      result.ratio < 4.5
        ? suggestContrastingColour(background, foreground)
        : null,
    [foreground, background, result.ratio]
  )

  return {
    ratio: result.ratio,
    formattedRatio,
    wcagAA: result.wcagAA,
    wcagAAA: result.wcagAAA,
    wcagAALarge: result.wcagAALarge,
    wcagAAALarge: result.wcagAAALarge,
    level,
    levelLarge,
    suggestion,
    passes: result.wcagAA,
    passesLarge: result.wcagAALarge,
  }
}

export function useOptimalTextColour(background: string) {
  return useMemo(() => getOptimalTextColour(background), [background])
}

export function useIsLightColour(hex: string) {
  return useMemo(() => isLightColour(hex), [hex])
}
