'use client'

import { motion } from 'framer-motion'

const FeaturesHero = () => {
  return (
    <section className="bg-gradient-to-br from-primary-600 to-blue-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Powerful Features for
            <br />
            <span className="text-blue-200">Modern Recruitment</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover how ResumeIT's advanced AI technology and intuitive features 
            can transform your hiring process and help you find the best talent faster.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesHero
