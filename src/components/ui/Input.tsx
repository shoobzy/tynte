import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`
              flex h-10 w-full rounded-md border bg-background
              px-3 py-2 text-sm
              file:border-0 file:bg-transparent file:text-sm file:font-medium
              placeholder:text-muted-foreground
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || isPassword ? 'pr-10' : ''}
              ${error ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, hint, fullWidth = false, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={`
            flex min-h-[80px] w-full rounded-md border bg-background
            px-3 py-2 text-sm
            placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}
            ${className}
          `}
          {...props}
        />

        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface ColourInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export function ColourInput({
  value,
  onChange,
  className = '',
  ...props
}: ColourInputProps) {
  const handleColourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow typing without # prefix
    if (inputValue.startsWith('#')) {
      onChange(inputValue)
    } else {
      onChange(`#${inputValue}`)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={handleColourChange}
          className="w-10 h-10 rounded-md border border-input cursor-pointer bg-transparent"
          {...props}
        />
      </div>
      <Input
        type="text"
        value={value}
        onChange={handleTextChange}
        maxLength={7}
        className="font-mono uppercase flex-1"
        {...props}
      />
    </div>
  )
}
