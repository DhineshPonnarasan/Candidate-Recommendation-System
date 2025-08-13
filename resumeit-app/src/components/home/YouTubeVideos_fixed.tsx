'use client'

import { useState, useEffect } from 'react'

const YouTubeVideos = () => {
  const [currentVideo, setCurrentVideo] = useState(0)

  const videos = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'How ResumeIT Works - AI Job Matching',
      description: 'See how our AI technology matches candidates with perfect job opportunities.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Success Stories - Finding Dream Jobs',
      description: 'Real users share their success stories of finding jobs through ResumeIT.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Resume Optimization Tips',
      description: 'Learn how to optimize your resume for better AI matching results.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [videos.length])

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See ResumeIT in Action
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Watch how our AI-powered platform transforms the job search experience for both candidates and employers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video Player */}
          <div className="relative">
            <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videos[currentVideo].id}?autoplay=0&controls=1&modestbranding=1`}
                title={videos[currentVideo].title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Video Info */}
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">{videos[currentVideo].title}</h3>
              <p className="text-gray-300">{videos[currentVideo].description}</p>
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div
                key={video.id + index}
                onClick={() => setCurrentVideo(index)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  currentVideo === index
                    ? 'bg-primary-600 shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{video.title}</h4>
                    <p className="text-sm text-gray-300">{video.description}</p>
                  </div>
                  {currentVideo === index && (
                    <div className="text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-400 mb-2">50K+</div>
            <div className="text-gray-300">Video Views</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-400 mb-2">1.2K</div>
            <div className="text-gray-300">Subscribers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-400 mb-2">98%</div>
            <div className="text-gray-300">Positive Feedback</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default YouTubeVideos
