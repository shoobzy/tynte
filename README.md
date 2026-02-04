# Tynte

A professional colour palette generator built with React, TypeScript, and Tailwind CSS. Create accessible colour palettes with built-in WCAG contrast checking, intelligent shade generation, and seamless exports to CSS, Tailwind, SCSS, and Figma.

## Live Demo

Visit the [homepage](/) to explore interactive demos of the key features, then launch the full app at `/app`.

## Features

### Palette Management
- Create and manage multiple colour palettes
- Organise colours into customisable swatch groups
- Drag and drop to reorder colours
- Lock colours to prevent changes during random generation
- Duplicate, favourite, and delete palettes

### Colour Generators
- **Harmony Generator** - Create colour harmonies (complementary, triadic, analogous, etc.)
- **Scale Generator** - Generate colour scales from 50-950 with OKLCH-based interpolation
- **Gradient Generator** - Build linear, radial, and conic gradients with multiple colour stops
- **Image Extractor** - Extract dominant colours from uploaded images

### Accessibility Tools
- **Contrast Checker** - Check WCAG contrast ratios between any two colours
- **Contrast Matrix** - View contrast ratios across all palette colours with text/background role assignment
- **Colourblind Simulator** - Preview colours under different colour vision deficiency types (protanopia, deuteranopia, tritanopia, etc.)
- **Accessibility Report** - Generate comprehensive reports with WCAG compliance status

### Component Preview
- Preview your palette on real UI components (buttons, cards, forms, alerts)
- Toggle between light and dark mode preview

### Export Options
- CSS custom properties
- SCSS variables
- Tailwind CSS config
- JSON
- TypeScript
- Figma design tokens

## Tech Stack

- **React 18** with TypeScript
- **React Router** for client-side routing
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management with localStorage persistence
- **Framer Motion** for animations
- **dnd-kit** for drag and drop
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shoobzy/tynte.git
cd tynte

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`:
- `/` - Marketing homepage with interactive feature demos
- `/app` - Full palette generator application

### Build for Production

```bash
npm run build
```

## Keyboard Shortcuts

- **Escape** - Close open modals

## License

MIT
