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
- **Grouped Palette Colours**: Palette colours now displayed grouped by category
  - New `paletteColourGroups` prop for category-grouped display
  - Shows category labels (Primary, Secondary, etc.) above colour swatches
  - Scrollable container with max height for many colours
  - Consistent with Contrast Checker and Contrast Matrix grouping
- **Saturation Slider Fix**: Saturation now tracked in state (like hue) to preserve slider position when brightness is 0 (black colours)
- Eye dropper support (where browser supports it)
- Optional "Done" button via `onClose` prop

### Navigation Protection for Unsaved Changes
- Global dirty state tracking added to UI store (`hasUnsavedEdits`)
- `requestNavigation()` checks for unsaved edits before navigating
- Sidebar uses `requestNavigation()` instead of direct `setCurrentView()`
- ConfirmModal prompts user to discard or cancel when navigating with unsaved edits
- ColourCard, GradientCard, and PaletteManager register editing state with UI store
- Cleanup on component unmount resets dirty state

### ContrastChecker Enhancement
- Replaced basic `ColourInput` with full `InlineColourPicker` for both foreground and background colours
- Each picker includes canvas, HSV sliders, hex input, eye dropper, and grouped palette colours
- Removed redundant "Pick from Palette" collapsible section (now integrated into pickers)
- Removed redundant Apply button - colours now save directly when changed
- Reordered layout: Preview/scores above colour pickers for better UX

### Colourblind Simulator Locked Colours
- Locked colours display a lock icon indicator in individual colour cards
- Apply buttons and palette alternatives are disabled for locked colours
- Shows "Locked" label with lock icon when colours cannot be modified
- `paletteStore.updateColour()` checks locked status before applying changes
- Provides visual feedback so users understand why suggestions can't be applied

### Colourblind Simulator "Mark as Reviewed" Feature
- Accessibility warnings can be marked as "Reviewed" to acknowledge intentional design choices
- Reviewed warnings move to a collapsed section, reducing noise in the main view
- Each warning has a "Reviewed" button next to "Suggest fix"
- Reviewed section shows "Unreview" button to restore warnings if needed
- Warnings are stored persistently with the palette (`reviewedWarnings` field)
- Warning keys are unique per CVD type and colour pair: `contrast:id1:id2:cvdType` or `distinguish:id1:id2:cvdType`
- Applies to both text/background contrast warnings and distinguishability warnings

### UI Contrast Accessibility Fixes
- Fixed `text-muted-foreground` contrast issues on light backgrounds
- Changed `bg-muted/30` to `bg-muted/50` throughout app for better visibility
- Updated disabled opacity from 50% to 60% for better contrast
- Fixed scrollbar colours for better visibility
- Improved contrast in Tabs, Button, Input, Slider, Modal, and CategoryGroup components

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
- **InlineColourPicker** (`src/components/ui/InlineColourPicker.tsx`): Shared component used in ColourCard edit mode, ContrastChecker, HarmonyGenerator, ScaleGenerator, and GradientGenerator. Uses HSV colour model with canvas picker + Hue/Saturation/Brightness sliders. Supports `paletteColourGroups` prop for category-grouped palette colour display. Tracks hue and saturation in local state to preserve slider positions when values are meaningless in hex (hue when s=0, saturation when v=0).

### Colour Revert Pattern
Colours track `previousHex` to enable undo. The `revertColour` store action swaps current and previous values, allowing toggle between two states. Revert button only shows when `previousHex` exists.

### Component Preview Base Shade Selection
The preview uses Primary category colours as the reference for shade selection. Base shade index applies to all categories. Uses `getOptimalTextColour()` from `utils/colour/contrast.ts` to determine if white or black text provides better contrast.

### Category Select Modal
`CategorySelectModal` combines default categories with custom categories from the active palette. Used when adding colours from generators (Harmony, Scale).

### Navigation Protection Pattern
Components with edit modes (ColourCard, GradientCard, PaletteManager) register their dirty state with the UI store using `setHasUnsavedEdits()`. The Sidebar uses `requestNavigation()` instead of `setCurrentView()` to check for unsaved changes before navigating. When dirty, a ConfirmModal prompts the user. `confirmNavigation()` proceeds and clears dirty state; `cancelNavigation()` stays on current view. Components clean up with `useEffect` return to reset dirty state on unmount.

### Toast Notifications
Use `useToast()` hook for notifications: `toast.success()`, `toast.error()`, `toast.warning()`

### Ring Clipping Prevention
When colour swatches have selection rings (`ring-2 ring-offset-2`), the ring-offset extends outside the container bounds and gets clipped. Fix with padding pattern: `p-1 -m-1` on the container (or `px-1 -mx-1` / `py-1 -my-1` for specific axes). The negative margin compensates for the padding so layout isn't affected. Applied in: InlineColourPicker palette swatches, ContrastMatrix, ColourPicker, ComponentPreview. Note: InlineColourPicker canvas relies on the outer `p-3` container padding for thumb overflow - no extra wrapper needed.

### Locked Colours Pattern
Colours have an optional `locked` property. When true:
- `paletteStore.updateColour()` rejects changes (except to the `locked` property itself)
- ColourCard shows lock icon and prevents editing
- ColourblindSimulator shows lock indicators and disables Apply buttons
- Useful for protecting brand colours from accidental modification

### Reviewed Warnings Pattern
Accessibility warnings in ColourblindSimulator can be marked as "reviewed" to acknowledge intentional design choices without fixing them. Stored in `palette.reviewedWarnings` as an array of unique keys:
- Format: `contrast:textId:bgId:cvdType` or `distinguish:id1:id2:cvdType`
- Store functions: `markWarningReviewed()`, `unmarkWarningReviewed()`, `isWarningReviewed()`
- Reviewed warnings appear in a collapsed section with option to "Unreview"
- Persists with palette in localStorage

### Slider Component
When using framer-motion `whileHover`/`whileTap` with positioned elements, separate the positioning (outer div with translate) from the animation (inner motion.div with scale) to prevent transform conflicts. Sliders use `cursor-grab`/`cursor-grabbing` for drag feedback. The slider uses `p-1 -m-1` on an outer wrapper to extend the clickable hit area by 4px on all sides without affecting layout - this makes it easier to grab the thumb at extreme positions.

### Colour Conversion Utilities
Located in `src/utils/colour/conversions.ts`. Supports:
- RGB, HSL, HSV, OKLCH, LAB, CMYK conversions
- `hexToHsv` and `hsvToHex` for HSV-based colour pickers
- Format strings: `formatRgb()`, `formatHsl()`, `formatOklch()`, `formatCmyk()`
- Validation: `isValidHex()`, `normaliseHex()`, `parseColour()`

## Repository
GitHub: https://github.com/shoobzy/tynte
