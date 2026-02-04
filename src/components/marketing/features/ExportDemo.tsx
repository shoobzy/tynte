import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs'
import { Button } from '../../ui/Button'

const cssOutput = `--primary-50: #f5f3ff;
--primary-100: #ede9fe;
--primary-200: #ddd6fe;
--primary-300: #c4b5fd;
--primary-400: #a78bfa;
--primary-500: #8b5cf6;
--primary-600: #6217c7;
--primary-700: #6d28d9;
--primary-800: #5b21b6;
--primary-900: #4c1d95;
--primary-950: #2e1065;`

const tailwindOutput = `primary: {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#6217c7',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
},`

const scssOutput = `$primary-50: #f5f3ff;
$primary-100: #ede9fe;
$primary-200: #ddd6fe;
$primary-300: #c4b5fd;
$primary-400: #a78bfa;
$primary-500: #8b5cf6;
$primary-600: #6217c7;
$primary-700: #6d28d9;
$primary-800: #5b21b6;
$primary-900: #4c1d95;
$primary-950: #2e1065;`

const figmaOutput = `{
  "primary": {
    "500": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.545, 0.361, 0.965],
        "hex": "#8b5cf6"
      }
    },
    "600": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.384, 0.090, 0.780],
        "hex": "#6217c7"
      }
    }
  }
}`

export function ExportDemo() {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const handleCopy = (text: string, tab: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTab(tab)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <Tabs defaultValue="css">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
          <TabsTrigger value="scss">SCSS</TabsTrigger>
          <TabsTrigger value="figma">Figma</TabsTrigger>
        </TabsList>

        <TabsContent value="css">
          <CodeBlock
            code={cssOutput}
            onCopy={() => handleCopy(cssOutput, 'css')}
            copied={copiedTab === 'css'}
          />
        </TabsContent>

        <TabsContent value="tailwind">
          <CodeBlock
            code={tailwindOutput}
            onCopy={() => handleCopy(tailwindOutput, 'tailwind')}
            copied={copiedTab === 'tailwind'}
          />
        </TabsContent>

        <TabsContent value="scss">
          <CodeBlock
            code={scssOutput}
            onCopy={() => handleCopy(scssOutput, 'scss')}
            copied={copiedTab === 'scss'}
          />
        </TabsContent>

        <TabsContent value="figma">
          <CodeBlock
            code={figmaOutput}
            onCopy={() => handleCopy(figmaOutput, 'figma')}
            copied={copiedTab === 'figma'}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CodeBlock({
  code,
  onCopy,
  copied,
}: {
  code: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="relative">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <motion.div
        className="absolute top-2 right-2"
        initial={false}
        animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          leftIcon={
            copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )
          }
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </motion.div>
    </div>
  )
}
