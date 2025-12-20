import React from 'react'
import Skeleton from './Skeleton'
import Card from './Card'

interface CardSkeletonProps {
  lines?: number
  showAvatar?: boolean
  showImage?: boolean
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  lines = 3, 
  showAvatar = false,
  showImage = false 
}) => {
  return (
    <Card variant="default">
      {showImage && (
        <Skeleton variant="rectangular" height={200} className="mb-4" />
      )}
      
      <div className="flex items-start gap-4 mb-4">
        {showAvatar && (
          <Skeleton variant="circular" width={48} height={48} />
        )}
        <div className="flex-1">
          <Skeleton variant="text" height={24} width="60%" className="mb-2" />
          <Skeleton variant="text" height={20} width="40%" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="text" 
            height={16}
            width={index === lines - 1 ? '80%' : '100%'}
          />
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Skeleton variant="rounded" height={32} width={100} />
        <Skeleton variant="rounded" height={32} width={100} />
      </div>
    </Card>
  )
}

export default CardSkeleton

