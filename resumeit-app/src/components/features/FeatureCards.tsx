'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FeatureCards = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Resume Matching',
      description: 'Advanced natural language processing analyzes resumes and job descriptions to extract key skills, experience, and qualifications with 95% accuracy.',
      benefits: ['Real-time analysis', 'Semantic understanding', 'Bias elimination'],
      actionButton: {
        text: 'Reveal Missing Words',
        url: 'https://ripplematch.com/',
        external: true
      }
    },
    {
      icon: '�',
      title: 'ATS Resume Checker',
      description: 'Comprehensive analysis to ensure your resume passes through Applicant Tracking Systems and gets noticed by hiring managers.',
      benefits: ['ATS optimization', 'Format validation', 'Keyword analysis'],
      actionButton: {
        text: 'Check My Resume',
        url: 'https://www.jobscan.co/',
        external: true
      }
    },
    {
      icon: '🔍',
      title: 'Resume Keyword Scanner',
      description: 'Intelligent scanning technology identifies crucial keywords and phrases that align with specific job requirements and industry standards.',
      benefits: ['Keyword density analysis', 'Industry benchmarking', 'Match scoring'],
      actionButton: {
        text: 'Score My Resume',
        url: 'https://resumeworded.com/score',
        external: true
      }
    },
    {
      icon: '⚡',
      title: 'Resume Tailoring Engine',
      description: 'AI-powered customization that adapts your resume for specific job applications, highlighting relevant experience and skills.',
      benefits: ['Job-specific optimization', 'Dynamic content', 'Success tracking'],
      actionButton: {
        text: 'Tailor Your Resume',
        url: 'https://huntr.co/resume/ai-resume-tailor/',
        external: true
      }
    },
    {
      icon: '�',
      title: 'Job Application Tracker',
      description: 'Comprehensive dashboard to manage your job applications, track interview progress, and monitor your job search success rate.',
      benefits: ['Application management', 'Progress tracking', 'Analytics dashboard'],
      actionButton: {
        text: 'Open Tracker',
        url: '/profile',
        external: false
      }
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Hire Better
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive feature set is designed to streamline every aspect 
            of your recruitment process.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-2 mb-6">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
              
              {/* Action Button */}
              <div className="mt-auto">
                {feature.actionButton.external ? (
                  <a
                    href={feature.actionButton.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 bg-primary-600 text-white text-center rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                  >
                    {feature.actionButton.text} →
                  </a>
                ) : (
                  <Link
                    href={feature.actionButton.url}
                    className="block w-full px-4 py-3 bg-primary-600 text-white text-center rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                  >
                    {feature.actionButton.text} →
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Enterprise Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-12"
        >
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise Features
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Advanced capabilities for organizations looking to scale their recruitment process
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h4 className="font-bold text-gray-900 mb-2">Enterprise Security</h4>
                <p className="text-gray-600 text-sm">SOC 2 compliance, SSO integration, and advanced data protection</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🔗</div>
                <h4 className="font-bold text-gray-900 mb-2">API Integration</h4>
                <p className="text-gray-600 text-sm">Connect with your existing ATS, HRIS, and workflow tools</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📈</div>
                <h4 className="font-bold text-gray-900 mb-2">Advanced Analytics</h4>
                <p className="text-gray-600 text-sm">Deep insights into hiring trends, bias detection, and ROI metrics</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureCards
