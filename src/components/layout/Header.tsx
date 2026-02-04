import { Sun, Moon, Menu, Download, Plus, Monitor } from 'lucide-react'
import { Button } from '../ui/Button'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { useUIStore } from '../../stores/uiStore'
import { usePaletteStore } from '../../stores/paletteStore'
import { DropdownMenu, DropdownItem } from '../ui/Dropdown'

export function Header() {
  const { theme, setTheme } = usePreferencesStore()
  const { toggleSidebar, openModal } = useUIStore()
  const { createPalette, palettes, activePaletteId } = usePaletteStore()

  const activePalette = palettes.find((p) => p.id === activePaletteId)

  const handleNewPalette = () => {
    createPalette(`Palette ${palettes.length + 1}`)
  }

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    if (theme === 'light') return <Sun className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
            title="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <h1 className="font-semibold text-lg hidden sm:block">Tynte</h1>
          </div>

          {activePalette && (
            <>
              <span className="text-muted-foreground hidden sm:block">/</span>
              <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
                {activePalette.name}
              </span>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewPalette}
            className="hidden sm:flex"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Palette
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNewPalette}
            className="sm:hidden"
            title="New palette"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {activePalette && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal('export')}
              className="hidden sm:flex"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}

          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" title="Theme">
                {getThemeIcon()}
              </Button>
            }
          >
            <DropdownItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4" />
              Light
              {theme === 'light' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownItem>
            <DropdownItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4" />
              Dark
              {theme === 'dark' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownItem>
            <DropdownItem onClick={() => setTheme('system')}>
              <Monitor className="h-4 w-4" />
              System
              {theme === 'system' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
