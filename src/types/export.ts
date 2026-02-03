export type ExportFormat =
  | 'css'
  | 'scss'
  | 'tailwind'
  | 'json'
  | 'typescript'
  | 'figma'

export interface ExportOptions {
  format: ExportFormat
  includeComments: boolean
  prefix: string
  colorFormat: 'hex' | 'rgb' | 'hsl' | 'oklch'
  includeScale: boolean
  darkMode: boolean
}

export interface CSSExportOptions extends ExportOptions {
  useCustomProperties: boolean
  selector: string
}

export interface TailwindExportOptions extends ExportOptions {
  extendColors: boolean
  generateConfig: boolean
}

export interface FigmaExportOptions extends ExportOptions {
  includeDescription: boolean
  groupByCategory: boolean
}

export interface ExportResult {
  content: string
  filename: string
  mimeType: string
}
