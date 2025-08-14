'use client'
const YouTubeVideos = () => {
  const videos = [
    {
      id: "lnGQc2FD1GM",
      title: "AI Powered Recruiting Platform",
      description: "See how ResumeIT's advanced AI algorithms analyze resumes, match candidates to job requirements, and streamline your hiring workflow to find the perfect talent faster."
    },
    {
      id: "Jmhu5bOix4w",
      title: "The Correct Way to Format Your Resume",
      description: "Learn the professional standards and best practices for formatting your resume to make a great first impression with recruiters and hiring managers."
    },
    {
      id: "Q_rim0W-IEM", 
      title: "How to Tailor Your Resume",
      description: "Discover expert techniques to customize your resume for specific job applications and increase your chances of getting interviews."
    }
  ]
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resume & Career Resources
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how our AI technology revolutionizes the recruitment process and learn expert tips to create winning resumes that get results.
          </p>
        </div>
        <div className="grid gap-8 md:gap-12">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videos[0].id}?controls=1&modestbranding=1&rel=0`}
                title={videos[0].title}
                className="w-full h-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {videos[0].title}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {videos[0].description}
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {videos.slice(1).map((video, index) => (
              <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-video bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?controls=1&modestbranding=1&rel=0`}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Optimize Your Resume?
            </h3>
            <p className="text-gray-600 mb-6">
              Use our AI-powered platform to create, format, and tailor your resume for maximum impact.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
export default YouTubeVideos
