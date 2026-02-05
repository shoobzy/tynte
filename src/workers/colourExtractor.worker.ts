/**
 * Web Worker for extracting colours from image pixel data
 * Offloads CPU-intensive pixel processing to a background thread
 */

interface ExtractMessage {
  type: 'extract'
  pixels: Uint8ClampedArray
  colourCount: number
}

interface ExtractResult {
  type: 'result'
  colours: { hex: string; count: number; percentage: number }[]
}

interface ErrorResult {
  type: 'error'
  error: string
}

type WorkerMessage = ExtractMessage
type WorkerResult = ExtractResult | ErrorResult

/**
 * Convert RGB values to hex string
 * Duplicated here since workers can't import from main bundle
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Process pixel data and extract dominant colours
 */
function extractColours(
  pixels: Uint8ClampedArray,
  colourCount: number
): { hex: string; count: number; percentage: number }[] {
  const colourCounts = new Map<string, number>()

  // Process all pixels
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]

    // Skip transparent pixels
    if (a < 128) continue

    // Quantize colours to reduce variety (32 levels per channel = 32,768 possible colours)
    const qr = Math.round(r / 32) * 32
    const qg = Math.round(g / 32) * 32
    const qb = Math.round(b / 32) * 32

    const hex = rgbToHex(qr, qg, qb)
    colourCounts.set(hex, (colourCounts.get(hex) || 0) + 1)
  }

  // Sort by frequency and take top colours
  const totalPixels = pixels.length / 4
  const sortedColours = Array.from(colourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, colourCount)
    .map(([hex, count]) => ({
      hex,
      count,
      percentage: Math.round((count / totalPixels) * 100 * 10) / 10,
    }))

  return sortedColours
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data

  if (type === 'extract') {
    try {
      const { pixels, colourCount } = event.data
      const colours = extractColours(pixels, colourCount)

      const result: ExtractResult = { type: 'result', colours }
      self.postMessage(result)
    } catch (error) {
      const errorResult: ErrorResult = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
      self.postMessage(errorResult)
    }
  }
}

// Export types for use in main thread
export type { WorkerMessage, WorkerResult, ExtractMessage, ExtractResult, ErrorResult }
