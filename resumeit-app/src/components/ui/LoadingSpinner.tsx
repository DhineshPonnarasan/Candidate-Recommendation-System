import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'white' | 'gray'
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'primary', ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-2',
      lg: 'w-12 h-12 border-3',
    }

    const variants = {
      primary: 'border-primary-600 border-t-transparent',
      white: 'border-white border-t-transparent',
      gray: 'border-gray-400 border-t-transparent',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block rounded-full animate-spin',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner

