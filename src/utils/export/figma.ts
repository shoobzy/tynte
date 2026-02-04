import { Palette } from '../../types/palette'
import { FigmaExportOptions, ExportResult } from '../../types/export'
import { hexToRgb } from '../colour/conversions'

interface FigmaColourValue {
  colorSpace: 'srgb'
  components: [number, number, number]
  hex: string
}

interface FigmaColourToken {
  $type: 'color'
  $value: FigmaColourValue
  $description?: string
}

interface FigmaTokenGroup {
  [key: string]: FigmaColourToken | FigmaTokenGroup
}

function sanitiseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
}

// Convert hex to RGBA format for Figma (if needed for future use)
// function hexToFigmaRgba(hex: string): string {
//   const rgb = hexToRgb(hex)
//   return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
// }

export function exportToFigmaTokens(
  palette: Palette,
  options: FigmaExportOptions
): ExportResult {
  const tokens: FigmaTokenGroup = {}

  if (options.groupByCategory) {
    for (const categoryColours of palette.categories) {
      if (categoryColours.colours.length === 0) continue

      const categoryName = sanitiseName(categoryColours.category)
      tokens[categoryName] = {}

      for (const colour of categoryColours.colours) {
        const colourName = sanitiseName(colour.name)
        const rgb = hexToRgb(colour.hex)
        const token: FigmaColourToken = {
          $type: 'color',
          $value: {
            colorSpace: 'srgb',
            components: [rgb.r / 255, rgb.g / 255, rgb.b / 255],
            hex: colour.hex,
          },
        }

        if (options.includeDescription) {
          token.$description = `${categoryColours.category} colour: ${colour.name}`
        }

        (tokens[categoryName] as FigmaTokenGroup)[colourName] = token
      }
    }
  } else {
    for (const categoryColours of palette.categories) {
      for (const colour of categoryColours.colours) {
        const tokenName = `${sanitiseName(categoryColours.category)}-${sanitiseName(colour.name)}`
        const rgb = hexToRgb(colour.hex)
        const token: FigmaColourToken = {
          $type: 'color',
          $value: {
            colorSpace: 'srgb',
            components: [rgb.r / 255, rgb.g / 255, rgb.b / 255],
            hex: colour.hex,
          },
        }

        if (options.includeDescription) {
          token.$description = `${categoryColours.category} colour: ${colour.name}`
        }

        tokens[tokenName] = token
      }
    }
  }

  const output = {
    ...tokens,
  }

  return {
    content: JSON.stringify(output, null, 2),
    filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-figma-tokens.json`,
    mimeType: 'application/json',
  }
}

export function exportToFigmaVariables(
  palette: Palette,
  options: FigmaExportOptions
): ExportResult {
  const collectionId = 'tynte_collection'
  const modeId = 'tynte_mode'

  const variables: {
    action: 'CREATE'
    id: string
    name: string
    variableCollectionId: string
    resolvedType: 'COLOR'
    description?: string
  }[] = []

  const variableModeValues: {
    variableId: string
    modeId: string
    value: { r: number; g: number; b: number; a: number }
  }[] = []

  let varIndex = 0
  for (const categoryColours of palette.categories) {
    for (const colour of categoryColours.colours) {
      const rgb = hexToRgb(colour.hex)
      const varId = `tynte_var_${varIndex++}`
      const name = options.groupByCategory
        ? `${categoryColours.category}/${colour.name}`
        : `${categoryColours.category}-${colour.name}`

      const variable: {
        action: 'CREATE'
        id: string
        name: string
        variableCollectionId: string
        resolvedType: 'COLOR'
        description?: string
      } = {
        action: 'CREATE',
        id: varId,
        name,
        variableCollectionId: collectionId,
        resolvedType: 'COLOR',
      }

      if (options.includeDescription) {
        variable.description = `${categoryColours.category} colour: ${colour.name}`
      }

      variables.push(variable)

      variableModeValues.push({
        variableId: varId,
        modeId: modeId,
        value: {
          r: rgb.r / 255,
          g: rgb.g / 255,
          b: rgb.b / 255,
          a: 1,
        },
      })
    }
  }

  const output = {
    variableCollections: [
      {
        action: 'CREATE' as const,
        id: collectionId,
        name: palette.name,
        initialModeId: modeId,
      },
    ],
    variableModes: [
      {
        action: 'UPDATE' as const,
        id: modeId,
        name: 'Default',
        variableCollectionId: collectionId,
      },
    ],
    variables,
    variableModeValues,
  }

  return {
    content: JSON.stringify(output, null, 2),
    filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-figma-variables.json`,
    mimeType: 'application/json',
  }
}

export function exportToStyleDictionary(
  palette: Palette,
  options: FigmaExportOptions
): ExportResult {
  const tokens: Record<string, Record<string, { value: string; type: string; description?: string }>> = {}

  for (const categoryColours of palette.categories) {
    if (categoryColours.colours.length === 0) continue

    const categoryName = sanitiseName(categoryColours.category)
    tokens[categoryName] = {}

    for (const colour of categoryColours.colours) {
      const colourName = sanitiseName(colour.name)
      const token: { value: string; type: string; description?: string } = {
        value: colour.hex,
        type: 'color',
      }

      if (options.includeDescription) {
        token.description = `${categoryColours.category} colour: ${colour.name}`
      }

      tokens[categoryName][colourName] = token
    }
  }

  const output = {
    color: tokens,
  }

  return {
    content: JSON.stringify(output, null, 2),
    filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-style-dictionary.json`,
    mimeType: 'application/json',
  }
}
