'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Button from './Button'
import Card from './Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <Card variant="elevated" className="max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-danger-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6 font-body">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="flex items-center justify-center"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

