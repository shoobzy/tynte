/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Download a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Format a date for display
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Capitalise first letter
 */
export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Parse URL search params to get palette data
 */
export function parsePaletteFromURL(): string[] | null {
  const params = new URLSearchParams(window.location.search)
  const colours = params.get('colours')

  if (!colours) return null

  try {
    const hexValues = colours.split('-').map((hex) => `#${hex}`)
    // Validate all are valid hex colours
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexValues.every((hex) => hexRegex.test(hex))) {
      return hexValues
    }
  } catch {
    return null
  }

  return null
}

/**
 * Generate URL for sharing a palette
 */
export function generatePaletteURL(hexValues: string[]): string {
  const colours = hexValues.map((hex) => hex.replace('#', '')).join('-')
  const url = new URL(window.location.href)
  url.search = `?colours=${colours}`
  return url.toString()
}

/**
 * Check if the browser supports the EyeDropper API
 */
export function supportsEyeDropper(): boolean {
  return 'EyeDropper' in window
}

/**
 * Get random item from array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffle array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Group array by key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if two arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}
