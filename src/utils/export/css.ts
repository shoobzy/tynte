import { Palette } from '../../types/palette'
import { Colour } from '../../types/colour'
import { formatRgb, formatHsl, formatOklch, hexToRgb, hexToHsl, hexToOklch } from '../colour/conversions'
import { CSSExportOptions, ExportResult } from '../../types/export'

function formatColourValue(hex: string, format: CSSExportOptions['colorFormat']): string {
  switch (format) {
    case 'rgb':
      return formatRgb(hexToRgb(hex))
    case 'hsl':
      return formatHsl(hexToHsl(hex))
    case 'oklch':
      return formatOklch(hexToOklch(hex))
    case 'hex':
    default:
      return hex
  }
}

function generateVariableName(
  category: string,
  colourName: string,
  prefix: string
): string {
  const sanitized = colourName.toLowerCase().replace(/[^a-z0-9]/g, '-')
  return `--${prefix}${prefix ? '-' : ''}${category}-${sanitized}`
}

export function exportToCSS(
  palette: Palette,
  options: CSSExportOptions
): ExportResult {
  const lines: string[] = []

  if (options.includeComments) {
    lines.push(`/* ${palette.name} */`)
    if (palette.description) {
      lines.push(`/* ${palette.description} */`)
    }
    lines.push('')
  }

  lines.push(`${options.selector || ':root'} {`)

  for (const categoryColours of palette.categories) {
    if (options.includeComments && categoryColours.colours.length > 0) {
      lines.push(`  /* ${categoryColours.category} */`)
    }

    for (const colour of categoryColours.colours) {
      const varName = generateVariableName(
        categoryColours.category,
        colour.name,
        options.prefix
      )
      const value = formatColourValue(colour.hex, options.colorFormat)
      lines.push(`  ${varName}: ${value};`)
    }

    if (categoryColours.colours.length > 0) {
      lines.push('')
    }
  }

  lines.push('}')

  // Dark mode variants if requested
  if (options.darkMode) {
    lines.push('')
    lines.push(`${options.selector || ':root'}.dark {`)
    lines.push('  /* Add dark mode colour overrides here */')
    lines.push('}')
  }

  return {
    content: lines.join('\n'),
    filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-colours.css`,
    mimeType: 'text/css',
  }
}

export function exportToSCSS(
  palette: Palette,
  options: CSSExportOptions
): ExportResult {
  const lines: string[] = []

  if (options.includeComments) {
    lines.push(`// ${palette.name}`)
    if (palette.description) {
      lines.push(`// ${palette.description}`)
    }
    lines.push('')
  }

  for (const categoryColours of palette.categories) {
    if (options.includeComments && categoryColours.colours.length > 0) {
      lines.push(`// ${categoryColours.category}`)
    }

    for (const colour of categoryColours.colours) {
      const varName = `$${options.prefix}${options.prefix ? '-' : ''}${categoryColours.category}-${colour.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      const value = formatColourValue(colour.hex, options.colorFormat)
      lines.push(`${varName}: ${value};`)
    }

    if (categoryColours.colours.length > 0) {
      lines.push('')
    }
  }

  // Generate a map for easy access
  lines.push('// Colour map')
  lines.push('$colours: (')

  for (const categoryColours of palette.categories) {
    if (categoryColours.colours.length > 0) {
      lines.push(`  '${categoryColours.category}': (`)
      for (const colour of categoryColours.colours) {
        const value = formatColourValue(colour.hex, options.colorFormat)
        lines.push(`    '${colour.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}': ${value},`)
      }
      lines.push('  ),')
    }
  }

  lines.push(');')

  return {
    content: lines.join('\n'),
    filename: `${palette.name.toLowerCase().replace(/\s+/g, '-')}-colours.scss`,
    mimeType: 'text/x-scss',
  }
}

export function generateColourCSS(colours: Colour[], prefix: string = ''): string {
  const lines: string[] = [':root {']

  for (const colour of colours) {
    const varName = `--${prefix}${prefix ? '-' : ''}${colour.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    lines.push(`  ${varName}: ${colour.hex};`)
  }

  lines.push('}')

  return lines.join('\n')
}
