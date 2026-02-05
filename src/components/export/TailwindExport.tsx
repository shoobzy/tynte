import { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { exportToTailwind } from '../../utils/export/tailwind'
import { copyToClipboard, downloadFile } from '../../utils/helpers'

export function TailwindExport() {
  const { palettes, activePaletteId } = usePaletteStore()
  const toast = useToast()

  const [generateConfig, setGenerateConfig] = useState(true)
  const [extendColors, setExtendColors] = useState(true)
  const [prefix] = useState('')
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
    format: 'tailwind' as const,
    includeComments: true,
    prefix,
    colorFormat: 'hex' as const,
    includeScale: true,
    darkMode: false,
    extendColors,
    generateConfig,
  }

  const exportResult = exportToTailwind(activePalette, options)

  const handleCopy = async () => {
    const success = await copyToClipboard(exportResult.content)
    if (success) {
      setCopied(true)
      toast.success('Tailwind config copied to clipboard')
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="generateConfig"
            checked={generateConfig}
            onChange={(e) => setGenerateConfig(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="generateConfig" className="text-sm">
            Generate full tailwind.config.js
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="extendColors"
            checked={extendColors}
            onChange={(e) => setExtendColors(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="extendColors" className="text-sm">
            Extend existing colours (don't replace)
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

      {/* Usage example */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium mb-2">Usage Example</p>
        <pre className="text-xs text-foreground/70">
          {`<div className="bg-primary-500 text-neutral-100">
  Hello World
</div>`}
        </pre>
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
