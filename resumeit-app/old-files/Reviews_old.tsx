'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const Reviews = () => {
  const reviews = [
    {
      name: "Sebastian Tibbling",
      review: "Excellent resume keyword scanner for ensuring my resume is ATS compliant. After using the resume checker and making the recommended changes, there was clearly a tremendous improvement in the number of interviews I received.",
      rating: 5
    },
    {
      name: "Cecelia Roux", 
      review: "ResumeIT tells me exactly which skills and keywords are missing. It gives me a clear indication of which skills are important. On top of that, great live chat for any support questions!",
      rating: 5
    },
    {
      name: "Roger Adams",
      review: "A great tool to tailor a resume to a specific job posting. Great price compared to other similar services. I signed up for the monthly plan and it was by far the best choice I ever made in my job search. Easy to use and great user interface. Update: I was hired by my dream company. Thanks, ResumeIT!",
      rating: 5
    },
    {
      name: "Martin Rosén",
      review: "Best ATS Resume Checker! Great customer support and friendly.",
      rating: 5
    },
    {
      name: "Kallie Pieterse",
      review: "I recommend ResumeIT for job applications going through an Applicant Tracking System!",
      rating: 5
    },
    {
      name: "David Ramond",
      review: "Great resume checker! I already have interviews to schedule after a couple of days :). Giving ResumeIT 5 stars. Great work ResumeIT and I will use again in my future job searches!",
      rating: 5
    },
    {
      name: "Helga Kruger",
      review: "Easy to use and great support. Thanks ResumeIT for helping me tailor my resume with your keyword scanner.",
      rating: 5
    },
    {
      name: "Zani Oosthuizen",
      review: "Very useful for identifying missing keywords from my resume. Please keep rolling out new features and enhancements regularly. And a very friendly support team who respond quickly and do their best to keep me satisfied. I would wholeheartedly recommend ResumeIT to any type of Job Seeker.",
      rating: 5
    },
    {
      name: "Erin Pretorius",
      review: "Easy to follow resume feedback. Wish I would have known about this sooner. I love the instant results from the resume checker!",
      rating: 5
    },
    {
      name: "Michelle Leitzler",
      review: "Thanks for creating this innovative resume scanner that has helped me get my dream job!",
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Here's What Our Customers Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of job seekers who have transformed their careers with ResumeIT
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                "{review.review}"
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">ResumeIT Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Start optimizing your resume today and land your dream job faster
            </p>
            <motion.a
              href="/ai-recommendation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Get Started Free
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Reviews
