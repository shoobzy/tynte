import { useMemo } from 'react'
import { ColourblindType } from '../types/colour'
import {
  simulateColourblindness,
  simulateColourblindnessBatch,
  getAllSimulations,
  checkPaletteAccessibility,
} from '../utils/colour/colourblind'

export function useColourblindSimulation(hex: string, type: ColourblindType) {
  return useMemo(
    () => simulateColourblindness(hex, type),
    [hex, type]
  )
}

export function useAllColourblindSimulations(hex: string) {
  return useMemo(() => getAllSimulations(hex), [hex])
}

export function usePaletteColourblindSimulation(
  hexValues: string[],
  type: ColourblindType
) {
  return useMemo(
    () => simulateColourblindnessBatch(hexValues, type),
    [hexValues, type]
  )
}

export function usePaletteAccessibility(hexValues: string[]) {
  return useMemo(() => {
    if (hexValues.length < 2) {
      return null
    }
    return checkPaletteAccessibility(hexValues)
  }, [hexValues])
}
