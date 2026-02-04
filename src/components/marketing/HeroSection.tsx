import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'

const floatingSwatches = [
  { colour: '#6217c7', delay: 0, x: '10%', y: '20%' },
  { colour: '#06b6d4', delay: 0.2, x: '80%', y: '15%' },
  { colour: '#f59e0b', delay: 0.4, x: '75%', y: '70%' },
  { colour: '#10b981', delay: 0.6, x: '15%', y: '65%' },
  { colour: '#ec4899', delay: 0.8, x: '60%', y: '30%' },
  { colour: '#8b5cf6', delay: 1.0, x: '25%', y: '80%' },
  { colour: '#3b82f6', delay: 1.2, x: '85%', y: '45%' },
]

export function HeroSection() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated floating swatches background */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingSwatches.map((swatch, index) => (
          <motion.div
            key={index}
            className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-2xl opacity-20 dark:opacity-10"
            style={{
              backgroundColor: swatch.colour,
              left: swatch.x,
              top: swatch.y,
            }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-20, 20, -20],
              y: [0, -20, 0],
            }}
            transition={{
              delay: swatch.delay,
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Build accessible colour palettes
            <br />
            <span className="text-primary dark:text-violet-500">that work everywhere</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Design system tool with built-in accessibility checking, intelligent shade generation,
          and seamless exports to CSS, Tailwind, and more.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
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

      {/* Scroll indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={scrollToFeatures}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          y: { delay: 1.5, duration: 1.5, repeat: Infinity },
        }}
        aria-label="Scroll to features"
      >
        <ChevronDown className="h-8 w-8" />
      </motion.button>
    </section>
  )
}
