'use client'

import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-hero-pattern"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-medium text-sm mb-6 shadow-lg">
              <SparklesIcon className="w-5 h-5 mr-2" />
              AI-Powered Recruitment Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
              <span className="text-black">
                Find Your
              </span>
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Perfect Match
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              ResumeIT uses advanced AI to match candidates with their ideal jobs instantly. 
              Stop endless job hunting and let our intelligent system work for you.
            </p>

            {/* Feature List */}
            <div className="flex flex-col sm:flex-row gap-6 mb-10 text-gray-700">
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-success-500 mr-3 flex-shrink-0" />
                <span>98% Match Accuracy</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-success-500 mr-3 flex-shrink-0" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-success-500 mr-3 flex-shrink-0" />
                <span>100% Free to Start</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/ai-recommendation"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
              >
                Try AI Matching Now
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/features"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            {/* Stats Section */}
            <div className="mt-12 pt-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Resumes Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Match Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Companies Served</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Resume Demo */}
          <div className="relative">
            <div className="relative max-w-md mx-auto">
              {/* Main Resume Card */}
              <div className="bg-white rounded-2xl shadow-hard p-8 border border-gray-100 hover:shadow-glow transition-all duration-300">
                {/* Resume Header */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    JS
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">John Smith</h3>
                    <p className="text-gray-600">Senior Software Engineer</p>
                  </div>
                </div>

                {/* Skills */}
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

                {/* Experience */}
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

                {/* AI Analysis Overlay */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-success-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse-soft">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    AI Analyzing...
                  </div>
                </div>
              </div>

              {/* Fixed Match Indicators */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl p-4 shadow-medium border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">95% Match</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Frontend Engineer at TechCorp</p>
              </div>

              <div className="absolute -right-8 bottom-1/4 bg-white rounded-xl p-4 shadow-medium border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">92% Match</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Full Stack at StartupXYZ</p>
              </div>

              <div className="absolute -left-6 bottom-8 bg-white rounded-xl p-4 shadow-medium border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">89% Match</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Senior Dev at BigTech</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
