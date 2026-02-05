import { motion } from 'framer-motion'
import { Blend, CloudOff, Moon, Zap } from 'lucide-react'

const highlights = [
  {
    icon: Blend,
    title: 'OKLCH Colour Space',
    description:
      'Perceptually uniform colour model ensures your shades look evenly spaced to the human eye.',
  },
  {
    icon: CloudOff,
    title: 'Works Offline',
    description:
      'No account required. Your palettes are stored locally in your browser, keeping your data private.',
  },
  {
    icon: Moon,
    title: 'Dark Mode Ready',
    description:
      'All tools and previews work seamlessly in both light and dark themes out of the box.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description:
      'See contrast ratios, accessibility scores, and colour previews update in real-time as you work.',
  },
]

export function FeatureHighlights() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative group h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

              <div className="relative h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300 flex flex-col">
                <div className="mb-4">
                  <div className="inline-flex p-2.5 rounded-xl bg-primary/10 text-primary dark:text-violet-400">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>

                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
