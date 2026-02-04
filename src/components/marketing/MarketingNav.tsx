import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '../ui/Button'
import { usePreferencesStore } from '../../stores/preferencesStore'

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = usePreferencesStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl">Tynte</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/app">
              <Button>Launch Tynte</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              title={`Current theme: ${theme}`}
              aria-label={`Switch theme (current: ${theme})`}
            >
              {getThemeIcon()}
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
