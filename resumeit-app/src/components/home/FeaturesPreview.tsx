'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FeaturesPreview = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze resumes and job descriptions to find perfect matches with 95% accuracy.',
      link: '/ai-recommendation'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Get detailed insights into your hiring process with comprehensive analytics and reporting.',
      link: '/dashboard'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Process hundreds of resumes in seconds, not hours. Dramatically reduce time-to-hire.',
      link: '/features'
    },
    {
      icon: '🎯',
      title: 'Precision Scoring',
      description: 'Every candidate gets a detailed match score with explanations for why they fit the role.',
      link: '/features'
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
            Why Choose ResumeIT?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform transforms the way you hire, making it faster, 
            more accurate, and incredibly efficient.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={feature.link}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer h-full">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 text-primary-600 font-medium group-hover:underline">
                    Learn more →
                  </div>
                </div>
              </Link>
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
          <Link
            href="/features"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg"
          >
            Explore All Features
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesPreview
