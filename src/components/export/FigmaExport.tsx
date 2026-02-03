import { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Dropdown } from '../ui/Dropdown'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { exportToFigmaTokens, exportToFigmaVariables, exportToStyleDictionary } from '../../utils/export/figma'
import { copyToClipboard, downloadFile } from '../../utils/helpers'

type FigmaFormat = 'tokens' | 'variables' | 'style-dictionary'

const formatOptions = [
  { value: 'tokens', label: 'Design Tokens (W3C format)' },
  { value: 'variables', label: 'Figma Variables JSON' },
  { value: 'style-dictionary', label: 'Style Dictionary' },
]

export function FigmaExport() {
  const { palettes, activePaletteId } = usePaletteStore()
  const toast = useToast()

  const [format, setFormat] = useState<FigmaFormat>('tokens')
  const [groupByCategory, setGroupByCategory] = useState(true)
  const [includeDescription, setIncludeDescription] = useState(true)
  const [copied, setCopied] = useState(false)

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  if (!activePalette) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Select a palette to export
      </div>
    )
  }

  const options = {
    format: 'figma' as const,
    includeComments: true,
    prefix: '',
    colorFormat: 'hex' as const,
    includeScale: true,
    darkMode: false,
    includeDescription,
    groupByCategory,
  }

  const getExportResult = () => {
    switch (format) {
      case 'tokens':
        return exportToFigmaTokens(activePalette, options)
      case 'variables':
        return exportToFigmaVariables(activePalette, options)
      case 'style-dictionary':
        return exportToStyleDictionary(activePalette, options)
      default:
        return exportToFigmaTokens(activePalette, options)
    }
  }

  const exportResult = getExportResult()

  const handleCopy = async () => {
    const success = await copyToClipboard(exportResult.content)
    if (success) {
      setCopied(true)
      toast.success('JSON copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    downloadFile(exportResult.content, exportResult.filename, exportResult.mimeType)
    toast.success(`Downloaded ${exportResult.filename}`)
  }

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Dropdown
            options={formatOptions}
            value={format}
            onChange={(v) => setFormat(v as FigmaFormat)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="groupByCategory"
            checked={groupByCategory}
            onChange={(e) => setGroupByCategory(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="groupByCategory" className="text-sm">
            Group by category
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeDescription"
            checked={includeDescription}
            onChange={(e) => setIncludeDescription(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="includeDescription" className="text-sm">
            Include descriptions
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Output</label>
          <span className="text-xs text-muted-foreground">
            {exportResult.filename}
          </span>
        </div>
        <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-96">
          {exportResult.content}
        </pre>
      </div>

      {/* Info */}
      <div className="p-4 bg-muted/50 rounded-lg text-sm">
        <p className="font-medium mb-1">How to use</p>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>• <strong>Design Tokens:</strong> Compatible with Tokens Studio for Figma and other W3C-compliant tools</li>
          <li>• <strong>Figma Variables:</strong> Use with Figma's Variables API or plugins</li>
          <li>• <strong>Style Dictionary:</strong> Use with Amazon's Style Dictionary build system</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
        <Button onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  )
}
