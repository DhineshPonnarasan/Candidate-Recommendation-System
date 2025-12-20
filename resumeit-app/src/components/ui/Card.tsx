import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      elevated: 'bg-white border border-gray-200 shadow-lg',
      outlined: 'bg-white border-2 border-gray-300',
      gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 transition-all duration-300',
          variants[variant],
          hover && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export default Card

