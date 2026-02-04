import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  valueFormat?: (value: number) => string
  className?: string
  disabled?: boolean
  gradient?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueFormat = (v) => v.toString(),
  className = '',
  disabled = false,
  gradient,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return

      const rect = trackRef.current.getBoundingClientRect()
      // Guard against zero-width track (can happen before layout is complete)
      if (rect.width === 0) return

      const x = clientX - rect.left
      const percent = Math.max(0, Math.min(1, x / rect.width))
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      onChange(clampedValue)
    },
    [min, max, step, onChange, disabled]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.touches[0].clientX)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      updateValue(e.touches[0].clientX)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, updateValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    let newValue = value

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, value - step)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, value + step)
        break
      case 'Home':
        newValue = min
        break
      case 'End':
        newValue = max
        break
      default:
        return
    }

    e.preventDefault()
    onChange(newValue)
  }

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-muted-foreground font-mono">
              {valueFormat(value)}
            </span>
          )}
        </div>
      )}

      {/* Outer container with padding to extend clickable area for thumb at edges */}
      <div
        className={`relative cursor-pointer px-2 -mx-2 py-2 -my-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
      <div
        ref={trackRef}
        className="relative h-2 rounded-full mx-2"
        style={{
          background: gradient || 'hsl(var(--muted))',
        }}
      >
        {/* Filled track */}
        {!gradient && (
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        )}

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${percentage}%` }}
        >
          <motion.div
            className={`
              w-4 h-4 rounded-full bg-white border-2 border-primary
              shadow-sm
              ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}
            `}
            animate={{ scale: isDragging ? 0.95 : 1 }}
            whileHover={disabled ? {} : { scale: 1.1 }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
      </div>
    </div>
  )
}

interface RangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
  disabled?: boolean
}

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = '',
  disabled = false,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null)

  const percentages = [
    ((value[0] - min) / (max - min)) * 100,
    ((value[1] - min) / (max - min)) * 100,
  ]

  const updateValue = useCallback(
    (clientX: number, thumb: 0 | 1) => {
      if (!trackRef.current || disabled) return

      const rect = trackRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percent = Math.max(0, Math.min(1, x / rect.width))
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      const newValue: [number, number] = [...value] as [number, number]

      if (thumb === 0) {
        newValue[0] = Math.min(clampedValue, value[1])
      } else {
        newValue[1] = Math.max(clampedValue, value[0])
      }

      onChange(newValue)
    },
    [min, max, step, value, onChange, disabled]
  )

  const handleMouseDown =
    (thumb: 0 | 1) => (e: React.MouseEvent) => {
      if (disabled) return
      setActiveThumb(thumb)
      updateValue(e.clientX, thumb)
    }

  useEffect(() => {
    if (activeThumb === null) return

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, activeThumb)
    }

    const handleEnd = () => {
      setActiveThumb(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }, [activeThumb, updateValue])

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <span className="text-sm text-muted-foreground font-mono">
            {value[0]} - {value[1]}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        className={`
          relative h-2 bg-muted rounded-full
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        {/* Selected range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${percentages[0]}%`,
            width: `${percentages[1] - percentages[0]}%`,
          }}
        />

        {/* Thumbs */}
        {[0, 1].map((thumb) => (
          <div
            key={thumb}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${percentages[thumb]}%` }}
            onMouseDown={handleMouseDown(thumb as 0 | 1)}
          >
            <motion.div
              className={`
                w-4 h-4 rounded-full bg-white border-2 border-primary
                shadow-sm
                ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}
              `}
              whileHover={disabled ? {} : { scale: 1.1 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
