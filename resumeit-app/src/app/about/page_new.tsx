'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { 
  SparklesIcon,
  EyeIcon,
  ScaleIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
const About = () => {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({})
  const handleImageError = (memberName: string) => {
    setImageErrors(prev => ({ ...prev, [memberName]: true }))
  }
  const generateInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  const team = [
    {
      name: 'Dhinesh Ponnarasan',
      role: 'Chief Executive Officer',
      image: '/Dhinesh.png',
      bio: 'Specializes in data science and model optimization, passionate about creating scalable AI-powered systems',
      linkedin: 'https://www.linkedin.com/in/dhinesh-s-p/',
      color: 'from-primary-500 to-primary-600'
    },
    {
      name: 'Raguraja Krishnan',
      role: 'Chief Technology Officer',
      image: '/Ragu.png',
      bio: 'Expert in AI product strategy with a track record in turning complex algorithms into intuitive solutions.',
      linkedin: 'https://www.linkedin.com/in/ragurajakrishnan/',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Jayasuya',
      role: 'Chief Operating Officer',
      image: '/Jayasurya.png',
      bio: 'Focused on AI-driven software development with expertise in deep learning and automation workflows.',
      linkedin: 'https://www.linkedin.com/in/jayasurya-chinnappaudayar-murugan/',
      color: 'from-accent-500 to-accent-600'
    },
    {
      name: 'Bharath Puvichandran',
      role: 'Chief Financial Officer',
      image: '/Bharath.png',
      bio: 'Experienced in AI business applications and analytics, dedicated to bridging technology with real-world impact.',
      linkedin: 'https://www.linkedin.com/in/bharath-puvichandran-182092274/',
      color: 'from-emerald-500 to-emerald-600'
    }
  ]
  const values = [
    {
      title: 'Innovation',
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      description: 'We leverage cutting-edge AI technology to revolutionize how candidates and employers connect.',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Transparency',
      icon: <EyeIcon className="w-8 h-8" />,
      description: 'Our matching process is clear and explainable, giving you insights into why recommendations are made.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Fairness',
      icon: <ScaleIcon className="w-8 h-8" />,
      description: 'We eliminate bias in recruitment by focusing on skills and qualifications, not demographics.',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50'
    },
    {
      title: 'Security',
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      description: 'Your data is secure and private. We never share personal information without your consent.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]
  const stats = [
    { 
      number: '50K+', 
      label: 'Successful Matches',
      icon: <UsersIcon className="w-6 h-6" />,
      description: 'Candidates placed in their dream jobs'
    },
    { 
      number: '10K+', 
      label: 'Partner Companies',
      icon: <BuildingOfficeIcon className="w-6 h-6" />,
      description: 'From startups to Fortune 500'
    },
    { 
      number: '500K+', 
      label: 'Active Job Seekers',
      icon: <UsersIcon className="w-6 h-6" />,
      description: 'Professionals using our platform'
    },
    { 
      number: '98%', 
      label: 'Match Accuracy',
      icon: <ChartBarIcon className="w-6 h-6" />,
      description: 'AI-powered precision matching'
    }
  ]
  const timeline = [
    {
      year: '2021',
      title: 'Founded',
      description: 'ResumeIT was founded with a vision to transform recruitment using AI technology.',
      color: 'from-primary-500 to-primary-600'
    },
    {
      year: '2022',
      title: 'First AI Model',
      description: 'Launched our first machine learning model for resume-job matching with 75% accuracy.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      year: '2023',
      title: 'Series A Funding',
      description: 'Raised $10M Series A funding to expand our AI capabilities and team.',
      color: 'from-accent-500 to-accent-600'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to 15 countries and partnered with major recruitment agencies worldwide.',
      color: 'from-success-500 to-success-600'
    },
    {
      year: '2025',
      title: 'AI Revolution',
      description: 'Launched advanced GPT-powered matching with 98% accuracy and semantic understanding.',
      color: 'from-emerald-500 to-emerald-600'
    }
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-20 blur-3xl animate-pulse-soft"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl animate-bounce-gentle"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-medium text-sm mb-6 shadow-lg"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Powered by Advanced AI Technology
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                About ResumeIT
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              We're revolutionizing recruitment with AI-powered matching that connects the right talent 
              with the right opportunities, making the hiring process smarter, faster, and fairer for everyone.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
            >
              <span className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                Trusted by 10K+ Companies
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                500K+ Active Users
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
                98% Match Accuracy
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group-hover:scale-105">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl p-8 md:p-12 shadow-soft"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                To democratize access to opportunities by creating the most intelligent, fair, and efficient 
                recruitment platform that benefits both job seekers and employers. We believe that everyone 
                deserves a chance to showcase their true potential beyond traditional barriers.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  title: 'Fair Matching',
                  description: 'Eliminate unconscious bias with AI-powered objective evaluation',
                  icon: <ScaleIcon className="w-8 h-8" />
                },
                {
                  title: 'Smart Technology',
                  description: 'Advanced algorithms that understand context and potential',
                  icon: <SparklesIcon className="w-8 h-8" />
                },
                {
                  title: 'Better Outcomes',
                  description: 'Higher satisfaction rates for both candidates and employers',
                  icon: <CheckIcon className="w-8 h-8" />
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-soft mb-4 text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape our approach to building the future of recruitment.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`${value.bgColor} rounded-2xl p-6 hover:shadow-medium transition-all duration-300 group-hover:scale-105 border border-gray-100`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${value.color} rounded-xl text-white mb-4`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Passionate experts from diverse backgrounds united by a shared vision to transform recruitment.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group-hover:scale-105 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    {imageErrors[member.name] ? (
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {generateInitials(member.name)}
                      </div>
                    ) : (
                      <Image
                        src={member.image}
                        alt={`${member.name} profile`}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
                        onError={() => handleImageError(member.name)}
                        priority={index < 2}
                      />
                    )}
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${member.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From a simple idea to a global platform transforming how companies find talent.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary-500 to-accent-500"></div>
              {timeline.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                      <div className={`inline-block px-3 py-1 bg-gradient-to-r ${event.color} text-white rounded-full text-sm font-semibold mb-3`}>
                        {event.year}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-6 h-6 bg-white border-4 border-primary-500 rounded-full mx-4 z-10 shadow-lg"></div>
                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern"></div>
            </div>
            <div className="relative">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-medium text-sm mb-6"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Advanced AI Technology
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Powered by Intelligence</h2>
                <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Our platform uses state-of-the-art machine learning algorithms, natural language processing, 
                  and semantic analysis to understand both resumes and job descriptions at a deeper level.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Machine Learning',
                    description: 'Advanced algorithms that learn from millions of successful matches',
                    icon: <SparklesIcon className="w-8 h-8" />,
                    features: ['Deep neural networks', 'Pattern recognition', 'Continuous learning']
                  },
                  {
                    title: 'NLP Processing',
                    description: 'Understanding context and meaning beyond simple keyword matching',
                    icon: <EyeIcon className="w-8 h-8" />,
                    features: ['Semantic analysis', 'Context understanding', 'Skill extraction']
                  },
                  {
                    title: 'Smart Matching',
                    description: 'Intelligent algorithms that consider cultural fit and growth potential',
                    icon: <ChartBarIcon className="w-8 h-8" />,
                    features: ['Cultural alignment', 'Growth potential', 'Team dynamics']
                  }
                ].map((tech, index) => (
                  <motion.div
                    key={tech.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white mb-4">
                      {tech.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{tech.title}</h3>
                    <p className="text-gray-300 mb-4">{tech.description}</p>
                    <ul className="space-y-2">
                      {tech.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-400">
                          <CheckIcon className="w-4 h-4 text-accent-400 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
                Join thousands of companies already using ResumeIT to find the perfect candidates faster, 
                fairer, and more efficiently than ever before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg flex items-center justify-center"
                >
                  Get Started Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  Contact Sales
                </motion.button>
              </div>
              <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-white/80">
                <span className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  No setup fees
                </span>
                <span className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  14-day free trial
                </span>
                <span className="flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  24/7 support
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
export default About
