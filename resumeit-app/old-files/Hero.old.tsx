'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-blue-500/5"></div>
      
      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium"
            >
              <SparklesIcon className="w-4 h-4" />
              Next-Generation Recruitment Platform
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-secondary-900">Transform Your</span>{' '}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 bg-clip-text text-transparent">
                Recruitment
              </span>{' '}
              <span className="text-secondary-900">with AI</span>
            </h1>
            
            <p className="text-xl text-secondary-600 leading-relaxed max-w-2xl">
              Revolutionize hiring with our intelligent platform that matches the perfect candidates 
              with the right opportunities in seconds. Experience the future of recruitment today.
            </p>
            
            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-secondary-700">
              {[
                'AI-Powered Matching',
                'Instant Resume Analysis',
                'Smart Candidate Scoring',
                'Automated Workflows'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span className="font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/ai-recommendation"
                className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-glow hover:scale-105 flex items-center justify-center gap-2"
              >
                Try Demo
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="group border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-medium flex items-center justify-center gap-2"
              >
                Start Free Trial
              </Link>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center flex-wrap gap-6 text-sm text-secondary-600"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                14-Day Free Trial
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                Setup in 5 Minutes
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Interactive Resume Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-white rounded-3xl shadow-hard p-8 border border-secondary-200/50 backdrop-blur-sm">
                {/* Profile Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-medium">
                      JS
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-secondary-900">John Smith</h3>
                    <p className="text-secondary-600 font-medium">Senior Software Engineer</p>
                    <p className="text-sm text-secondary-500">San Francisco, CA</p>
                  </div>
                </div>
                
                {/* Skills Section */}
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-800 mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-primary-500" />
                    Top Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { skill: 'React', level: 95 },
                      { skill: 'TypeScript', level: 90 },
                      { skill: 'Node.js', level: 85 },
                      { skill: 'Python', level: 80 },
                      { skill: 'AWS', level: 75 }
                    ].map((item, index) => (
                      <motion.div
                        key={item.skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                        className="group relative"
                      >
                        <span className="px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 rounded-xl text-sm font-medium border border-primary-200 hover:from-primary-100 hover:to-blue-100 transition-all duration-200 cursor-pointer">
                          {item.skill}
                        </span>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                          {item.level}% Match
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Experience */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-800 mb-3">Recent Experience</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                      <p className="font-medium text-secondary-800">Senior Developer at TechCorp</p>
                      <p className="text-secondary-600 text-sm">2020 - Present • 4 years</p>
                      <div className="mt-2 flex gap-2">
                        <span className="px-2 py-1 bg-success-100 text-success-700 rounded-md text-xs">Full-time</span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs">Remote</span>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                      <p className="font-medium text-secondary-800">Full Stack Developer at StartupXY</p>
                      <p className="text-secondary-600 text-sm">2018 - 2020 • 2 years</p>
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-md text-xs">Startup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Analysis Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -bottom-4 -right-4 bg-gradient-to-r from-success-500 to-success-600 text-white p-6 rounded-2xl shadow-glow-lg"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">94%</div>
                  <div className="text-sm opacity-90">Perfect Match</div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Analysis Indicators */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-medium"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="text-sm font-medium">AI Analyzing...</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-8 bg-gradient-to-r from-accent-500 to-accent-600 text-white p-3 rounded-lg shadow-medium"
              >
                <div className="text-xs font-medium">Skills Match</div>
                <div className="text-lg font-bold">98%</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
              </div>
              
              {/* AI Analysis Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -right-4 -bottom-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">94%</div>
                  <div className="text-sm">Match Score</div>
                </div>
              </motion.div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -left-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg"
            >
              <div className="text-xs">AI Analyzing...</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
