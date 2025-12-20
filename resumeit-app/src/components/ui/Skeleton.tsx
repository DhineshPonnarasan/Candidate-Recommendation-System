import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, animation = 'pulse', ...props }, ref) => {
    const baseStyles = 'bg-gray-200 dark:bg-gray-700'
    
    const variants = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
      rounded: 'rounded-xl',
    }

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    }

    const style: React.CSSProperties = {
      width: width || (variant === 'text' ? '100%' : undefined),
      height: height || (variant === 'circular' ? width : undefined),
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          animations[animation],
          className
        )}
        style={style}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

export default Skeleton

