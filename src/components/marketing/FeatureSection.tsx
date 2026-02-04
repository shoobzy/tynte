import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { usePreferencesStore } from '../../stores/preferencesStore'

interface FeatureSectionProps {
  title: string
  description: string
  children: ReactNode
  reversed?: boolean
}

export function FeatureSection({
  title,
  description,
  children,
  reversed = false,
}: FeatureSectionProps) {
  const { theme } = usePreferencesStore()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const gradient = isDark
    ? 'linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6)'
    : 'linear-gradient(to right, #8b5cf6, #6217c7, #4c1d95)'

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: gradient }}
              >
                {title.split(' ')[0]}
              </span>{' '}
              {title.split(' ').slice(1).join(' ')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {description}
            </p>
          </motion.div>

          {/* Demo content with hover effect */}
          <motion.div
            className="flex-1 w-full max-w-xl lg:max-w-none"
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="relative group"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow effect on hover */}
              <div
                className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
                style={{ backgroundColor: '#6217c720' }}
              />
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
