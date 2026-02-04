import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative rounded-3xl bg-primary/5 border border-primary/10 p-8 sm:p-12 text-center overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to build better palettes?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Start creating accessible, professional colour palettes for your next project.
              No sign-up required.
            </p>
            <Link to="/app">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Launch Tynte
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
