import { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs'
import { Input } from '../ui/Input'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useUIStore } from '../../stores/uiStore'
import { exportToCSS, exportToSCSS } from '../../utils/export/css'
import { exportToTailwind } from '../../utils/export/tailwind'
import { exportToFigmaTokens } from '../../utils/export/figma'
import { exportToJSON, exportToTypeScript } from '../../utils/export/formats'
import { copyToClipboard, downloadFile } from '../../utils/helpers'
import { ExportFormat } from '../../types/export'

export function ExportModal() {
  const { modal, closeModal } = useUIStore()
  const { palettes, activePaletteId } = usePaletteStore()
  const { exportPrefix, setExportPrefix, includeComments, setIncludeComments } = usePreferencesStore()
  const toast = useToast()

  const [format, setFormat] = useState<ExportFormat>('css')
  const [copied, setCopied] = useState(false)

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  if (!activePalette || modal.type !== 'export') return null

  const getExportContent = () => {
    const baseOptions = {
      format,
      includeComments,
      prefix: exportPrefix,
      colorFormat: 'hex' as const,
      includeScale: true,
      darkMode: false,
    }

    switch (format) {
      case 'css':
        return exportToCSS(activePalette, {
          ...baseOptions,
          useCustomProperties: true,
          selector: ':root',
        })
      case 'scss':
        return exportToSCSS(activePalette, {
          ...baseOptions,
          useCustomProperties: true,
          selector: ':root',
        })
      case 'tailwind':
        return exportToTailwind(activePalette, {
          ...baseOptions,
          extendColors: true,
          generateConfig: true,
        })
      case 'json':
        return exportToJSON(activePalette, baseOptions)
      case 'typescript':
        return exportToTypeScript(activePalette, baseOptions)
      case 'figma':
        return exportToFigmaTokens(activePalette, {
          ...baseOptions,
          includeDescription: true,
          groupByCategory: true,
        })
      default:
        return exportToCSS(activePalette, {
          ...baseOptions,
          useCustomProperties: true,
          selector: ':root',
        })
    }
  }

  const exportResult = getExportContent()

  const handleCopy = async () => {
    const success = await copyToClipboard(exportResult.content)
    if (success) {
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    downloadFile(exportResult.content, exportResult.filename, exportResult.mimeType)
    toast.success(`Downloaded ${exportResult.filename}`)
  }

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={closeModal}
      title="Export Palette"
      description={`Export "${activePalette.name}" in your preferred format`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Format tabs */}
        <Tabs value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="css" className="flex-1">CSS</TabsTrigger>
            <TabsTrigger value="scss" className="flex-1">SCSS</TabsTrigger>
            <TabsTrigger value="tailwind" className="flex-1">Tailwind</TabsTrigger>
            <TabsTrigger value="json" className="flex-1">JSON</TabsTrigger>
            <TabsTrigger value="typescript" className="flex-1">TypeScript</TabsTrigger>
            <TabsTrigger value="figma" className="flex-1">Figma</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Variable Prefix
            </label>
            <Input
              value={exportPrefix}
              onChange={(e) => setExportPrefix(e.target.value)}
              placeholder="color"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="includeComments"
              checked={includeComments}
              onChange={(e) => setIncludeComments(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="includeComments" className="text-sm">
              Include comments
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Preview</label>
            <span className="text-xs text-muted-foreground">
              {exportResult.filename}
            </span>
          </div>
          <div className="relative">
            <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-auto max-h-80 text-foreground">
              {exportResult.content}
            </pre>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </ModalFooter>
    </Modal>
  )
}
