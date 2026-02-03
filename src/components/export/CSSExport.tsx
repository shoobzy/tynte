import { useState } from 'react'
import { Copy, Download, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Dropdown } from '../ui/Dropdown'
import { useToast } from '../ui/Toast'
import { usePaletteStore } from '../../stores/paletteStore'
import { exportToCSS, exportToSCSS } from '../../utils/export/css'
import { copyToClipboard, downloadFile } from '../../utils/helpers'

type CSSFormat = 'css' | 'scss'
type ColourFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

const formatOptions = [
  { value: 'css', label: 'CSS Custom Properties' },
  { value: 'scss', label: 'SCSS Variables' },
]

const colourFormatOptions = [
  { value: 'hex', label: 'HEX (#ffffff)' },
  { value: 'rgb', label: 'RGB (rgb(255, 255, 255))' },
  { value: 'hsl', label: 'HSL (hsl(0, 0%, 100%))' },
  { value: 'oklch', label: 'OKLCH (oklch(100% 0 0))' },
]

export function CSSExport() {
  const { palettes, activePaletteId } = usePaletteStore()
  const toast = useToast()

  const [cssFormat, setCssFormat] = useState<CSSFormat>('css')
  const [colourFormat, setColourFormat] = useState<ColourFormat>('hex')
  const [prefix, setPrefix] = useState('color')
  const [selector, setSelector] = useState(':root')
  const [includeComments, setIncludeComments] = useState(true)
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
    format: cssFormat as 'css' | 'scss',
    includeComments,
    prefix,
    colorFormat: colourFormat,
    includeScale: true,
    darkMode: false,
    useCustomProperties: true,
    selector,
  }

  const exportResult = cssFormat === 'scss'
    ? exportToSCSS(activePalette, options)
    : exportToCSS(activePalette, options)

  const handleCopy = async () => {
    const success = await copyToClipboard(exportResult.content)
    if (success) {
      setCopied(true)
      toast.success('CSS copied to clipboard')
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Dropdown
            options={formatOptions}
            value={cssFormat}
            onChange={(v) => setCssFormat(v as CSSFormat)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Colour Format</label>
          <Dropdown
            options={colourFormatOptions}
            value={colourFormat}
            onChange={(v) => setColourFormat(v as ColourFormat)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Variable Prefix</label>
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="color"
          />
        </div>

        {cssFormat === 'css' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selector</label>
            <Input
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder=":root"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="comments"
          checked={includeComments}
          onChange={(e) => setIncludeComments(e.target.checked)}
          className="rounded border-border"
        />
        <label htmlFor="comments" className="text-sm">
          Include comments
        </label>
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
