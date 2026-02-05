import { Profiler, ReactNode } from 'react'
import { createProfilerCallback } from '../../utils/performance'

interface DevProfilerProps {
  id: string
  children: ReactNode
  /** Only profile in development mode (default: true) */
  devOnly?: boolean
}

/**
 * Wrapper component that profiles render performance using React's Profiler API.
 *
 * Usage:
 * ```tsx
 * <DevProfiler id="MyComponent">
 *   <MyComponent />
 * </DevProfiler>
 * ```
 *
 * In development, this logs render metrics to the console and stores them
 * in the performance utility for later analysis.
 *
 * Access metrics in browser console:
 * - window.__PERF__.getMetrics() - all metrics
 * - window.__PERF__.getMetricsByName('render:MyComponent') - specific component
 * - window.__PERF__.getMetricStats('render:MyComponent') - statistics
 * - window.__PERF__.exportMetrics() - export as JSON
 */
export function DevProfiler({ id, children, devOnly = true }: DevProfilerProps) {
  // Skip profiling in production if devOnly is true
  if (devOnly && !import.meta.env.DEV) {
    return <>{children}</>
  }

  return (
    <Profiler id={id} onRender={createProfilerCallback(id)}>
      {children}
    </Profiler>
  )
}
