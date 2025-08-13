'use client'

import { Star } from 'lucide-react'

const Reviews = () => {
  const reviews = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'TechCorp',
      rating: 5,
      content: 'ResumeIT helped me find my dream job in just 2 weeks! The AI matching was incredibly accurate.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'StartupXYZ',
      rating: 5,
      content: 'The platform understood my skills better than traditional job boards. Got multiple interviews quickly.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      company: 'DesignStudio',
      rating: 5,
      content: 'Amazing experience! The AI recommendations were spot-on and saved me hours of job searching.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'David Park',
      role: 'Data Scientist',
      company: 'Analytics Pro',
      rating: 5,
      content: 'The AI analysis of my resume revealed skills I didn\'t even know were valuable. Landed my ideal role within a month!',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Jessica Taylor',
      role: 'Marketing Director',
      company: 'BrandForward',
      rating: 5,
      content: 'ResumeIT\'s matching algorithm is phenomenal. It connected me with companies that were perfect cultural fits.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Alex Kumar',
      role: 'DevOps Engineer',
      company: 'CloudTech',
      rating: 5,
      content: 'Finally, a platform that understands technical skills! The job matches were incredibly relevant and high-quality.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face'
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who've transformed their careers with ResumeIT's AI-powered job matching.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={review.name} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Review Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{review.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-600">{review.role} at {review.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-soft">
            <div className="flex items-center mr-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900 mr-2">4.9/5</span>
            <span className="text-gray-600">from 3,200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Reviews
