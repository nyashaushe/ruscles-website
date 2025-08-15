/**
 * Mobile-optimized drag and drop utilities
 * Provides better touch interactions for drag and drop functionality
 */

import { TouchGestureDetector, type TouchGesture } from './mobile-performance'

export interface DragDropOptions {
  dragThreshold?: number
  longPressDelay?: number
  autoScrollSpeed?: number
  autoScrollThreshold?: number
  hapticFeedback?: boolean
}

export interface DragDropCallbacks {
  onDragStart?: (element: HTMLElement, pointer: { x: number; y: number }) => void
  onDragMove?: (element: HTMLElement, pointer: { x: number; y: number }) => void
  onDragEnd?: (element: HTMLElement, dropTarget?: HTMLElement) => void
  onDragCancel?: (element: HTMLElement) => void
}

export class MobileDragDrop {
  private isDragging = false
  private dragElement: HTMLElement | null = null
  private ghostElement: HTMLElement | null = null
  private startPosition = { x: 0, y: 0 }
  private currentPosition = { x: 0, y: 0 }
  private offset = { x: 0, y: 0 }
  private autoScrollInterval: NodeJS.Timeout | null = null
  
  constructor(
    private container: HTMLElement,
    private options: DragDropOptions = {},
    private callbacks: DragDropCallbacks = {}
  ) {
    this.options = {
      dragThreshold: 10,
      longPressDelay: 300,
      autoScrollSpeed: 2,
      autoScrollThreshold: 50,
      hapticFeedback: true,
      ...options
    }
    
    this.bindEvents()
  }
  
