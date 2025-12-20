'use client'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 min-h-screen flex items-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-[0.03]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center lg:text-left" variants={itemVariants}>
            <motion.div 
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-semibold text-sm mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SparklesIcon className="w-5 h-5 mr-2 animate-pulse-soft" />
              AI-Powered Recruitment Platform
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[1.1] mb-8">
              <span className="text-gray-900 block mb-2">
                Find Your
              </span>
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent block animate-gradient-shift bg-[length:200%_auto]">
                Perfect Match
              </span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-body"
              variants={itemVariants}
            >
              ResumeIT uses advanced AI to match candidates with their ideal jobs instantly. 
              Stop endless job hunting and let our intelligent system work for you.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 mb-12 text-gray-700 font-medium"
              variants={itemVariants}
            >
              {[
                { text: '98% Match Accuracy', icon: CheckCircleIcon },
                { text: 'Instant Results', icon: CheckCircleIcon },
                { text: '100% Free to Start', icon: CheckCircleIcon },
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-center lg:justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <feature.icon className="w-6 h-6 text-success-500 mr-3 flex-shrink-0" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={itemVariants}
            >
              <Link
                href="/ai-recommendation"
                className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'group')}
              >
                Try AI Matching Now
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/features"
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
              >
                Learn More
              </Link>
            </motion.div>
            <motion.div 
              className="mt-16 pt-8 border-t border-gray-200"
              variants={itemVariants}
            >
              <div className="grid grid-cols-3 gap-8">
                {[
                  { value: '10K+', label: 'Resumes Analyzed' },
                  { value: '95%', label: 'Match Accuracy' },
                  { value: '500+', label: 'Companies Served' },
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <div className="relative max-w-md mx-auto">
              <motion.div 
                className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    JS
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">John Smith</h3>
                    <p className="text-gray-600">Senior Software Engineer</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'Python', 'AWS'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Experience</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Tech Corp</p>
                        <p className="text-sm text-gray-600">Senior Developer</p>
                      </div>
                      <span className="text-xs text-gray-500">2020-2024</span>
                    </div>
                  </div>
                </div>
                <motion.div 
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-success-500 to-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className="w-2 h-2 bg-white rounded-full mr-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    AI Analyzing...
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Floating Match Cards */}
              {[
                { position: '-left-8 top-1/4', match: '95%', company: 'Frontend Engineer at TechCorp', color: 'success' },
                { position: '-right-8 bottom-1/4', match: '92%', company: 'Full Stack at StartupXYZ', color: 'primary' },
                { position: '-left-6 bottom-8', match: '89%', company: 'Senior Dev at BigTech', color: 'accent' },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  className={`absolute ${card.position} bg-white rounded-xl p-4 shadow-lg border border-gray-100 backdrop-blur-sm`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1 + index * 0.2, type: 'spring', stiffness: 100 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 bg-${card.color}-500 rounded-full mr-2`}></div>
                    <span className="text-sm font-semibold text-gray-700">{card.match} Match</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.company}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
export default Hero
