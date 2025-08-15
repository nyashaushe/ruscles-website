/**
 * Mobile Performance Optimization Utilities
 * Provides utilities for optimizing performance on mobile devices and slower connections
 */

// Connection speed detection
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator === 'undefined') return 'medium'
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  if (!connection) return 'medium'
  
  const effectiveType = connection.effectiveType
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'slow'
    case '3g':
      return 'medium'
    case '4g':
    default:
      return 'fast'
  }
}

// Memory detection
export function getDeviceMemory(): 'low' | 'medium' | 'high' {
  if (typeof navigator === 'undefined') return 'medium'
  
  const memory = (navigator as any).deviceMemory
  
  if (!memory) return 'medium'
  
  if (memory <= 2) return 'low'
  if (memory <= 4) return 'medium'
  return 'high'
}

// Image optimization based on device capabilities
export function getOptimalImageSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
  const connectionSpeed = getConnectionSpeed()
  const deviceMemory = getDeviceMemory()
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  
  let scaleFactor = 1
  
  // Reduce image size for slower connections or low memory devices
  if (connectionSpeed === 'slow' || deviceMemory === 'low') {
    scaleFactor = 0.5
  } else if (connectionSpeed === 'medium' || deviceMemory === 'medium') {
    scaleFactor = 0.75
  }
  
  // Account for pixel ratio but cap it for performance
  const effectivePixelRatio = Math.min(pixelRatio, 2)
  
  return {
    width: Math.round(originalWidth * scaleFactor * effectivePixelRatio),
    height: Math.round(originalHeight * scaleFactor * effectivePixelRatio)
  }
}

// Debounce utility for touch interactions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// Throttle utility for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy loading intersection observer
export function createLazyLoadObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

// Touch gesture detection
export interface TouchGesture {
  type: 'tap' | 'longpress' | 'swipe' | 'pinch'
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  duration?: number
}

export class TouchGestureDetector {
  private startTime: number = 0
  private startX: number = 0
  private startY: number = 0
  private startDistance: number = 0
  
  constructor(
    private element: HTMLElement,
    private onGesture: (gesture: TouchGesture) => void,
    private options: {
      longPressDelay?: number
      swipeThreshold?: number
      tapThreshold?: number
    } = {}
  ) {
    this.options = {
      longPressDelay: 500,
      swipeThreshold: 50,
      tapThreshold: 10,
      ...options
    }
    
    this.bindEvents()
  }
  
  private bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
  }
  
  private handleTouchStart(e: TouchEvent) {
    this.startTime = Date.now()
    
    if (e.touches.length === 1) {
      this.startX = e.touches[0].clientX
      this.startY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      this.startDistance = Math.sqrt(dx * dx + dy * dy)
    }
  }
  
  private handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (Math.abs(distance - this.startDistance) > 10) {
        this.onGesture({
          type: 'pinch',
          distance: distance - this.startDistance
        })
      }
    }
  }
  
  private handleTouchEnd(e: TouchEvent) {
    const duration = Date.now() - this.startTime
    
    if (e.changedTouches.length === 1) {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - this.startX
      const deltaY = endY - this.startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (distance < this.options.tapThreshold!) {
        if (duration > this.options.longPressDelay!) {
          this.onGesture({ type: 'longpress', duration })
        } else {
          this.onGesture({ type: 'tap', duration })
        }
      } else if (distance > this.options.swipeThreshold!) {
        let direction: 'left' | 'right' | 'up' | 'down'
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left'
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
        }
        
        this.onGesture({
          type: 'swipe',
          direction,
          distance,
          duration
        })
      }
    }
  }
  
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
  }
}

// Virtual scrolling for large lists
export class VirtualScrollManager {
  private container: HTMLElement
  private itemHeight: number
  private visibleCount: number
  private totalCount: number
  private scrollTop: number = 0
  private startIndex: number = 0
  private endIndex: number = 0
  
  constructor(
    container: HTMLElement,
    itemHeight: number,
    totalCount: number,
    buffer: number = 5
  ) {
    this.container = container
    this.itemHeight = itemHeight
    this.totalCount = totalCount
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + buffer * 2
    
    this.updateVisibleRange()
    this.bindEvents()
  }
  
  private bindEvents() {
    this.container.addEventListener('scroll', throttle(() => {
      this.scrollTop = this.container.scrollTop
      this.updateVisibleRange()
    }, 16)) // ~60fps
  }
  
  private updateVisibleRange() {
    this.startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - 5)
    this.endIndex = Math.min(this.totalCount - 1, this.startIndex + this.visibleCount)
  }
  
  getVisibleRange(): { start: number; end: number } {
    return { start: this.startIndex, end: this.endIndex }
  }
  
  getOffsetY(): number {
    return this.startIndex * this.itemHeight
  }
  
  getTotalHeight(): number {
    return this.totalCount * this.itemHeight
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  
  startTiming(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      this.metrics.get(label)!.push(duration)
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(label)!
      if (measurements.length > 100) {
        measurements.shift()
      }
    }
  }
  
  getAverageTime(label: string): number {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) return 0
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length
  }
  
  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {}
    
    for (const [label, measurements] of this.metrics) {
      result[label] = {
        average: this.getAverageTime(label),
        count: measurements.length
      }
    }
    
    return result
  }
  
  clear() {
    this.metrics.clear()
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()