  private bindEvents() {
    // Use touch events for better mobile support
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.container.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
    
    // Fallback to mouse events for desktop
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this))
  }
  
  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return
    
    const touch = e.touches[0]
    const target = e.target as HTMLElement
    
    if (!this.isDraggable(target)) return
    
    this.startDrag(target, { x: touch.clientX, y: touch.clientY })
    
    // Start long press timer for drag initiation
    setTimeout(() => {
      if (!this.isDragging && this.dragElement) {
        this.initiateDrag()
      }
    }, this.options.longPressDelay)
  }
  
  private handleTouchMove(e: TouchEvent) {
    if (!this.dragElement || e.touches.length !== 1) return
    
    e.preventDefault() // Prevent scrolling while dragging
    
    const touch = e.touches[0]
    this.updateDrag({ x: touch.clientX, y: touch.clientY })
  }
  
  private handleTouchEnd(e: TouchEvent) {
    if (!this.dragElement) return
    
    const touch = e.changedTouches[0]
    this.endDrag({ x: touch.clientX, y: touch.clientY })
  }
  
  private handleTouchCancel(e: TouchEvent) {
    this.cancelDrag()
  }
  
  private handleMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement
    
    if (!this.isDraggable(target)) return
    
    this.startDrag(target, { x: e.clientX, y: e.clientY })
  }
  
  private handleMouseMove(e: MouseEvent) {
    if (!this.isDragging) return
    
    this.updateDrag({ x: e.clientX, y: e.clientY })
  }
  
  private handleMouseUp(e: MouseEvent) {
    if (!this.isDragging) return
    
    this.endDrag({ x: e.clientX, y: e.clientY })
  }
  
  private isDraggable(element: HTMLElement): boolean {
    return element.hasAttribute('data-draggable') || 
           element.closest('[data-draggable]') !== null
  }
  
  private startDrag(element: HTMLElement, pointer: { x: number; y: number }) {
    this.dragElement = element.closest('[data-draggable]') as HTMLElement || element
    this.startPosition = { ...pointer }
    this.currentPosition = { ...pointer }
    
    const rect = this.dragElement.getBoundingClientRect()
    this.offset = {
      x: pointer.x - rect.left,
      y: pointer.y - rect.top
    }
  }
  
  private initiateDrag() {
    if (!this.dragElement) return
    
    this.isDragging = true
    
    // Haptic feedback
    if (this.options.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    // Create ghost element
    this.createGhostElement()
    
    // Add dragging class
    this.dragElement.classList.add('dragging')
    this.container.classList.add('drag-active')
    
    this.callbacks.onDragStart?.(this.dragElement, this.currentPosition)
  }
  
  private updateDrag(pointer: { x: number; y: number }) {
    this.currentPosition = { ...pointer }
    
    if (!this.isDragging) {
      // Check if we've moved enough to start dragging
      const distance = Math.sqrt(
        Math.pow(pointer.x - this.startPosition.x, 2) +
        Math.pow(pointer.y - this.startPosition.y, 2)
      )
      
      if (distance > this.options.dragThreshold!) {
        this.initiateDrag()
      }
      return
    }
    
    // Update ghost element position
    if (this.ghostElement) {
      this.ghostElement.style.left = `${pointer.x - this.offset.x}px`
      this.ghostElement.style.top = `${pointer.y - this.offset.y}px`
    }
    
    // Auto-scroll
    this.handleAutoScroll(pointer)
    
    this.callbacks.onDragMove?.(this.dragElement!, pointer)
  }
  
  private endDrag(pointer: { x: number; y: number }) {
    if (!this.isDragging || !this.dragElement) {
      this.cleanup()
      return
    }
    
    // Find drop target
    const dropTarget = this.findDropTarget(pointer)
    
    // Haptic feedback for drop
    if (this.options.hapticFeedback && 'vibrate' in navigator && dropTarget) {
      navigator.vibrate(25)
    }
    
    this.callbacks.onDragEnd?.(this.dragElement, dropTarget)
    this.cleanup()
  }
  
  private cancelDrag() {
    if (!this.dragElement) return
    
    this.callbacks.onDragCancel?.(this.dragElement)
    this.cleanup()
  }
  
  private createGhostElement() {
    if (!this.dragElement) return
    
    this.ghostElement = this.dragElement.cloneNode(true) as HTMLElement
    this.ghostElement.classList.add('drag-ghost')
    
    // Style the ghost element
    Object.assign(this.ghostElement.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '9999',
      opacity: '0.8',
      transform: 'rotate(5deg)',
      transition: 'none',
      left: `${this.currentPosition.x - this.offset.x}px`,
      top: `${this.currentPosition.y - this.offset.y}px`
    })
    
    document.body.appendChild(this.ghostElement)
  }
  
  private handleAutoScroll(pointer: { x: number; y: number }) {
    const containerRect = this.container.getBoundingClientRect()
    const threshold = this.options.autoScrollThreshold!
    const speed = this.options.autoScrollSpeed!
    
    let scrollDelta = 0
    
    if (pointer.y < containerRect.top + threshold) {
      scrollDelta = -speed
    } else if (pointer.y > containerRect.bottom - threshold) {
      scrollDelta = speed
    }
    
    if (scrollDelta !== 0) {
      if (!this.autoScrollInterval) {
        this.autoScrollInterval = setInterval(() => {
          this.container.scrollTop += scrollDelta
        }, 16) // ~60fps
      }
    } else {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval)
        this.autoScrollInterval = null
      }
    }
  }
  
  private findDropTarget(pointer: { x: number; y: number }): HTMLElement | null {
    // Temporarily hide ghost element to get element underneath
    if (this.ghostElement) {
      this.ghostElement.style.display = 'none'
    }
    
    const elementBelow = document.elementFromPoint(pointer.x, pointer.y) as HTMLElement
    
    if (this.ghostElement) {
      this.ghostElement.style.display = 'block'
    }
    
    if (!elementBelow) return null
    
    // Find the closest drop target
    return elementBelow.closest('[data-drop-target]') as HTMLElement
  }
  
  private cleanup() {
    // Clear auto-scroll
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval)
      this.autoScrollInterval = null
    }
    
    // Remove ghost element
    if (this.ghostElement) {
      document.body.removeChild(this.ghostElement)
      this.ghostElement = null
    }
    
    // Remove classes
    if (this.dragElement) {
      this.dragElement.classList.remove('dragging')
    }
    this.container.classList.remove('drag-active')
    
    // Reset state
    this.isDragging = false
    this.dragElement = null
    this.startPosition = { x: 0, y: 0 }
    this.currentPosition = { x: 0, y: 0 }
    this.offset = { x: 0, y: 0 }
  }
  
  destroy() {
    this.cleanup()
    
    // Remove event listeners
    this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.container.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.container.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
    this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    this.container.removeEventListener('mouseup', this.handleMouseUp.bind(this))
  }
}

// CSS classes for styling (to be added to global styles)
export const mobileDragDropStyles = `
.drag-active {
  user-select: none;
  -webkit-user-select: none;
}

.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  transition: opacity 0.2s, transform 0.2s;
}

.drag-ghost {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  background: white;
}

[data-draggable] {
  touch-action: none;
  cursor: grab;
}

[data-draggable]:active {
  cursor: grabbing;
}

[data-drop-target] {
  transition: background-color 0.2s;
}

[data-drop-target].drag-over {
  background-color: rgba(59, 130, 246, 0.1);
  border: 2px dashed #3b82f6;
}
`