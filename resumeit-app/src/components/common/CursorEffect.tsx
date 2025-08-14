'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
const CursorEffect: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [trails, setTrails] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  useEffect(() => {
    if (!isDesktop) return
    let trailId = 0
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setTrails(prev => {
        const newTrail = { x: e.clientX, y: e.clientY, id: trailId++ }
        const updatedTrails = [...prev, newTrail]
        return updatedTrails.slice(-10) // Keep only last 10 points
      })
      const target = e.target as HTMLElement
      const isInteractive = target.tagName === 'BUTTON' || 
                           target.tagName === 'A' || 
                           !!target.closest('button') || 
                           !!target.closest('a') ||
                           target.classList.contains('cursor-pointer')
      setIsHovering(isInteractive)
    }
    const handleMouseLeave = () => {
      setTrails([])
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isDesktop])
  if (!isDesktop) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50 mix-blend-difference">
      <motion.div
        className="fixed w-6 h-6 rounded-full border-2 border-white"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 0.6,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />
      <motion.div
        className="fixed w-2 h-2 rounded-full bg-white"
        style={{
          left: mousePosition.x - 4,
          top: mousePosition.y - 4,
        }}
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          className="fixed w-1 h-1 rounded-full bg-white"
          style={{
            left: trail.x - 2,
            top: trail.y - 2,
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ 
            opacity: 0, 
            scale: 0,
            x: (mousePosition.x - trail.x) * 0.1,
            y: (mousePosition.y - trail.y) * 0.1,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />
      ))}
      {isHovering && (
        <motion.div
          className="fixed rounded-full border border-white/30"
          style={{
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
            width: 40,
            height: 40,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        />
      )}
    </div>
  )
}
export default CursorEffect
