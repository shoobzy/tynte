/**
 * Performance benchmarking utilities
 *
 * Usage:
 * - Use `measure()` to time synchronous operations
 * - Use `measureAsync()` to time async operations
 * - Use `benchmark()` to run multiple iterations and get statistics
 * - Metrics are stored and can be exported for comparison
 */

interface Metric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

interface BenchmarkResult {
  name: string
  iterations: number
  mean: number
  median: number
  min: number
  max: number
  stdDev: number
}

// Store metrics in memory (can be exported for analysis)
const metrics: Metric[] = []
const benchmarkResults: BenchmarkResult[] = []

/**
 * Measure the duration of a synchronous operation
 */
export function measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start

  metrics.push({
    name,
    duration,
    timestamp: Date.now(),
    metadata,
  })

  if (import.meta.env.DEV) {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`, metadata || '')
  }

  return result
}

/**
 * Measure the duration of an async operation
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start

  metrics.push({
    name,
    duration,
    timestamp: Date.now(),
    metadata,
  })

  if (import.meta.env.DEV) {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`, metadata || '')
  }

  return result
}

/**
 * Run a function multiple times and collect statistics
 */
export function benchmark(
  name: string,
  fn: () => void,
  iterations: number = 100
): BenchmarkResult {
  const durations: number[] = []

  // Warm-up run
  fn()

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    durations.push(performance.now() - start)
  }

  const sorted = [...durations].sort((a, b) => a - b)
  const sum = durations.reduce((a, b) => a + b, 0)
  const mean = sum / iterations
  const median = sorted[Math.floor(iterations / 2)]
  const min = sorted[0]
  const max = sorted[iterations - 1]
  const variance = durations.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / iterations
  const stdDev = Math.sqrt(variance)

  const result: BenchmarkResult = {
    name,
    iterations,
    mean,
    median,
    min,
    max,
    stdDev,
  }

  benchmarkResults.push(result)

  if (import.meta.env.DEV) {
    console.log(`[Benchmark] ${name}:`, {
      mean: `${mean.toFixed(2)}ms`,
      median: `${median.toFixed(2)}ms`,
      min: `${min.toFixed(2)}ms`,
      max: `${max.toFixed(2)}ms`,
      stdDev: `${stdDev.toFixed(2)}ms`,
    })
  }

  return result
}

/**
 * Get all collected metrics
 */
export function getMetrics(): Metric[] {
  return [...metrics]
}

/**
 * Get metrics filtered by name
 */
export function getMetricsByName(name: string): Metric[] {
  return metrics.filter((m) => m.name === name)
}

/**
 * Get all benchmark results
 */
export function getBenchmarkResults(): BenchmarkResult[] {
  return [...benchmarkResults]
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.length = 0
  benchmarkResults.length = 0
}

/**
 * Export metrics as JSON (for saving/comparing)
 */
export function exportMetrics(): string {
  return JSON.stringify(
    {
      metrics,
      benchmarks: benchmarkResults,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  )
}

/**
 * Calculate statistics for a set of metrics by name
 */
export function getMetricStats(name: string): {
  count: number
  mean: number
  median: number
  min: number
  max: number
} | null {
  const filtered = getMetricsByName(name)
  if (filtered.length === 0) return null

  const durations = filtered.map((m) => m.duration)
  const sorted = [...durations].sort((a, b) => a - b)
  const sum = durations.reduce((a, b) => a + b, 0)

  return {
    count: filtered.length,
    mean: sum / filtered.length,
    median: sorted[Math.floor(filtered.length / 2)],
    min: sorted[0],
    max: sorted[filtered.length - 1],
  }
}

// React Profiler callback type (matches React.ProfilerOnRenderCallback)
export type ProfilerOnRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => void

/**
 * Create a profiler callback that logs render metrics
 */
export function createProfilerCallback(componentName: string): ProfilerOnRenderCallback {
  return (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    metrics.push({
      name: `render:${componentName}`,
      duration: actualDuration,
      timestamp: Date.now(),
      metadata: {
        id,
        phase,
        baseDuration,
        startTime,
        commitTime,
      },
    })

    if (import.meta.env.DEV) {
      console.log(
        `[Profiler] ${componentName} (${phase}): ${actualDuration.toFixed(2)}ms`,
        { baseDuration: baseDuration.toFixed(2) }
      )
    }
  }
}

// Expose utilities globally in dev mode for console access
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__PERF__ = {
    getMetrics,
    getMetricsByName,
    getMetricStats,
    getBenchmarkResults,
    clearMetrics,
    exportMetrics,
  }
}
