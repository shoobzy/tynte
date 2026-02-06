import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Check, Palette, Copy, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { usePreferencesStore } from '../../stores/preferencesStore'

const heroColours = [
  '#6217c7', // primary
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#3b82f6', // blue
]

// Violet scale for the shade preview
const violetScale = [
  { step: '50', colour: '#f5f3ff' },
  { step: '100', colour: '#ede9fe' },
  { step: '200', colour: '#ddd6fe' },
  { step: '300', colour: '#c4b5fd' },
  { step: '400', colour: '#a78bfa' },
  { step: '500', colour: '#8b5cf6' },
  { step: '600', colour: '#6217c7' },
  { step: '700', colour: '#5b21b6' },
  { step: '800', colour: '#4c1d95' },
  { step: '900', colour: '#3b1a7a' },
  { step: '950', colour: '#2e1065' },
]

export function HeroSection() {
  const { theme } = usePreferencesStore()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const titleGradient = isDark
    ? 'linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6)'
    : 'linear-gradient(to right, #8b5cf6, #6217c7, #4c1d95)'

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs with animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary purple orb */}
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6217c7 0%, transparent 70%)' }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Cyan orb */}
        <motion.div
          className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        {/* Pink orb */}
        <motion.div
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Grid pattern overlay with fade */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
      />

      {/* Bottom fade to blend with page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Floating UI elements - varied movement for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating WCAG badge - top right (foreground - large movement, fast) */}
        <motion.div
          className="absolute top-[18%] right-[18%] hidden lg:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [0, -18, 0],
            x: [0, 8, 0],
          }}
          transition={{
            opacity: { delay: 1.2, duration: 0.5 },
            y: { delay: 1.2, duration: 3, repeat: Infinity, ease: 'easeInOut' },
            x: { delay: 1.2, duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium">WCAG AAA</p>
                <p className="text-[10px] text-muted-foreground">Contrast: 7.2:1</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Figma badge - left (midground - medium movement) */}
        <motion.div
          className="absolute top-[30%] left-[15%] hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: [0, 5, 0],
            y: [0, 10, 0],
          }}
          transition={{
            opacity: { delay: 1.4, duration: 0.5 },
            x: { delay: 1.4, duration: 7, repeat: Infinity, ease: 'easeInOut' },
            y: { delay: 1.4, duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary dark:text-violet-400" />
              <span className="text-xs font-medium">Export to Figma</span>
            </div>
          </div>
        </motion.div>

        {/* Floating colour chips - right (background - small movement, slow) */}
        <motion.div
          className="absolute bottom-[35%] right-[15%] hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: 1,
            x: [0, -4, 0],
            rotate: [0, 1.5, 0],
          }}
          transition={{
            opacity: { delay: 1.6, duration: 0.5 },
            x: { delay: 1.6, duration: 9, repeat: Infinity, ease: 'easeInOut' },
            rotate: { delay: 1.6, duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-md">
            <div className="flex gap-1.5">
              {['#6217c7', '#8b5cf6', '#a78bfa'].map((colour, i) => (
                <motion.div
                  key={colour}
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: colour }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.8 + i * 0.1 }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">primary scale</p>
          </div>
        </motion.div>

        {/* Floating buttons - bottom left (foreground - large movement) */}
        <motion.div
          className="absolute bottom-[32%] left-[18%] hidden lg:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [0, -14, 0],
            x: [0, 6, 0],
          }}
          transition={{
            opacity: { delay: 1.3, duration: 0.5 },
            y: { delay: 1.3, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            x: { delay: 1.3, duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-lg shadow-xl text-center">
              Primary Button
            </div>
            <div className="bg-card border border-border text-xs font-medium px-4 py-2 rounded-lg shadow-xl text-center">
              Secondary
            </div>
          </div>
        </motion.div>

        {/* Gradient bar - top left (midground - more movement) */}
        <motion.div
          className="absolute top-[25%] left-[28%] hidden xl:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -12, 0],
            x: [0, 8, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            opacity: { delay: 1.5, duration: 0.5 },
            y: { delay: 1.5, duration: 5, repeat: Infinity, ease: 'easeInOut' },
            x: { delay: 1.5, duration: 6, repeat: Infinity, ease: 'easeInOut' },
            rotate: { delay: 1.5, duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-md">
            <div
              className="w-24 h-6 rounded-lg"
              style={{
                background: 'linear-gradient(to right, #6217c7, #ec4899, #06b6d4)',
              }}
            />
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">gradient</p>
          </div>
        </motion.div>

        {/* Harmony badge - top center-right (midground - medium movement) */}
        <motion.div
          className="absolute top-[12%] right-[30%] hidden xl:block"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: [0, 12, 0],
            x: [0, -6, 0],
          }}
          transition={{
            opacity: { delay: 1.7, duration: 0.5 },
            y: { delay: 1.7, duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            x: { delay: 1.7, duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary dark:text-violet-400" />
              <span className="text-xs font-medium">Triadic</span>
            </div>
            <div className="flex gap-1 mt-2">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#6217c7' }} />
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#c71762' }} />
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#17c762' }} />
            </div>
          </div>
        </motion.div>

        {/* Copy notification - bottom center-right (foreground - quick, snappy) */}
        <motion.div
          className="absolute bottom-[28%] right-[25%] hidden xl:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: 1,
            x: [0, 10, 0],
            y: [0, -12, 0],
          }}
          transition={{
            opacity: { delay: 1.9, duration: 0.5 },
            x: { delay: 1.9, duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            y: { delay: 1.9, duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-medium">#6217c7 copied!</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="block">Build</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: titleGradient }}
              >
                beautiful palettes
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Professional colour palette generator with built-in accessibility checking,
            intelligent shade generation, and seamless exports.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/app">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Launch Tynte
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={scrollToFeatures}>
              See Features
            </Button>
          </motion.div>
        </div>

        {/* Showcases - hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Colour palette showcase */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 blur-3xl -z-10 scale-110"
              style={{
                background: 'linear-gradient(to right, rgba(98, 23, 199, 0.15), rgba(139, 92, 246, 0.15))',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Palette card */}
            <motion.div
              className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Palette header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">My Palette</span>
              </div>

              {/* Main colour swatches */}
              <div className="grid grid-cols-6 gap-2">
                {heroColours.map((colour, index) => (
                  <motion.div
                    key={colour}
                    className="aspect-square rounded-xl shadow-md cursor-pointer"
                    style={{ backgroundColor: colour }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Shade scale showcase */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 blur-3xl -z-10 scale-110"
              style={{
                background: 'linear-gradient(to right, rgba(139, 92, 246, 0.15), rgba(76, 29, 149, 0.15))',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />

            {/* Scale card */}
            <motion.div
              className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            >
              {/* Scale header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground font-mono">Violet Scale</span>
                <span className="text-xs text-muted-foreground">50 → 950</span>
              </div>

              {/* Shade scale preview */}
              <div className="flex gap-1 rounded-xl overflow-hidden">
                {violetScale.map((shade, index) => (
                  <motion.div
                    key={shade.step}
                    className="flex-1 h-16 relative group cursor-pointer"
                    style={{ backgroundColor: shade.colour }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    whileHover={{ scaleY: 1.1 }}
                  />
                ))}
              </div>

              {/* Labels */}
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] text-muted-foreground font-mono">50</span>
                <span className="text-[10px] text-muted-foreground font-mono">500</span>
                <span className="text-[10px] text-muted-foreground font-mono">950</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={scrollToFeatures}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 0.5 },
          y: { delay: 2, duration: 1.5, repeat: Infinity },
        }}
        aria-label="Scroll to features"
      >
        <ChevronDown className="h-8 w-8" />
      </motion.button>
    </section>
  )
}
