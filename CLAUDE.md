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

### ColourCard Edit Mode Enhancement
- Replaced basic `ColourInput` with full `InlineColourPicker` component
- Edit mode now includes canvas picker, HSV sliders, hex input, and eye dropper
- Provides much richer colour editing experience for individual palette colours

### Colour Revert Functionality
- Colours now track their previous hex value (`previousHex` field on Colour type)
- When a colour is updated, the previous value is automatically saved
- Revert button (undo icon) appears on colour cards that have a previous value
- Clicking revert swaps current and previous values (can toggle back and forth)
- Useful for reverting changes made via accessibility/colourblind suggestions
- `revertColour` function added to paletteStore

### InlineColourPicker Improvements
- **HSV Conversion Fix**: Canvas now uses proper HSV (not HSL) for full colour range
  - Previously limited to 25-75% lightness due to incorrect conversion
  - Added `hexToHsv` and `hsvToHex` utility functions
- **Canvas Thumb**: Added padding to prevent clipping at edges, darker outline for visibility on light colours
- **HSV Sliders**: Added Saturation and Brightness sliders below the Hue slider
  - Dynamic gradients show colour context as you adjust
  - Provides precise control alongside the visual canvas picker
- Eye dropper support (where browser supports it)
- Palette colour swatches for quick selection
- Optional "Done" button via `onClose` prop

### Slider Component Improvements
- Cursor changes to `grab` on hover, `grabbing` while dragging
- Better visual feedback for drag interactions

### Component Preview
- Base shade selection with clickable swatches (works with any scale size)
- "Auto" option defaults to middle shade, or select specific shade
- Dynamic foreground colour using `getOptimalTextColour()` for contrast
- Hover = base + 1 shade, Active = base + 2 shades (darker)
- Active Colours section displays colour names and hex values
- 40px swatches for better visibility

### Gradient System
- Gradients save as actual gradient objects (not individual colours)
- GradientCard component displays saved gradients with colour stop hex values
- Gradients section in PaletteManager with expand/collapse and Clear All button
- Gradient name validation (required, duplicate check, error states)
- Random gradient generation

### UI Improvements
- ConfirmModal for destructive actions
- Modal improvements: portals, Escape key, scroll lock, scrollbar compensation
- Sidebar navigation: vertical layout, consistent button styling
- Slider fix: separated positioning from animation to fix hover transform bug

## Known Patterns

### Colour Picker Usage
- **ColourPicker** (`src/components/palette/ColourPicker.tsx`): Full-featured picker with canvas, RGB/HSL tabs, recent colours
- **InlineColourPicker** (`src/components/ui/InlineColourPicker.tsx`): Shared component used in ColourCard edit mode and GradientGenerator. Uses HSV colour model with canvas picker + Hue/Saturation/Brightness sliders

### Colour Revert Pattern
Colours track `previousHex` to enable undo. The `revertColour` store action swaps current and previous values, allowing toggle between two states. Revert button only shows when `previousHex` exists.

### Component Preview Base Shade Selection
The preview uses Primary category colours as the reference for shade selection. Base shade index applies to all categories. Uses `getOptimalTextColour()` from `utils/colour/contrast.ts` to determine if white or black text provides better contrast.

### Category Select Modal
`CategorySelectModal` combines default categories with custom categories from the active palette. Used when adding colours from generators (Harmony, Scale).

### Toast Notifications
Use `useToast()` hook for notifications: `toast.success()`, `toast.error()`, `toast.warning()`

### Slider Component
When using framer-motion `whileHover`/`whileTap` with positioned elements, separate the positioning (outer div with translate) from the animation (inner motion.div with scale) to prevent transform conflicts. Sliders use `cursor-grab`/`cursor-grabbing` for drag feedback.

### Colour Conversion Utilities
Located in `src/utils/colour/conversions.ts`. Supports:
- RGB, HSL, HSV, OKLCH, LAB, CMYK conversions
- `hexToHsv` and `hsvToHex` for HSV-based colour pickers
- Format strings: `formatRgb()`, `formatHsl()`, `formatOklch()`, `formatCmyk()`
- Validation: `isValidHex()`, `normaliseHex()`, `parseColour()`

## Repository
GitHub: https://github.com/shoobzy/tynte
