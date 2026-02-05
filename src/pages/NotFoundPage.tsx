import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Palette } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useEffect } from 'react'

export function NotFoundPage() {
  const { initializeTheme, theme } = usePreferencesStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const gradient = isDark
    ? 'linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6)'
    : 'linear-gradient(to right, #8b5cf6, #6217c7, #4c1d95)'

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden relative">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-15 blur-3xl"
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
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Palette className="h-16 w-16 text-primary dark:text-violet-400 mx-auto mb-6" />
        </motion.div>

        <motion.h1
          className="text-8xl sm:text-9xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: gradient }}
          >
            404
          </span>
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-3xl font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Page not found
        </motion.h2>

        <motion.p
          className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/">
            <Button size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Launch App
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
