'use client'

import React from 'react'
import Image from 'next/image'

const CompanySection: React.FC = () => {
  // 30 major companies with their logos
  const companies = [
    { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', careers: 'https://www.amazon.jobs/' },
    { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com', careers: 'https://jobs.apple.com/' },
    { name: 'Google', logo: 'https://logo.clearbit.com/google.com', careers: 'https://careers.google.com/' },
    { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', careers: 'https://careers.microsoft.com/' },
    { name: 'Meta', logo: 'https://logo.clearbit.com/facebook.com', careers: 'https://www.metacareers.com/' },
    { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com', careers: 'https://jobs.netflix.com/' },
    { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com', careers: 'https://www.tesla.com/careers' },
    { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com', careers: 'https://www.uber.com/us/en/careers/' },
    { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', careers: 'https://careers.airbnb.com/' },
    { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com', careers: 'https://www.lifeatspotify.com/' },
    { name: 'Adobe', logo: 'https://logo.clearbit.com/adobe.com', careers: 'https://adobe.wd5.myworkdayjobs.com/' },
    { name: 'Salesforce', logo: 'https://logo.clearbit.com/salesforce.com', careers: 'https://careers.salesforce.com/' },
    { name: 'Oracle', logo: 'https://logo.clearbit.com/oracle.com', careers: 'https://www.oracle.com/careers/' },
    { name: 'IBM', logo: 'https://logo.clearbit.com/ibm.com', careers: 'https://www.ibm.com/careers' },
    { name: 'Intel', logo: 'https://logo.clearbit.com/intel.com', careers: 'https://jobs.intel.com/' },
    { name: 'Nvidia', logo: 'https://logo.clearbit.com/nvidia.com', careers: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'PayPal', logo: 'https://logo.clearbit.com/paypal.com', careers: 'https://www.paypal.com/us/webapps/mpp/jobs' },
    { name: 'LinkedIn', logo: 'https://logo.clearbit.com/linkedin.com', careers: 'https://careers.linkedin.com/' },
    { name: 'Twitter', logo: 'https://logo.clearbit.com/twitter.com', careers: 'https://careers.twitter.com/' },
    { name: 'Dropbox', logo: 'https://logo.clearbit.com/dropbox.com', careers: 'https://jobs.dropbox.com/' },
    { name: 'Slack', logo: 'https://logo.clearbit.com/slack.com', careers: 'https://slack.com/careers' },
    { name: 'Zoom', logo: 'https://logo.clearbit.com/zoom.us', careers: 'https://careers.zoom.us/' },
    { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com', careers: 'https://www.shopify.com/careers' },
    { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', careers: 'https://stripe.com/jobs' },
    { name: 'Discord', logo: 'https://logo.clearbit.com/discord.com', careers: 'https://discord.com/jobs' },
    { name: 'GitHub', logo: 'https://logo.clearbit.com/github.com', careers: 'https://github.com/about/careers' },
    { name: 'GitLab', logo: 'https://logo.clearbit.com/gitlab.com', careers: 'https://about.gitlab.com/jobs/' },
    { name: 'Atlassian', logo: 'https://logo.clearbit.com/atlassian.com', careers: 'https://www.atlassian.com/company/careers' },
    { name: 'Figma', logo: 'https://logo.clearbit.com/figma.com', careers: 'https://www.figma.com/careers/' },
    { name: 'Notion', logo: 'https://logo.clearbit.com/notion.so', careers: 'https://www.notion.so/careers' },
  ]

  const handleCompanyClick = (careersUrl: string) => {
    window.open(careersUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      {/* Floating Icons Section with Central Content */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden min-h-screen">

        {/* Central Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Marquee placed above the heading */}
          <div className="mb-10 select-none">
            <div className="overflow-hidden w-full">
              <motion.div
                className="flex gap-8 items-center w-max"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
              >
                {[...companies, ...companies].map((company, index) => (
                  <motion.div
                    key={`marquee-top-${company.name}-${index}`}
                    className="group inline-block cursor-pointer"
                    animate={{ y: [0, -6, 0, 6, 0] }}
                    transition={{ duration: 6 + (index % 4), repeat: Infinity, ease: 'easeInOut', delay: (index % 10) * 0.1 }}
                    whileHover={{ scale: 1.15, zIndex: 50 }}
                    onClick={() => handleCompanyClick(company.careers)}
                  >
                    <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all border-2 border-blue-100 backdrop-blur-sm">
                      <Image
                        src={company.logo}
                        alt={`${company.name} logo`}
                        width={36}
                        height={36}
                        className="object-contain rounded-sm"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="overflow-hidden w-full mt-6">
              <motion.div
                className="flex gap-8 items-center w-max"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 45, ease: 'linear', repeat: Infinity }}
              >
                {[...companies.slice(10), ...companies.slice(10)].map((company, index) => (
                  <motion.div
                    key={`marquee-top2-${company.name}-${index}`}
                    className="group inline-block cursor-pointer"
                    animate={{ y: [0, 6, 0, -6, 0] }}
                    transition={{ duration: 7 + (index % 4), repeat: Infinity, ease: 'easeInOut', delay: (index % 10) * 0.12 }}
                    whileHover={{ scale: 1.15, zIndex: 50 }}
                    onClick={() => handleCompanyClick(company.careers)}
                  >
                    <div className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all border-2 border-blue-100/70 backdrop-blur-sm">
                      <Image
                        src={company.logo}
                        alt={`${company.name} logo`}
                        width={30}
                        height={30}
                        className="object-contain rounded-sm"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Top Professionals Choose ResumeIT
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of successful professionals who have accelerated their careers with our AI-powered platform. 
              Get noticed by top companies and land your dream job faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500K+</div>
              <div className="text-blue-100">Professionals Matched</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">2500+</div>
              <div className="text-blue-100">Partner Companies</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted by Leading Companies Section - Now below the main content */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Leading Companies Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of organizations using ResumeIT to find top talent
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {companies.slice(0, 12).map((company, index) => (
              <motion.div
                key={`trusted-${company.name}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleCompanyClick(company.careers)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg mb-2 flex items-center justify-center mx-auto overflow-hidden">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              <span className="font-semibold text-blue-600">500,000+</span> professionals matched with their dream jobs
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default CompanySection
