import { Palette } from '../../types/palette'
import { TailwindExportOptions, ExportResult } from '../../types/export'
import { hexToRgb } from '../colour/conversions'

function formatColourForTailwind(hex: string, format: TailwindExportOptions['colorFormat']): string {
  switch (format) {
    case 'rgb': {
      const rgb = hexToRgb(hex)
      return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`
    }
    case 'hex':
    default:
      return hex
  }
}

function sanitiseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
}

export function exportToTailwind(
  palette: Palette,
  options: TailwindExportOptions
): ExportResult {
  const lines: string[] = []

  if (options.generateConfig) {
    lines.push('/** @type {import(\'tailwindcss\').Config} */')
    lines.push('module.exports = {')
    lines.push('  theme: {')

    if (options.extendColors) {
      lines.push('    extend: {')
      lines.push('      colors: {')
    } else {
      lines.push('    colors: {')
    }

    for (const categoryColours of palette.categories) {
      if (categoryColours.colours.length === 0) continue

      const categoryName = sanitiseName(categoryColours.category)

      if (categoryColours.colours.length === 1) {
        // Single colour - use directly
        const colour = categoryColours.colours[0]
        const value = formatColourForTailwind(colour.hex, options.colorFormat)
        lines.push(`        '${categoryName}': '${value}',`)
      } else {
        // Multiple colours - create object
        lines.push(`        '${categoryName}': {`)

        for (const colour of categoryColours.colours) {
          const colourName = sanitiseName(colour.name)
          const value = formatColourForTailwind(colour.hex, options.colorFormat)
          lines.push(`          '${colourName}': '${value}',`)
        }

        lines.push('        },')
      }
    }

    if (options.extendColors) {
      lines.push('      },')
      lines.push('    },')
    } else {
      lines.push('    },')
    }

    lines.push('  },')
    lines.push('}')
  } else {
    // Just export the colours object
    lines.push('// Tailwind colours configuration')
    lines.push('// Add this to your tailwind.config.js theme.extend.colors')
    lines.push('')
    lines.push('const colors = {')

    for (const categoryColours of palette.categories) {
      if (categoryColours.colours.length === 0) continue

      const categoryName = sanitiseName(categoryColours.category)

      if (categoryColours.colours.length === 1) {
        const colour = categoryColours.colours[0]
        const value = formatColourForTailwind(colour.hex, options.colorFormat)
        lines.push(`  '${categoryName}': '${value}',`)
      } else {
        lines.push(`  '${categoryName}': {`)

        for (const colour of categoryColours.colours) {
          const colourName = sanitiseName(colour.name)
          const value = formatColourForTailwind(colour.hex, options.colorFormat)
          lines.push(`    '${colourName}': '${value}',`)
        }

        lines.push('  },')
      }
    }

    lines.push('}')
    lines.push('')
    lines.push('module.exports = { colors }')
  }

  return {
    content: lines.join('\n'),
    filename: options.generateConfig
      ? 'tailwind.config.js'
      : `${palette.name.toLowerCase().replace(/\s+/g, '-')}-tailwind-colors.js`,
    mimeType: 'text/javascript',
  }
}

export function exportToTailwindCSS(
  palette: Palette,
  prefix: string = ''
): ExportResult {
  const lines: string[] = []

  lines.push('@tailwind base;')
  lines.push('@tailwind components;')
  lines.push('@tailwind utilities;')
  lines.push('')
  lines.push('@layer base {')
  lines.push('  :root {')

  for (const categoryColours of palette.categories) {
    for (const colour of categoryColours.colours) {
      const varName = `--${prefix}${prefix ? '-' : ''}${sanitiseName(categoryColours.category)}-${sanitiseName(colour.name)}`
      lines.push(`    ${varName}: ${colour.hex};`)
    }
  }

  lines.push('  }')
  lines.push('}')

  return {
    content: lines.join('\n'),
    filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-tailwind.css`,
    mimeType: 'text/css',
  }
}
