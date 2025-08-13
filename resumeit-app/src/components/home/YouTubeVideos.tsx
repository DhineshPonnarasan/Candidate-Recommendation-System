'use client'

const YouTubeVideos = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Recruiting Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our AI technology revolutionizes the recruitment process, making hiring faster, smarter, and more efficient than ever before.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* YouTube Video Embed */}
          <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/lnGQc2FD1GM?controls=1&modestbranding=1&rel=0"
              title="AI Powered Recruiting Platform"
              className="w-full h-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          
          {/* Video Description */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Transform Your Recruitment Process
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how ResumeIT's advanced AI algorithms analyze resumes, match candidates to job requirements, 
              and streamline your hiring workflow to find the perfect talent faster.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default YouTubeVideos
