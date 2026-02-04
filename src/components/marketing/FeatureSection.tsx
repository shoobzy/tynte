import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface FeatureSectionProps {
  title: string
  description: string
  children: ReactNode
  reversed?: boolean
}

export function FeatureSection({ title, description, children, reversed = false }: FeatureSectionProps) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col gap-12 lg:gap-16 items-center ${
            reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
        >
          {/* Text content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {description}
            </p>
          </motion.div>

          {/* Demo content */}
          <motion.div
            className="flex-1 w-full max-w-xl lg:max-w-none"
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
