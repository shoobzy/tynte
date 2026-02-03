import { create } from 'zustand'
import { ColourCategory, ColourScale } from '../types/palette'
import { ColourHarmony, ColourblindType, Gradient } from '../types/colour'

type View = 'palette' | 'accessibility' | 'generators' | 'preview' | 'export'
type AccessibilityTab = 'contrast' | 'matrix' | 'colourblind' | 'report'
type GeneratorTab = 'harmony' | 'scale' | 'gradient' | 'extract'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface ModalState {
  isOpen: boolean
  type: 'export' | 'import' | 'settings' | 'colourPicker' | 'confirm' | null
  data?: Record<string, unknown>
}

interface UIStore {
  // View state
  currentView: View
  setCurrentView: (view: View) => void

  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Active selections
  selectedColourId: string | null
  setSelectedColourId: (id: string | null) => void
  selectedCategory: ColourCategory
  setSelectedCategory: (category: ColourCategory) => void

  // Accessibility state
  accessibilityTab: AccessibilityTab
  setAccessibilityTab: (tab: AccessibilityTab) => void
  contrastForeground: string
  contrastBackground: string
  setContrastColours: (foreground: string, background: string) => void
  colourblindType: ColourblindType
  setColourblindType: (type: ColourblindType) => void

  // Generator state
  generatorTab: GeneratorTab
  setGeneratorTab: (tab: GeneratorTab) => void
  harmonyType: ColourHarmony
  setHarmonyType: (type: ColourHarmony) => void
  harmonyBaseColour: string
  setHarmonyBaseColour: (colour: string) => void
  scaleBaseColour: string
  setScaleBaseColour: (colour: string) => void
  generatedScale: ColourScale | null
  setGeneratedScale: (scale: ColourScale | null) => void
  currentGradient: Gradient | null
  setCurrentGradient: (gradient: Gradient | null) => void

  // Preview state
  previewDarkMode: boolean
  togglePreviewDarkMode: () => void

  // Modal state
  modal: ModalState
  openModal: (type: ModalState['type'], data?: Record<string, unknown>) => void
  closeModal: () => void

  // Toast notifications
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void

  // Colour picker state
  pickerColour: string
  setPickerColour: (colour: string) => void
  pickerOpen: boolean
  setPickerOpen: (open: boolean) => void

  // Search/filter
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Drag state
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // View state
  currentView: 'palette',
  setCurrentView: (view) => set({ currentView: view }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Active selections
  selectedColourId: null,
  setSelectedColourId: (id) => set({ selectedColourId: id }),
  selectedCategory: 'primary',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Accessibility state
  accessibilityTab: 'contrast',
  setAccessibilityTab: (tab) => set({ accessibilityTab: tab }),
  contrastForeground: '#000000',
  contrastBackground: '#ffffff',
  setContrastColours: (foreground, background) =>
    set({ contrastForeground: foreground, contrastBackground: background }),
  colourblindType: 'protanopia',
  setColourblindType: (type) => set({ colourblindType: type }),

  // Generator state
  generatorTab: 'harmony',
  setGeneratorTab: (tab) => set({ generatorTab: tab }),
  harmonyType: 'complementary',
  setHarmonyType: (type) => set({ harmonyType: type }),
  harmonyBaseColour: '#6366f1',
  setHarmonyBaseColour: (colour) => set({ harmonyBaseColour: colour }),
  scaleBaseColour: '#6366f1',
  setScaleBaseColour: (colour) => set({ scaleBaseColour: colour }),
  generatedScale: null,
  setGeneratedScale: (scale) => set({ generatedScale: scale }),
  currentGradient: null,
  setCurrentGradient: (gradient) => set({ currentGradient: gradient }),

  // Preview state
  previewDarkMode: false,
  togglePreviewDarkMode: () =>
    set((state) => ({ previewDarkMode: !state.previewDarkMode })),

  // Modal state
  modal: { isOpen: false, type: null },
  openModal: (type, data) => set({ modal: { isOpen: true, type, data } }),
  closeModal: () => set({ modal: { isOpen: false, type: null } }),

  // Toast notifications
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, toast.duration || 3000)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Colour picker state
  pickerColour: '#6366f1',
  setPickerColour: (colour) => set({ pickerColour: colour }),
  pickerOpen: false,
  setPickerOpen: (open) => set({ pickerOpen: open }),

  // Search/filter
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Drag state
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),
}))
