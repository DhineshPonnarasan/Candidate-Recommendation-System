import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input

