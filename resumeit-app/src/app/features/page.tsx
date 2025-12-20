'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  TrophyIcon,
  ClockIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
export default function FeaturesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('external')
  const featureButtons = [
    {
      title: 'AI-Powered Resume Matching',
      description: 'Get intelligent insights into how well your resume matches job requirements with advanced AI analysis.',
      icon: <SparklesIcon className="w-8 h-8" />,
      buttonText: 'Reveal Missing Words',
      url: 'https://ripplematch.com/',
      gradient: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      stats: '95% accuracy rate',
      rating: 5,
      category: 'AI Tools'
    },
    {
      title: 'ATS Resume Checker',
      description: 'Ensure your resume passes through Applicant Tracking Systems with our comprehensive checker.',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      buttonText: 'Check My Resume',
      url: 'https://www.jobscan.co/',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      stats: '98% ATS compatibility',
      rating: 5,
      category: 'Resume Tools'
    },
    {
      title: 'Resume Keyword Scanner',
      description: 'Optimize your resume with the right keywords to improve your job application success rate.',
      icon: <MagnifyingGlassIcon className="w-8 h-8" />,
      buttonText: 'Score My Resume',
      url: 'https://resumeworded.com/score',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      stats: 'Boost success by 40%',
      rating: 5,
      category: 'Optimization'
    },
    {
      title: 'Resume Tailoring Engine',
      description: 'Automatically customize your resume for specific job applications using AI-powered tailoring.',
      icon: <PencilIcon className="w-8 h-8" />,
      buttonText: 'Tailor Your Resume',
      url: 'https://huntr.co/resume/ai-resume-tailor/',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      stats: '3x faster applications',
      rating: 5,
      category: 'AI Tools'
    },
    {
      title: 'Job Application Tracker',
      description: 'Keep track of all your job applications, interviews, and follow-ups in one organized dashboard.',
      icon: <ClipboardDocumentListIcon className="w-8 h-8" />,
      buttonText: 'Open Tracker',
      url: '/profile',
      gradient: 'from-pink-500 to-purple-600',
      bgColor: 'bg-pink-50',
      stats: 'Track 100+ applications',
      rating: 5,
      isInternal: true,
      category: 'Organization'
    }
  ]
  const internalFeatures = [
    {
      title: 'AI Interview Preparation',
      description: 'Practice with AI-powered mock interviews tailored to your target role and industry.',
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
      buttonText: 'Start Practice',
      url: '/ai-interview',
      gradient: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      stats: '1000+ Questions',
      rating: 5,
      isInternal: true,
      category: 'Interview Prep'
    },
    {
      title: 'Career Path Analytics',
      description: 'Get personalized career insights and growth recommendations based on market trends.',
      icon: <ChartBarIcon className="w-8 h-8" />,
      buttonText: 'View Analytics',
      url: '/career-analytics',
      gradient: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50',
      stats: 'Real-time data',
      rating: 5,
      isInternal: true,
      category: 'Analytics'
    },
    {
      title: 'Skill Assessment Hub',
      description: 'Take comprehensive skill assessments to identify strengths and areas for improvement.',
      icon: <BeakerIcon className="w-8 h-8" />,
      buttonText: 'Take Assessment',
      url: '/skill-assessment',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      stats: '50+ Skills',
      rating: 5,
      isInternal: true,
      category: 'Assessment'
    },
    {
      title: 'Learning Resources',
      description: 'Access curated learning materials and courses to enhance your professional skills.',
      icon: <AcademicCapIcon className="w-8 h-8" />,
      buttonText: 'Browse Courses',
      url: '/learning',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      stats: '500+ Courses',
      rating: 5,
      isInternal: true,
      category: 'Learning'
    }
  ]
  const additionalFeatures = [
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: 'Smart Candidate Matching',
      description: 'AI algorithms match candidates with perfect job opportunities based on skills, experience, and preferences.',
      benefits: ['98% match accuracy', 'Real-time processing', 'Behavioral analysis']
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Get detailed insights into your job search performance and application success rates.',
      benefits: ['Live dashboard', 'Performance metrics', 'Trend analysis']
    },
    {
      icon: <BoltIcon className="w-6 h-6" />,
      title: 'Instant Notifications',
      description: 'Stay updated with real-time alerts for new job matches and application status changes.',
      benefits: ['Push notifications', 'Email alerts', 'SMS updates']
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: 'Privacy Protection',
      description: 'Your data is encrypted and secure. Control who sees your profile and personal information.',
      benefits: ['End-to-end encryption', 'GDPR compliant', 'Data ownership']
    }
  ]
  const stats = [
    { number: '100K+', label: 'Active Users', color: 'text-blue-600', icon: <UserGroupIcon className="w-6 h-6" /> },
    { number: '97%', label: 'Success Rate', color: 'text-green-600', icon: <TrophyIcon className="w-6 h-6" /> },
    { number: '24/7', label: 'AI Support', color: 'text-purple-600', icon: <ClockIcon className="w-6 h-6" /> },
    { number: '15M+', label: 'Jobs Analyzed', color: 'text-orange-600', icon: <ChartBarIcon className="w-6 h-6" /> }
  ]
  const handleFeatureClick = (feature: any) => {
    if (feature.isInternal) {
      if (user) {
        router.push(feature.url)
      } else {
        router.push('/login')
      }
    } else {
      window.open(feature.url, '_blank', 'noopener,noreferrer')
    }
  }
  const currentFeatures = activeTab === 'external' ? featureButtons : internalFeatures
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium text-sm mb-6 shadow-lg">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Next-Gen Career Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              Comprehensive Career
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Success Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-body">
              Everything you need to accelerate your career - from AI-powered resume optimization to interview preparation, skill assessments, and job matching.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-lg ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('external')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'external'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                External Tools
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'internal'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Platform Features
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={`${activeTab}-title`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              {activeTab === 'external' ? 'Essential External Tools' : 'Built-in Platform Features'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-body">
              {activeTab === 'external' 
                ? 'Access powerful third-party tools for resume optimization and career development.'
                : 'Comprehensive features built right into our platform for complete career management.'
              }
            </p>
          </motion.div>
          <motion.div
            key={`${activeTab}-grid`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {currentFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: currentFeatures.indexOf(feature) * 0.1 }}
                className={`${feature.bgColor} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group border border-gray-100 relative overflow-hidden`}
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/70 text-gray-600">
                    {feature.category}
                  </span>
                </div>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-gray-700 bg-white/70 px-3 py-1 rounded-full">
                    {feature.stats}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    {[...Array(feature.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleFeatureClick(feature)}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                >
                  {feature.buttonText}
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-100 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Advanced Platform Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the full range of features that make ResumeIT the most comprehensive career platform available.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white font-medium text-sm mb-6">
              <TrophyIcon className="w-5 h-5 mr-2" />
              Start Your Success Journey
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join over 100,000 professionals who have transformed their careers with ResumeIT's comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={() => router.push('/ai-recommendation')}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                Schedule Demo
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm opacity-75">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
