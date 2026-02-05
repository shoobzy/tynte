import { useEffect, lazy, Suspense } from 'react'
import { Layout } from './components/layout/Layout'
import { PaletteManager } from './components/palette/PaletteManager'
import { ExportModal } from './components/export/ExportModal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs'
import { usePreferencesStore } from './stores/preferencesStore'
import { useUIStore } from './stores/uiStore'

// Lazy load heavy components for code splitting
const ContrastChecker = lazy(() => import('./components/accessibility/ContrastChecker').then(m => ({ default: m.ContrastChecker })))
const ContrastMatrix = lazy(() => import('./components/accessibility/ContrastMatrix').then(m => ({ default: m.ContrastMatrix })))
const ColourblindSimulator = lazy(() => import('./components/accessibility/ColourblindSimulator').then(m => ({ default: m.ColourblindSimulator })))
const AccessibilityReport = lazy(() => import('./components/accessibility/AccessibilityReport').then(m => ({ default: m.AccessibilityReport })))
const HarmonyGenerator = lazy(() => import('./components/generators/HarmonyGenerator').then(m => ({ default: m.HarmonyGenerator })))
const ScaleGenerator = lazy(() => import('./components/generators/ScaleGenerator').then(m => ({ default: m.ScaleGenerator })))
const GradientGenerator = lazy(() => import('./components/generators/GradientGenerator').then(m => ({ default: m.GradientGenerator })))
const ImageExtractor = lazy(() => import('./components/generators/ImageExtractor').then(m => ({ default: m.ImageExtractor })))
const ComponentPreview = lazy(() => import('./components/preview/ComponentPreview').then(m => ({ default: m.ComponentPreview })))
const CSSExport = lazy(() => import('./components/export/CSSExport').then(m => ({ default: m.CSSExport })))
const TailwindExport = lazy(() => import('./components/export/TailwindExport').then(m => ({ default: m.TailwindExport })))
const FigmaExport = lazy(() => import('./components/export/FigmaExport').then(m => ({ default: m.FigmaExport })))

// Loading fallback for lazy components
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  )
}

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
                <Suspense fallback={<LoadingFallback />}>
                  <ContrastChecker />
                </Suspense>
              </TabsContent>
              <TabsContent value="matrix">
                <Suspense fallback={<LoadingFallback />}>
                  <ContrastMatrix />
                </Suspense>
              </TabsContent>
              <TabsContent value="colourblind">
                <Suspense fallback={<LoadingFallback />}>
                  <ColourblindSimulator />
                </Suspense>
              </TabsContent>
              <TabsContent value="report">
                <Suspense fallback={<LoadingFallback />}>
                  <AccessibilityReport />
                </Suspense>
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
                <Suspense fallback={<LoadingFallback />}>
                  <HarmonyGenerator />
                </Suspense>
              </TabsContent>
              <TabsContent value="scale">
                <Suspense fallback={<LoadingFallback />}>
                  <ScaleGenerator />
                </Suspense>
              </TabsContent>
              <TabsContent value="gradient">
                <Suspense fallback={<LoadingFallback />}>
                  <GradientGenerator />
                </Suspense>
              </TabsContent>
              <TabsContent value="extract">
                <Suspense fallback={<LoadingFallback />}>
                  <ImageExtractor />
                </Suspense>
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
            <Suspense fallback={<LoadingFallback />}>
              <ComponentPreview />
            </Suspense>
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
                <Suspense fallback={<LoadingFallback />}>
                  <CSSExport />
                </Suspense>
              </TabsContent>
              <TabsContent value="tailwind">
                <Suspense fallback={<LoadingFallback />}>
                  <TailwindExport />
                </Suspense>
              </TabsContent>
              <TabsContent value="figma">
                <Suspense fallback={<LoadingFallback />}>
                  <FigmaExport />
                </Suspense>
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
