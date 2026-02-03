import { Mail, Lock, Search } from 'lucide-react'

interface FormPreviewProps {
  darkMode: boolean
}

export function FormPreview(_props: FormPreviewProps) {
  return (
    <div className="space-y-8 max-w-md">
      {/* Text Inputs */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Text Inputs
        </h4>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--preview-muted-foreground)' }}
            />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--preview-background)',
                border: `1px solid var(--preview-border)`,
                color: 'var(--preview-foreground)',
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--preview-muted-foreground)' }}
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--preview-background)',
                border: `1px solid var(--preview-border)`,
                color: 'var(--preview-foreground)',
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--preview-muted-foreground)' }}
            />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--preview-muted)',
                border: `1px solid var(--preview-border)`,
                color: 'var(--preview-foreground)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Input States */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Input States
        </h4>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
            Focused
          </label>
          <input
            type="text"
            placeholder="Focused input"
            className="w-full px-4 py-2 rounded-md text-sm outline-none transition-colors ring-2"
            style={{
              backgroundColor: 'var(--preview-background)',
              border: `1px solid var(--preview-primary)`,
              color: 'var(--preview-foreground)',
              ringColor: 'var(--preview-primary)',
              '--tw-ring-opacity': 0.2,
            } as React.CSSProperties}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-error)' }}>
            Error
          </label>
          <input
            type="text"
            placeholder="Invalid input"
            className="w-full px-4 py-2 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--preview-background)',
              border: `1px solid var(--preview-error)`,
              color: 'var(--preview-foreground)',
            }}
          />
          <p className="text-xs" style={{ color: 'var(--preview-error)' }}>
            This field is required
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-muted-foreground)' }}>
            Disabled
          </label>
          <input
            type="text"
            placeholder="Disabled input"
            disabled
            className="w-full px-4 py-2 rounded-md text-sm outline-none transition-colors opacity-50 cursor-not-allowed"
            style={{
              backgroundColor: 'var(--preview-muted)',
              border: `1px solid var(--preview-border)`,
              color: 'var(--preview-muted-foreground)',
            }}
          />
        </div>
      </div>

      {/* Checkbox and Radio */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Checkbox & Radio
        </h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              style={{
                accentColor: 'var(--preview-primary)',
              }}
              defaultChecked
            />
            <span className="text-sm" style={{ color: 'var(--preview-foreground)' }}>
              I agree to the terms
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded"
              style={{
                accentColor: 'var(--preview-primary)',
              }}
            />
            <span className="text-sm" style={{ color: 'var(--preview-foreground)' }}>
              Subscribe to newsletter
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="plan"
              className="w-4 h-4"
              style={{
                accentColor: 'var(--preview-primary)',
              }}
              defaultChecked
            />
            <span className="text-sm" style={{ color: 'var(--preview-foreground)' }}>
              Free Plan
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="plan"
              className="w-4 h-4"
              style={{
                accentColor: 'var(--preview-primary)',
              }}
            />
            <span className="text-sm" style={{ color: 'var(--preview-foreground)' }}>
              Pro Plan
            </span>
          </label>
        </div>
      </div>

      {/* Select */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Select
        </h4>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
            Country
          </label>
          <select
            className="w-full px-4 py-2 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--preview-background)',
              border: `1px solid var(--preview-border)`,
              color: 'var(--preview-foreground)',
            }}
          >
            <option>Select a country</option>
            <option>United Kingdom</option>
            <option>United States</option>
            <option>Canada</option>
            <option>Australia</option>
          </select>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
          Textarea
        </h4>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--preview-foreground)' }}>
            Message
          </label>
          <textarea
            placeholder="Enter your message..."
            rows={4}
            className="w-full px-4 py-2 rounded-md text-sm outline-none transition-colors resize-none"
            style={{
              backgroundColor: 'var(--preview-background)',
              border: `1px solid var(--preview-border)`,
              color: 'var(--preview-foreground)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
