'use client'

import { motion } from 'framer-motion'

const VideoSection = () => {
  const videos = [
    {
      title: 'AI Powered Recruiting Platform',
      description: 'Discover how AI is revolutionizing the recruitment industry and streamlining hiring processes.',
      embedId: 'lnGQc2FD1GM',
      duration: '5:42'
    },
    {
      title: 'The Correct Way to Format Your Resume',
      description: 'Learn professional resume formatting techniques that help you stand out to employers.',
      embedId: 'Jmhu5bOix4w',
      duration: '8:15'
    },
    {
      title: 'How to Tailor Your Resume',
      description: 'Master the art of customizing your resume for specific job opportunities and industries.',
      embedId: 'Q_rim0W-IEM',
      duration: '12:30'
    }
  ]

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
            Learn from the Experts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch our curated video content to master recruitment best practices 
            and get the most out of ResumeIT.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.embedId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-video bg-gray-900">
                <iframe
                  src={`https://www.youtube.com/embed/${video.embedId}`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {video.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-primary-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Hiring?
            </h3>
            <p className="text-gray-600 mb-6">
              Start your free trial today and experience the power of AI-driven recruitment.
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg">
              Start Free Trial
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default VideoSection
