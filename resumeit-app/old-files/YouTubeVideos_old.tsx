'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const YouTubeVideos = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const videos = [
    {
      id: 'lnGQc2FD1GM',
      title: 'AI Powered Recruiting Platform',
      description: 'See how AI is transforming the recruitment process with smart candidate matching.',
      autoplay: true
    },
    {
      id: 'Jmhu5bOix4w',
      title: 'The Correct Way to Format Your Resume',
      description: 'Learn the best practices for resume formatting that gets noticed by recruiters.',
      autoplay: false
    },
    {
      id: 'Q_rim0W-IEM',
      title: 'How to Tailor Your Resume',
      description: 'Master the art of customizing your resume for specific job applications.',
      autoplay: false
    }
  ]

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Master Your Career Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch expert insights and tips to accelerate your professional growth
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Your Career Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch expert insights and tips to accelerate your professional growth
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative pb-56 h-0 overflow-hidden">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}?${
                    video.autoplay 
                      ? 'autoplay=1&mute=1&controls=1&enablejsapi=1&origin=' + (typeof window !== 'undefined' ? window.location.origin : '')
                      : 'controls=1&enablejsapi=1&origin=' + (typeof window !== 'undefined' ? window.location.origin : '')
                  }&rel=0&modestbranding=1&playsinline=1`}
                  title={video.title}
                  frameBorder="0"
                  allow={`accelerometer; ${video.autoplay ? 'autoplay;' : ''} clipboard-write; encrypted-media; gyroscope; picture-in-picture`}
                  allowFullScreen
                  loading="lazy"
                  style={{ 
                    aspectRatio: '16/9',
                    width: '100%',
                    height: '100%'
                  }}
                ></iframe>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {video.description}
                </p>
                {video.autoplay && (
                  <div className="mt-3 flex items-center text-primary-600 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Featured Video
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Ready to transform your career with AI-powered insights?
          </p>
          <button className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Start Your Journey
          </button>
        </motion.div>
      </div>
      
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          iframe {
            /* Respect user's preference for reduced motion */
          }
        }
      `}</style>
    </section>
  )
}

export default YouTubeVideos
