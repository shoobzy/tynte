import { useMemo } from 'react'
import { RGB, HSL, OKLCH, ColourFormat } from '../types/colour'
import {
  hexToRgb,
  hexToHsl,
  hexToOklch,
  rgbToHex,
  hslToHex,
  oklchToHex,
  formatRgb,
  formatHsl,
  formatOklch,
} from '../utils/colour/conversions'

export function useColourConversion(hex: string) {
  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const hsl = useMemo(() => hexToHsl(hex), [hex])
  const oklch = useMemo(() => hexToOklch(hex), [hex])

  const formatted = useMemo(
    () => ({
      hex: hex.toUpperCase(),
      rgb: formatRgb(rgb),
      hsl: formatHsl(hsl),
      oklch: formatOklch(oklch),
    }),
    [hex, rgb, hsl, oklch]
  )

  const getFormattedValue = (format: ColourFormat): string => {
    switch (format) {
      case 'hex':
        return hex.toUpperCase()
      case 'rgb':
        return formatRgb(rgb)
      case 'hsl':
        return formatHsl(hsl)
      case 'oklch':
        return formatOklch(oklch)
      default:
        return hex.toUpperCase()
    }
  }

  return {
    hex,
    rgb,
    hsl,
    oklch,
    formatted,
    getFormattedValue,
  }
}

export function useColourFromRgb(rgb: RGB) {
  return useMemo(() => rgbToHex(rgb), [rgb.r, rgb.g, rgb.b])
}

export function useColourFromHsl(hsl: HSL) {
  return useMemo(() => hslToHex(hsl), [hsl.h, hsl.s, hsl.l])
}

export function useColourFromOklch(oklch: OKLCH) {
  return useMemo(() => oklchToHex(oklch), [oklch.l, oklch.c, oklch.h])
}
