import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { PaletteManager } from './components/palette/PaletteManager'
import { ContrastChecker } from './components/accessibility/ContrastChecker'
import { ContrastMatrix } from './components/accessibility/ContrastMatrix'
import { ColourblindSimulator } from './components/accessibility/ColourblindSimulator'
import { AccessibilityReport } from './components/accessibility/AccessibilityReport'
import { HarmonyGenerator } from './components/generators/HarmonyGenerator'
import { ScaleGenerator } from './components/generators/ScaleGenerator'
import { GradientGenerator } from './components/generators/GradientGenerator'
import { ImageExtractor } from './components/generators/ImageExtractor'
import { ComponentPreview } from './components/preview/ComponentPreview'
import { CSSExport } from './components/export/CSSExport'
import { TailwindExport } from './components/export/TailwindExport'
import { FigmaExport } from './components/export/FigmaExport'
import { ExportModal } from './components/export/ExportModal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs'
import { usePreferencesStore } from './stores/preferencesStore'
import { useUIStore } from './stores/uiStore'

function App() {
  const { initializeTheme } = usePreferencesStore()
  const { currentView, accessibilityTab, setAccessibilityTab, generatorTab, setGeneratorTab } = useUIStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  const renderView = () => {
    switch (currentView) {
      case 'palette':
        return <PaletteManager />

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Accessibility Tools</h2>
              <p className="text-muted-foreground">
                Check contrast ratios and colour blindness compatibility
              </p>
            </div>
            <Tabs value={accessibilityTab} onValueChange={(v) => setAccessibilityTab(v as any)}>
              <TabsList>
                <TabsTrigger value="contrast">Contrast Checker</TabsTrigger>
                <TabsTrigger value="matrix">Contrast Matrix</TabsTrigger>
                <TabsTrigger value="colourblind">Colourblind Simulator</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
              </TabsList>
              <TabsContent value="contrast">
                <ContrastChecker />
              </TabsContent>
              <TabsContent value="matrix">
                <ContrastMatrix />
              </TabsContent>
              <TabsContent value="colourblind">
                <ColourblindSimulator />
              </TabsContent>
              <TabsContent value="report">
                <AccessibilityReport />
              </TabsContent>
            </Tabs>
          </div>
        )

      case 'generators':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Colour Generators</h2>
              <p className="text-muted-foreground">
                Generate harmonies, scales, gradients, and extract colours from images
              </p>
            </div>
            <Tabs value={generatorTab} onValueChange={(v) => setGeneratorTab(v as any)}>
              <TabsList>
                <TabsTrigger value="harmony">Harmony</TabsTrigger>
                <TabsTrigger value="scale">Scale</TabsTrigger>
                <TabsTrigger value="gradient">Gradient</TabsTrigger>
                <TabsTrigger value="extract">Image Extract</TabsTrigger>
              </TabsList>
              <TabsContent value="harmony">
                <HarmonyGenerator />
              </TabsContent>
              <TabsContent value="scale">
                <ScaleGenerator />
              </TabsContent>
              <TabsContent value="gradient">
                <GradientGenerator />
              </TabsContent>
              <TabsContent value="extract">
                <ImageExtractor />
              </TabsContent>
            </Tabs>
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Component Preview</h2>
              <p className="text-muted-foreground">
                See how your palette looks on real UI components
              </p>
            </div>
            <ComponentPreview />
          </div>
        )

      case 'export':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Export Palette</h2>
              <p className="text-muted-foreground">
                Export your palette in various formats
              </p>
            </div>
            <Tabs defaultValue="css">
              <TabsList>
                <TabsTrigger value="css">CSS / SCSS</TabsTrigger>
                <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                <TabsTrigger value="figma">Design Tokens</TabsTrigger>
              </TabsList>
              <TabsContent value="css">
                <CSSExport />
              </TabsContent>
              <TabsContent value="tailwind">
                <TailwindExport />
              </TabsContent>
              <TabsContent value="figma">
                <FigmaExport />
              </TabsContent>
            </Tabs>
          </div>
        )

      default:
        return <PaletteManager />
    }
  }

  return (
    <Layout>
      {renderView()}
      <ExportModal />
    </Layout>
  )
}

export default App
