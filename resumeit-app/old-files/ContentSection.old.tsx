'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Target, Zap, Users, TrendingUp, Shield } from 'lucide-react'

const ContentSection = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Smart Matching",
      description: "Our AI analyzes your resume and matches you with the perfect job opportunities",
      stats: "98% Match Accuracy"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: "Instant Analysis",
      description: "Get comprehensive resume feedback and optimization suggestions in seconds",
      stats: "< 5 Second Analysis"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Recruiter Network",
      description: "Connect directly with hiring managers from top companies worldwide",
      stats: "10,000+ Recruiters"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Career Growth",
      description: "Track your progress and receive personalized career advancement tips",
      stats: "3x Faster Hiring"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes through Applicant Tracking Systems successfully",
      stats: "95% ATS Success Rate"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "Success Guarantee",
      description: "Get more interviews or get your money back - we're that confident",
      stats: "Money-Back Guarantee"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Top Professionals Choose ResumeIT
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join the revolution that's transforming how people find their dream jobs. 
            Our AI-powered platform gives you the competitive edge you need.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500K+</div>
            <div className="text-gray-600">Resumes Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">24H</div>
            <div className="text-gray-600">Average Response</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">150+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <div className="text-sm font-medium text-blue-600">{feature.stats}</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of thousands of professionals who have already accelerated their careers with ResumeIT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/ai-recommendation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                Start Free Analysis
              </motion.a>
              <motion.a
                href="/features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Learn More
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContentSection
