'use client'

import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface PageLoaderProps {
  message?: string
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-2">
              <LoadingSpinner size="lg" variant="primary" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-display font-semibold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-600 font-body">
          Please wait while we load your content
        </p>
      </div>
    </div>
  )
}

export default PageLoader

