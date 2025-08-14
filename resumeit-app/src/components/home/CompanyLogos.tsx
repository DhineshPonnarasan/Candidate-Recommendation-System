'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
const CompanyLogos = () => {
  const companies = [
    { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
    { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
    { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com' },
    { name: 'Meta', logo: 'https://logo.clearbit.com/facebook.com' },
    { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com' },
    { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com' },
    { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com' },
    { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com' },
    { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com' },
  ]
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Top Companies
          </h2>
          <p className="text-lg text-gray-600">
            Leading organizations worldwide use ResumeIT to streamline their hiring process
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer"
            >
              <div className="relative w-24 h-24 flex items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group-hover:shadow-md">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={40}
                  height={40}
                  className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-200"
                />
              </div>
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary-200 transition-colors duration-200"></div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Join <span className="font-semibold text-primary-600">10,000+</span> companies that trust ResumeIT
          </p>
        </motion.div>
      </div>
    </section>
  )
}
export default CompanyLogos
