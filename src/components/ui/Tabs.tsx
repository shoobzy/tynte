import { createContext, useContext, useState, ReactNode, useId } from 'react'
import { motion } from 'framer-motion'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
  layoutId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({
  defaultValue = '',
  value,
  onValueChange,
  children,
  className = '',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeTab = value ?? internalValue
  const uniqueId = useId()

  const setActiveTab = (tab: string) => {
    if (onValueChange) {
      onValueChange(tab)
    } else {
      setInternalValue(tab)
    }
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, layoutId: `tab-indicator-${uniqueId}` }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function TabsList({ children, className = '', style }: TabsListProps) {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        rounded-lg bg-muted p-1 text-muted-foreground
        ${className}
      `}
      role="tablist"
      style={style}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function TabsTrigger({
  value,
  children,
  className = '',
  disabled = false,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab, layoutId } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={`
        relative inline-flex items-center justify-center
        whitespace-nowrap rounded-md px-3 py-1.5
        text-sm font-medium transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'text-foreground' : 'hover:text-foreground'}
        ${className}
      `}
    >
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 bg-background rounded-md shadow-sm"
          transition={{ type: 'spring', duration: 0.3 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      role="tabpanel"
      className={`mt-4 focus-visible:outline-none ${className}`}
    >
      {children}
    </motion.div>
  )
}
