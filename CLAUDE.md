# Tynte - Project Context for Claude

## Overview
Tynte is a professional colour palette generator web application for designers and developers. It provides tools for creating, managing, and exporting colour palettes with accessibility features.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand with persist middleware (localStorage)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Project Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Modal, Slider, etc.)
│   ├── layout/       # Header, Sidebar
│   ├── palette/      # PaletteManager, ColourCard, GradientCard, ColourPicker
│   ├── generators/   # HarmonyGenerator, ScaleGenerator, GradientGenerator, ImageExtractor
│   ├── accessibility/# ContrastChecker, ContrastMatrix, ColourblindSimulator, AccessibilityReport
│   ├── export/       # ExportModal, CSSExport, TailwindExport, FigmaExport
│   └── preview/      # ComponentPreview
├── stores/           # Zustand stores (paletteStore, uiStore, preferencesStore)
├── utils/colour/     # Colour conversion, contrast, harmony utilities
├── types/            # TypeScript type definitions
└── data/             # Presets and default data
```

## Conventions

### Language
- Use **British English** spelling throughout (colour, grey, organisation, etc.)

### Components
- UI components use consistent patterns with variants (e.g., Button has ghost, outline, destructive)
- Modals use React portals and include: Escape key to close, scroll lock, scrollbar compensation
- Destructive actions require confirmation via ConfirmModal
- All icon-only buttons must have `title` attributes for accessibility

### Styling
- Use Tailwind classes
- CSS variables for theme colours (defined in index.css)
- Consistent spacing and sizing patterns
- Dark mode support via class-based theming

### State
- Zustand stores for global state
- Local component state for UI-specific state
- Palettes persist to localStorage automatically

## Key Features Implemented

### Palette Management
- Create, rename, duplicate, delete palettes
- Colour categories (primary, secondary, accent, neutral, success, warning, error, info)
- Custom categories support
- Drag-and-drop colour reordering
- Colour locking

### Gradient Generator
- Linear, radial, and conic gradients
- Multiple colour stops (2-10)
- Inline colour picker with canvas, hue slider, hex input, eye dropper
- Palette colour selection for stops
- Random gradient generation
- Save gradients to palette with name validation
- CSS output with copy functionality

### Colour Tools
- Harmony generator (complementary, triadic, etc.)
- Scale generator (tints, shades, tones)
- Image colour extraction
- Contrast checker (WCAG compliance)
- Contrast matrix
- Colourblind simulation
- Accessibility report

### Export
- CSS custom properties
- Tailwind config
- Figma-compatible format

## Recent Work (Session Summary)

### Gradient System
- Gradients save as actual gradient objects (not individual colours)
- GradientCard component displays saved gradients with colour stop hex values
- Gradients section in PaletteManager with expand/collapse and Clear All button
- Gradient name validation (required, duplicate check, error states)

### UI Improvements
- ConfirmModal for destructive actions
- Modal improvements: portals, Escape key, scroll lock, scrollbar compensation
- Sidebar navigation: vertical layout, consistent button styling
- Slider fix: separated positioning from animation to fix hover transform bug

### Inline Colour Picker
- Replaced native HTML color input in gradient stops
- Canvas gradient picker with crosshair
- Hue slider with rainbow gradient
- Hex input with live preview
- Eye dropper support (where available)
- Palette colour swatches for quick selection

## Known Patterns

### Colour Picker Usage
The full `ColourPicker` component is in `src/components/palette/ColourPicker.tsx`. A simplified inline version `InlineColourPicker` is in `GradientGenerator.tsx` for gradient stops.

### Category Select Modal
`CategorySelectModal` combines default categories with custom categories from the active palette. Used when adding colours from generators (Harmony, Scale).

### Toast Notifications
Use `useToast()` hook for notifications: `toast.success()`, `toast.error()`, `toast.warning()`

## Repository
GitHub: https://github.com/shoobzy/tynte
