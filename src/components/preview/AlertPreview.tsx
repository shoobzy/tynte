import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

interface AlertPreviewProps {
  darkMode: boolean
}

export function AlertPreview({ darkMode }: AlertPreviewProps) {
  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{
          backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid var(--preview-success)`,
        }}
      >
        <CheckCircle
          className="h-5 w-5 flex-shrink-0"
          style={{ color: 'var(--preview-success)' }}
        />
        <div className="flex-1">
          <h4
            className="font-medium"
            style={{ color: 'var(--preview-success)' }}
          >
            Success
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--preview-foreground)', opacity: 0.8 }}
          >
            Your changes have been saved successfully.
          </p>
        </div>
        <button
          className="flex-shrink-0"
          style={{ color: 'var(--preview-success)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Error Alert */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{
          backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid var(--preview-error)`,
        }}
      >
        <AlertCircle
          className="h-5 w-5 flex-shrink-0"
          style={{ color: 'var(--preview-error)' }}
        />
        <div className="flex-1">
          <h4
            className="font-medium"
            style={{ color: 'var(--preview-error)' }}
          >
            Error
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--preview-foreground)', opacity: 0.8 }}
          >
            There was a problem processing your request. Please try again.
          </p>
        </div>
        <button
          className="flex-shrink-0"
          style={{ color: 'var(--preview-error)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Warning Alert */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{
          backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid var(--preview-warning)`,
        }}
      >
        <AlertTriangle
          className="h-5 w-5 flex-shrink-0"
          style={{ color: 'var(--preview-warning)' }}
        />
        <div className="flex-1">
          <h4
            className="font-medium"
            style={{ color: 'var(--preview-warning)' }}
          >
            Warning
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--preview-foreground)', opacity: 0.8 }}
          >
            Your session will expire in 5 minutes. Please save your work.
          </p>
        </div>
        <button
          className="flex-shrink-0"
          style={{ color: 'var(--preview-warning)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Info Alert */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{
          backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          border: `1px solid var(--preview-info)`,
        }}
      >
        <Info
          className="h-5 w-5 flex-shrink-0"
          style={{ color: 'var(--preview-info)' }}
        />
        <div className="flex-1">
          <h4
            className="font-medium"
            style={{ color: 'var(--preview-info)' }}
          >
            Information
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--preview-foreground)', opacity: 0.8 }}
          >
            A new version is available. Refresh to update.
          </p>
        </div>
        <button
          className="flex-shrink-0"
          style={{ color: 'var(--preview-info)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Inline Alerts */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div
          className="p-3 rounded-lg text-center"
          style={{
            backgroundColor: 'var(--preview-success)',
            color: 'var(--preview-success-foreground)',
          }}
        >
          <CheckCircle className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Saved</span>
        </div>
        <div
          className="p-3 rounded-lg text-center"
          style={{
            backgroundColor: 'var(--preview-error)',
            color: 'var(--preview-error-foreground)',
          }}
        >
          <AlertCircle className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Failed</span>
        </div>
        <div
          className="p-3 rounded-lg text-center"
          style={{
            backgroundColor: 'var(--preview-warning)',
            color: 'var(--preview-warning-foreground)',
          }}
        >
          <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Pending</span>
        </div>
        <div
          className="p-3 rounded-lg text-center"
          style={{
            backgroundColor: 'var(--preview-info)',
            color: 'var(--preview-info-foreground)',
          }}
        >
          <Info className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Info</span>
        </div>
      </div>

      {/* Toast-style Alerts */}
      <div className="pt-4 space-y-2">
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--preview-foreground)' }}>
          Toast Notifications
        </h4>
        <div
          className="flex items-center gap-3 p-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--preview-card)',
            border: `1px solid var(--preview-border)`,
          }}
        >
          <div
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: 'var(--preview-success)' }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--preview-card-foreground)' }}>
              Profile updated
            </p>
            <p className="text-xs" style={{ color: 'var(--preview-muted-foreground)' }}>
              Just now
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-3 p-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--preview-card)',
            border: `1px solid var(--preview-border)`,
          }}
        >
          <div
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: 'var(--preview-error)' }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--preview-card-foreground)' }}>
              Upload failed
            </p>
            <p className="text-xs" style={{ color: 'var(--preview-muted-foreground)' }}>
              2 minutes ago
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
