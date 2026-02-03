import { PalettePreset, ColourCategory } from '../types/palette'

export const palettePresets: PalettePreset[] = [
  {
    id: 'tailwind-default',
    name: 'Tailwind Default',
    description: 'The default Tailwind CSS colour palette',
    colours: [
      {
        category: 'primary',
        hexValues: ['#3B82F6', '#2563EB', '#1D4ED8'],
      },
      {
        category: 'secondary',
        hexValues: ['#6B7280', '#4B5563', '#374151'],
      },
      {
        category: 'accent',
        hexValues: ['#8B5CF6', '#7C3AED', '#6D28D9'],
      },
      {
        category: 'success',
        hexValues: ['#10B981', '#059669', '#047857'],
      },
      {
        category: 'warning',
        hexValues: ['#F59E0B', '#D97706', '#B45309'],
      },
      {
        category: 'error',
        hexValues: ['#EF4444', '#DC2626', '#B91C1C'],
      },
    ],
  },
  {
    id: 'material-design',
    name: 'Material Design',
    description: 'Google Material Design inspired colours',
    colours: [
      {
        category: 'primary',
        hexValues: ['#6200EE', '#3700B3'],
      },
      {
        category: 'secondary',
        hexValues: ['#03DAC6', '#018786'],
      },
      {
        category: 'error',
        hexValues: ['#B00020', '#CF6679'],
      },
      {
        category: 'neutral',
        hexValues: ['#121212', '#1E1E1E', '#2D2D2D', '#FFFFFF'],
      },
    ],
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Cool, calming ocean-inspired colours',
    colours: [
      {
        category: 'primary',
        hexValues: ['#0077B6', '#0096C7', '#00B4D8'],
      },
      {
        category: 'secondary',
        hexValues: ['#48CAE4', '#90E0EF', '#ADE8F4'],
      },
      {
        category: 'accent',
        hexValues: ['#CAF0F8', '#03045E'],
      },
      {
        category: 'neutral',
        hexValues: ['#023E8A', '#0077B6', '#F8F9FA'],
      },
    ],
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm sunset gradient colours',
    colours: [
      {
        category: 'primary',
        hexValues: ['#FF6B6B', '#EE5A5A', '#DD4A4A'],
      },
      {
        category: 'secondary',
        hexValues: ['#FEC89A', '#FFD6A5', '#FFE5B4'],
      },
      {
        category: 'accent',
        hexValues: ['#FF8FA3', '#FFACC7', '#FFCCD5'],
      },
      {
        category: 'neutral',
        hexValues: ['#4A4A4A', '#6B6B6B', '#FAFAFA'],
      },
    ],
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural forest-inspired greens',
    colours: [
      {
        category: 'primary',
        hexValues: ['#2D6A4F', '#40916C', '#52B788'],
      },
      {
        category: 'secondary',
        hexValues: ['#74C69D', '#95D5B2', '#B7E4C7'],
      },
      {
        category: 'accent',
        hexValues: ['#D8F3DC', '#1B4332', '#081C15'],
      },
      {
        category: 'neutral',
        hexValues: ['#1B4332', '#2D6A4F', '#F8F9FA'],
      },
    ],
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'Deep purple and violet tones',
    colours: [
      {
        category: 'primary',
        hexValues: ['#7B2CBF', '#9D4EDD', '#C77DFF'],
      },
      {
        category: 'secondary',
        hexValues: ['#5A189A', '#3C096C', '#240046'],
      },
      {
        category: 'accent',
        hexValues: ['#E0AAFF', '#F0E6FF', '#10002B'],
      },
      {
        category: 'neutral',
        hexValues: ['#10002B', '#240046', '#FAFAFA'],
      },
    ],
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black and white with greys',
    colours: [
      {
        category: 'neutral',
        hexValues: [
          '#000000',
          '#171717',
          '#262626',
          '#404040',
          '#525252',
          '#737373',
          '#A3A3A3',
          '#D4D4D4',
          '#E5E5E5',
          '#F5F5F5',
          '#FFFFFF',
        ],
      },
    ],
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Soft, muted pastel colours',
    colours: [
      {
        category: 'primary',
        hexValues: ['#FFB5A7', '#FCD5CE', '#F8EDEB'],
      },
      {
        category: 'secondary',
        hexValues: ['#F9DCC4', '#FEC89A', '#FFDAB9'],
      },
      {
        category: 'accent',
        hexValues: ['#D8E2DC', '#E8E8E4', '#F5F5F5'],
      },
      {
        category: 'info',
        hexValues: ['#B5E2FA', '#A2D2FF', '#BDE0FE'],
      },
    ],
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Vibrant neon colours for dark themes',
    colours: [
      {
        category: 'primary',
        hexValues: ['#FF00FF', '#FF1493', '#FF69B4'],
      },
      {
        category: 'secondary',
        hexValues: ['#00FFFF', '#00CED1', '#20B2AA'],
      },
      {
        category: 'accent',
        hexValues: ['#39FF14', '#7FFF00', '#ADFF2F'],
      },
      {
        category: 'neutral',
        hexValues: ['#0D0D0D', '#1A1A2E', '#16213E', '#0F3460'],
      },
    ],
  },
  {
    id: 'earth-tones',
    name: 'Earth Tones',
    description: 'Warm, natural earth colours',
    colours: [
      {
        category: 'primary',
        hexValues: ['#A0522D', '#8B4513', '#704214'],
      },
      {
        category: 'secondary',
        hexValues: ['#D2691E', '#CD853F', '#DEB887'],
      },
      {
        category: 'accent',
        hexValues: ['#F4A460', '#FFE4C4', '#FAEBD7'],
      },
      {
        category: 'neutral',
        hexValues: ['#2F2F2F', '#5C4033', '#8B7355', '#F5F5DC'],
      },
    ],
  },
]

export const categoryLabels: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  neutral: 'Neutral',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
}

/**
 * Get the display label for a category (falls back to the category name for custom categories)
 */
export function getCategoryLabel(category: string): string {
  return categoryLabels[category] || category
}

export const defaultCategories: ColourCategory[] = [
  'primary',
  'secondary',
  'accent',
  'neutral',
  'success',
  'warning',
  'error',
  'info',
]
