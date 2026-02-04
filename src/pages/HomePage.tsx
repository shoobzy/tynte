import { useEffect } from 'react'
import { usePreferencesStore } from '../stores/preferencesStore'
import {
  MarketingNav,
  HeroSection,
  FeatureSection,
  CTASection,
  Footer,
  AccessibilityDemo,
  ShadeGeneratorDemo,
  ExportDemo,
  ComponentPreviewDemo,
} from '../components/marketing'

export function HomePage() {
  const { initializeTheme } = usePreferencesStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      <main>
        <HeroSection />

        <div id="features" className="scroll-mt-20">
          {/* Feature 1: Accessibility First */}
          <FeatureSection
            title="Accessibility First"
            description="Check contrast ratios instantly against WCAG guidelines. Ensure your colour combinations are readable for everyone, with clear AA and AAA compliance indicators."
          >
            <AccessibilityDemo />
          </FeatureSection>

          {/* Feature 2: Intelligent Shade Generation */}
          <FeatureSection
            title="Intelligent Shade Generation"
            description="Generate perceptually uniform colour scales using OKLCH colour space. Create professional 50-950 shade ranges from any base colour with a single click."
            reversed
          >
            <ShadeGeneratorDemo />
          </FeatureSection>

          {/* Feature 3: Export Anywhere */}
          <FeatureSection
            title="Export Anywhere"
            description="Export your palettes to CSS custom properties, Tailwind config, SCSS variables, and more. Copy with one click and paste directly into your project."
          >
            <ExportDemo />
          </FeatureSection>

          {/* Feature 4: Preview Components */}
          <FeatureSection
            title="Preview Components"
            description="See how your palette looks on real UI components before committing. Toggle between light and dark modes to ensure your colours work in any context."
            reversed
          >
            <ComponentPreviewDemo />
          </FeatureSection>
        </div>

        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
