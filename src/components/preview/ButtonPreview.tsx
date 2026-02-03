import { useState, ReactNode } from 'react'
import { Plus, Heart, Download, ArrowRight, Loader2 } from 'lucide-react'

interface ButtonPreviewProps {
  darkMode: boolean
}

// Interactive button that shows hover/active states using palette colours
interface PreviewButtonProps {
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  outline?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'md' | 'full'
  children: ReactNode
  className?: string
}

function PreviewButton({
  variant,
  outline = false,
  disabled = false,
  size = 'md',
  rounded = 'md',
  children,
  className = '',
}: PreviewButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const getBackgroundColor = () => {
    if (outline) return 'transparent'
    if (disabled) return `var(--preview-${variant})`
    if (isActive) return `var(--preview-${variant}-active)`
    if (isHovered) return `var(--preview-${variant}-hover)`
    return `var(--preview-${variant})`
  }

  const getBorderColor = () => {
    if (!outline) return 'transparent'
    if (isActive) return `var(--preview-${variant}-active)`
    if (isHovered) return `var(--preview-${variant}-hover)`
    return `var(--preview-${variant})`
  }

  const getTextColor = () => {
    if (outline) {
      if (isActive) return `var(--preview-${variant}-active)`
      if (isHovered) return `var(--preview-${variant}-hover)`
      return `var(--preview-${variant})`
    }
    return `var(--preview-${variant}-foreground)`
  }

  return (
    <button
      className={`rounded-${rounded} font-medium transition-all duration-150 ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${outline ? 'border-2' : ''} ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        borderColor: getBorderColor(),
        transform: isActive && !disabled ? 'scale(0.98)' : 'scale(1)',
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsActive(false)
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function ButtonPreview(_props: ButtonPreviewProps) {
  return (
    <div className="space-y-8">
      {/* Primary Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Primary Buttons
          <span className="ml-2 text-xs font-normal opacity-60">(hover to see colour variants)</span>
        </h4>
        <div className="flex flex-wrap gap-3">
          <PreviewButton variant="primary">Primary</PreviewButton>
          <PreviewButton variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            With Icon
          </PreviewButton>
          <PreviewButton variant="primary" className="flex items-center gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </PreviewButton>
          <PreviewButton variant="primary" disabled>
            Disabled
          </PreviewButton>
          <PreviewButton variant="primary" className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading
          </PreviewButton>
        </div>
      </div>

      {/* Secondary Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Secondary Buttons
        </h4>
        <div className="flex flex-wrap gap-3">
          <PreviewButton variant="secondary">Secondary</PreviewButton>
          <PreviewButton variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </PreviewButton>
        </div>
      </div>

      {/* Accent Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Accent Buttons
        </h4>
        <div className="flex flex-wrap gap-3">
          <PreviewButton variant="accent">Accent</PreviewButton>
          <PreviewButton variant="accent" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favourite
          </PreviewButton>
        </div>
      </div>

      {/* Outline Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Outline Buttons
        </h4>
        <div className="flex flex-wrap gap-3">
          <PreviewButton variant="primary" outline>Outline Primary</PreviewButton>
          <PreviewButton variant="secondary" outline>Outline Secondary</PreviewButton>
          <PreviewButton variant="accent" outline>Outline Accent</PreviewButton>
        </div>
      </div>

      {/* Semantic Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Semantic Buttons
        </h4>
        <div className="flex flex-wrap gap-3">
          <PreviewButton variant="success">Success</PreviewButton>
          <PreviewButton variant="warning">Warning</PreviewButton>
          <PreviewButton variant="error">Error</PreviewButton>
          <PreviewButton variant="info">Info</PreviewButton>
        </div>
      </div>

      {/* Button Sizes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Button Sizes
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <PreviewButton variant="primary" size="sm">Small</PreviewButton>
          <PreviewButton variant="primary" size="md">Medium</PreviewButton>
          <PreviewButton variant="primary" size="lg">Large</PreviewButton>
        </div>
      </div>

      {/* Icon Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Icon Buttons
        </h4>
        <div className="flex flex-wrap gap-3">
          <PreviewButton variant="primary" className="!px-2">
            <Heart className="h-5 w-5" />
          </PreviewButton>
          <PreviewButton variant="secondary" className="!px-2">
            <Plus className="h-5 w-5" />
          </PreviewButton>
          <PreviewButton variant="accent" rounded="full" className="!px-2">
            <Download className="h-5 w-5" />
          </PreviewButton>
          <PreviewButton variant="error" className="!px-2">
            <Heart className="h-5 w-5" />
          </PreviewButton>
        </div>
      </div>
    </div>
  )
}
