'use client'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  BoltIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
const ContentSection = () => {
  const features = [
    {
      icon: <CpuChipIcon className="w-8 h-8" />,
      title: "AI-Powered Matching",
      description: "Advanced machine learning algorithms analyze skills, experience, and cultural fit to deliver perfect candidate matches",
      stats: "98% Match Accuracy",
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50",
      iconColor: "text-primary-600"
    },
    {
      icon: <BoltIcon className="w-8 h-8" />,
      title: "Lightning Fast Analysis",
      description: "Get comprehensive resume insights and job compatibility scores in under 3 seconds with our optimized AI engine",
      stats: "< 3 Second Analysis",
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-50",
      iconColor: "text-accent-600"
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: "Global Recruiter Network",
      description: "Connect with verified hiring managers and recruiters from Fortune 500 companies across 50+ countries",
      stats: "15,000+ Recruiters",
      color: "from-success-500 to-success-600",
      bgColor: "bg-success-50",
      iconColor: "text-success-600"
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: "Career Intelligence",
      description: "Receive data-driven insights and personalized recommendations to accelerate your career progression",
      stats: "5x Faster Placement",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "ATS Optimization",
      description: "Smart formatting and keyword optimization ensures your resume passes through any Applicant Tracking System",
      stats: "97% ATS Pass Rate",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: <CheckCircleIcon className="w-8 h-8" />,
      title: "Success Guarantee",
      description: "Get more quality interviews within 30 days or receive a full refund - backed by our proven track record",
      stats: "Money-Back Promise",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    }
  ]
  const stats = [
    { number: "50K+", label: "Successful Placements", icon: <UsersIcon className="w-6 h-6" /> },
    { number: "98%", label: "Match Accuracy", icon: <SparklesIcon className="w-6 h-6" /> },
    { number: "2.5x", label: "Faster Hiring", icon: <ClockIcon className="w-6 h-6" /> },
    { number: "500+", label: "Partner Companies", icon: <ChartBarIcon className="w-6 h-6" /> }
  ]
  return (
    <section className="py-24 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4" />
            Powerful Features
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 bg-clip-text text-transparent">
              ResumeIT?
            </span>
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            Experience the most advanced recruitment technology designed to connect talent with opportunity faster and more accurately than ever before.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-medium">
                {stat.icon}
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-1">{stat.number}</div>
              <div className="text-secondary-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-secondary-200/50 hover:border-primary-200 h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={feature.iconColor}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <div className={`inline-flex items-center gap-2 ${feature.bgColor} ${feature.iconColor} px-4 py-2 rounded-xl text-sm font-semibold`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  {feature.stats}
                </div>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/5 to-blue-500/5"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Hiring Process?
              </h3>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of companies already using ResumeIT to find their perfect candidates faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-200"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                >
                  Book a Demo
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
export default ContentSection
