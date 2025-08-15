/**
 * Mobile optimization hooks
 * Provides utilities for better mobile experience
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useDeviceType } from './use-mobile'
import { 
  getConnectionSpeed, 
  getDeviceMemory, 
  debounce, 
  throttle,
  performanceMonitor
} from '@/lib/utils/mobile-performance'

// Hook for connection-aware loading
export function useConnectionAware() {
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
  const [deviceMemory, setDeviceMemory] = useState<'low' | 'medium' | 'high'>('medium')
  
  useEffect(() => {
    setConnectionSpeed(getConnectionSpeed())
    setDeviceMemory(getDeviceMemory())
    
    // Listen for connection changes
    const connection = (navigator as any).connection
    if (connection) {
      const handleChange = () => {
        setConnectionSpeed(getConnectionSpeed())
      }
      
      connection.addEventListener('change', handleChange)
      return () => connection.removeEventListener('change', handleChange)
    }
  }, [])
  
  return {
    connectionSpeed,
    deviceMemory,
    shouldReduceAnimations: connectionSpeed === 'slow' || deviceMemory === 'low',
    shouldLazyLoad: connectionSpeed !== 'fast',
    shouldOptimizeImages: connectionSpeed === 'slow' || deviceMemory === 'low'
  }
}

// Hook for touch-optimized interactions
export function useTouchOptimized() {
  const { isTouchDevice } = useDeviceType()
  
  const getTouchTargetSize = useCallback((baseSize: number) => {
    return isTouchDevice ? Math.max(baseSize, 44) : baseSize // 44px minimum for touch
  }, [isTouchDevice])
  
  const getTouchSpacing = useCallback((baseSpacing: number) => {
    return isTouchDevice ? Math.max(baseSpacing, 8) : baseSpacing // 8px minimum spacing
  }, [isTouchDevice])
  
  const getTouchClasses = useCallback(() => {
    return isTouchDevice ? 'touch-manipulation' : ''
  }, [isTouchDevice])
  
  return {
    isTouchDevice,
    getTouchTargetSize,
    getTouchSpacing,
    getTouchClasses
  }
}

// Hook for performance monitoring
export function usePerformanceMonitoring(label: string) {
  const endTiming = useRef<(() => void) | null>(null)
  
  const startTiming = useCallback(() => {
    endTiming.current = performanceMonitor.startTiming(label)
  }, [label])
  
  const stopTiming = useCallback(() => {
    if (endTiming.current) {
      endTiming.current()
      endTiming.current = null
    }
  }, [])
  
  useEffect(() => {
    return () => {
      stopTiming()
    }
  }, [stopTiming])
  
  return { startTiming, stopTiming }
}

// Hook for optimized scrolling
export function useOptimizedScrolling(callback: () => void, delay: number = 16) {
  const { isMobile } = useDeviceType()
  const throttledCallback = useRef(throttle(callback, delay))
  
  useEffect(() => {
    const handleScroll = throttledCallback.current
    
    // Use passive listeners on mobile for better performance
    const options = isMobile ? { passive: true } : undefined
    
    window.addEventListener('scroll', handleScroll, options)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])
}

// Hook for lazy loading with intersection observer
export function useLazyLoading(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold }
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [threshold])
  
  return { elementRef, isVisible }
}

// Hook for adaptive image loading
export function useAdaptiveImages() {
  const { shouldOptimizeImages } = useConnectionAware()
  const { isMobile } = useDeviceType()
  
  const getImageProps = useCallback((src: string, alt: string, width?: number, height?: number) => {
    const props: any = { src, alt }
    
    if (shouldOptimizeImages) {
      // Add loading="lazy" for better performance
      props.loading = 'lazy'
      
      // Reduce quality for slow connections
      if (src.includes('?')) {
        props.src = `${src}&quality=70`
      } else {
        props.src = `${src}?quality=70`
      }
    }
    
    if (width && height && isMobile) {
      // Reduce dimensions for mobile
      props.width = Math.round(width * 0.8)
      props.height = Math.round(height * 0.8)
    }
    
    return props
  }, [shouldOptimizeImages, isMobile])
  
  return { getImageProps, shouldOptimizeImages }
}

// Hook for debounced input
export function useDebouncedInput(initialValue: string, delay: number = 300) {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  
  const debouncedSetValue = useCallback(
    debounce((newValue: string) => {
      setDebouncedValue(newValue)
    }, delay),
    [delay]
  )
  
  useEffect(() => {
    debouncedSetValue(value)
  }, [value, debouncedSetValue])
  
  return [debouncedValue, setValue] as const
}

// Hook for mobile-optimized table pagination
export function useMobilePagination<T>(
  items: T[],
  itemsPerPageDesktop: number = 10,
  itemsPerPageMobile: number = 5
) {
  const { isMobile } = useDeviceType()
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = isMobile ? itemsPerPageMobile : itemsPerPageDesktop
  const totalPages = Math.ceil(items.length / itemsPerPage)
  
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])
  
  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])
  
  return {
    currentItems,
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  }
}

// Hook for mobile-optimized virtual scrolling
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  buffer: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)
  const { isMobile } = useDeviceType()
  
  // Adjust buffer for mobile performance
  const effectiveBuffer = isMobile ? Math.max(buffer - 2, 2) : buffer
  
  const visibleCount = Math.ceil(containerHeight / itemHeight) + effectiveBuffer * 2
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - effectiveBuffer)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount)
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  const totalHeight = items.length * itemHeight
  
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }, isMobile ? 32 : 16), // Slower throttling on mobile
    [isMobile]
  )
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    handleScroll
  }
}

// Hook for haptic feedback
export function useHapticFeedback() {
  const { isTouchDevice } = useDeviceType()
  
  const vibrate = useCallback((pattern: number | number[]) => {
    if (isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [isTouchDevice])
  
  const lightTap = useCallback(() => vibrate(25), [vibrate])
  const mediumTap = useCallback(() => vibrate(50), [vibrate])
  const heavyTap = useCallback(() => vibrate(75), [vibrate])
  const doubleTap = useCallback(() => vibrate([25, 50, 25]), [vibrate])
  
  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    isSupported: isTouchDevice && 'vibrate' in navigator
  }
}