import { Heart, Share, MessageCircle, MoreHorizontal, Star, User } from 'lucide-react'

interface CardPreviewProps {
  darkMode: boolean
}

export function CardPreview(_props: CardPreviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Basic Card */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--preview-card)',
          border: `1px solid var(--preview-border)`,
        }}
      >
        <div className="p-4">
          <h3
            className="font-semibold"
            style={{ color: 'var(--preview-card-foreground)' }}
          >
            Basic Card
          </h3>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--preview-muted-foreground)' }}
          >
            This is a simple card component with a title and description.
          </p>
        </div>
      </div>

      {/* Card with Header */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--preview-card)',
          border: `1px solid var(--preview-border)`,
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            backgroundColor: 'var(--preview-muted)',
            borderBottom: `1px solid var(--preview-border)`,
          }}
        >
          <h3
            className="font-semibold text-sm"
            style={{ color: 'var(--preview-card-foreground)' }}
          >
            Card with Header
          </h3>
        </div>
        <div className="p-4">
          <p
            className="text-sm"
            style={{ color: 'var(--preview-muted-foreground)' }}
          >
            Content goes here with a distinct header section.
          </p>
        </div>
      </div>

      {/* Interactive Card */}
      <div
        className="rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg"
        style={{
          backgroundColor: 'var(--preview-card)',
          border: `1px solid var(--preview-border)`,
        }}
      >
        <div
          className="h-32 flex items-center justify-center"
          style={{ backgroundColor: 'var(--preview-primary)' }}
        >
          <span
            className="text-4xl font-bold"
            style={{ color: 'var(--preview-primary-foreground)' }}
          >
            T
          </span>
        </div>
        <div className="p-4">
          <h3
            className="font-semibold"
            style={{ color: 'var(--preview-card-foreground)' }}
          >
            Interactive Card
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--preview-muted-foreground)' }}
          >
            Hover to see the shadow effect
          </p>
          <div className="flex items-center gap-4 mt-4">
            <button
              className="flex items-center gap-1 text-sm"
              style={{ color: 'var(--preview-muted-foreground)' }}
            >
              <Heart className="h-4 w-4" />
              24
            </button>
            <button
              className="flex items-center gap-1 text-sm"
              style={{ color: 'var(--preview-muted-foreground)' }}
            >
              <MessageCircle className="h-4 w-4" />
              12
            </button>
            <button
              className="flex items-center gap-1 text-sm"
              style={{ color: 'var(--preview-muted-foreground)' }}
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--preview-card)',
          border: `1px solid var(--preview-border)`,
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: 'var(--preview-muted-foreground)' }}
            >
              Total Revenue
            </span>
            <MoreHorizontal
              className="h-4 w-4"
              style={{ color: 'var(--preview-muted-foreground)' }}
            />
          </div>
          <div className="mt-2">
            <span
              className="text-3xl font-bold"
              style={{ color: 'var(--preview-card-foreground)' }}
            >
              $45,231
            </span>
            <span
              className="text-sm ml-2"
              style={{ color: 'var(--preview-success)' }}
            >
              +20.1%
            </span>
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--preview-muted-foreground)' }}
          >
            from last month
          </p>
        </div>
      </div>

      {/* User Card */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--preview-card)',
          border: `1px solid var(--preview-border)`,
        }}
      >
        <div className="p-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--preview-accent)' }}
          >
            <User className="h-6 w-6" style={{ color: 'var(--preview-accent-foreground)' }} />
          </div>
          <div className="flex-1">
            <h3
              className="font-semibold"
              style={{ color: 'var(--preview-card-foreground)' }}
            >
              John Doe
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--preview-muted-foreground)' }}
            >
              john@example.com
            </p>
          </div>
          <button
            className="px-3 py-1 rounded-md text-sm font-medium"
            style={{
              backgroundColor: 'var(--preview-primary)',
              color: 'var(--preview-primary-foreground)',
            }}
          >
            Follow
          </button>
        </div>
      </div>

      {/* Feature Card */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--preview-card)',
          border: `1px solid var(--preview-border)`,
        }}
      >
        <div className="p-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: 'var(--preview-info)' }}
          >
            <Star className="h-5 w-5" style={{ color: 'var(--preview-info-foreground)' }} />
          </div>
          <h3
            className="font-semibold"
            style={{ color: 'var(--preview-card-foreground)' }}
          >
            Feature Highlight
          </h3>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--preview-muted-foreground)' }}
          >
            Showcase important features with a prominent icon and description.
          </p>
          <button
            className="mt-4 text-sm font-medium"
            style={{ color: 'var(--preview-primary)' }}
          >
            Learn more →
          </button>
        </div>
      </div>
    </div>
  )
}
