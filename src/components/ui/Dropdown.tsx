import { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value)
      const nextIndex = (currentIndex + 1) % options.length
      onChange(options[nextIndex].value)
    } else if (e.key === 'ArrowUp' && isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value)
      const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
      onChange(options[prevIndex].value)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full
          h-10 px-3 py-2
          text-sm rounded-md border border-input
          bg-background
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${isOpen ? 'ring-2 ring-ring ring-offset-2' : ''}
        `}
      >
        <span className={`flex items-center gap-2 ${!selectedOption ? 'text-muted-foreground' : ''}`}>
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className={`
              absolute z-50 w-full mt-1
              bg-card border border-border rounded-md shadow-lg
              py-1 max-h-60 overflow-auto
            `}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value)
                    setIsOpen(false)
                  }
                }}
                disabled={option.disabled}
                className={`
                  flex items-center justify-between w-full
                  px-3 py-2 text-sm
                  hover:bg-accent hover:text-accent-foreground
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${option.value === value ? 'bg-accent/50' : ''}
                `}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
}

export function DropdownMenu({ trigger, children, align = 'end' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: align === 'end' ? rect.right - 180 : rect.left,
      })
    }
  }, [isOpen, align])

  return (
    <div ref={triggerRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
              }}
              className="z-[100] min-w-[180px] bg-card border border-border rounded-md shadow-lg py-1"
              onClick={() => setIsOpen(false)}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  destructive?: boolean
}

export function DropdownItem({
  onClick,
  children,
  className = '',
  destructive = false,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 w-full px-3 py-2 text-sm
        hover:bg-accent hover:text-accent-foreground
        ${destructive ? 'text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="h-px bg-border my-1" />
}
