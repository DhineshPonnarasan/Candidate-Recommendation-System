'use client'

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
      gradient: "from-primary-500 to-accent-500"
    },
    {
      icon: <BoltIcon className="w-8 h-8" />,
      title: "Instant Results",
      description: "Get candidate recommendations in seconds, not days. Our optimized system processes thousands of profiles instantly",
      gradient: "from-success-500 to-emerald-500"
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Bias-Free Hiring",
      description: "Eliminate unconscious bias with objective, data-driven candidate evaluation based purely on qualifications",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "Comprehensive insights and reporting to optimize your hiring process and improve candidate quality over time",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Seamless collaboration tools for hiring teams with shared candidate pools and unified decision making",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "Time to Hire",
      description: "Reduce time-to-hire by 70% with automated screening, ranking, and intelligent candidate prioritization",
      gradient: "from-indigo-500 to-purple-500"
    }
  ]

  const stats = [
    { number: "50K+", label: "Successful Placements", description: "Candidates matched to perfect roles" },
    { number: "98%", label: "Match Accuracy", description: "AI-powered precision matching" },
    { number: "10K+", label: "Active Companies", description: "From startups to Fortune 500" },
    { number: "2.5x", label: "Faster Hiring", description: "Compared to traditional methods" }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-20 blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl animate-bounce-gentle"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Stats Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-medium text-sm mb-6 shadow-lg">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Trusted by Industry Leaders
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transforming Recruitment
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform has revolutionized how companies find and hire top talent, 
              delivering unprecedented results across industries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group-hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Why Choose ResumeIT?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of recruitment technology with features designed 
              to streamline your hiring process and improve candidate quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 group-hover:scale-105 h-full">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl text-white mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
          </div>
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              Join thousands of companies using ResumeIT to find better candidates faster. 
              Start your free trial today and experience the future of recruitment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:scale-105">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200 hover:scale-105">
                Watch Demo
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm text-white/80">
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                No credit card required
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                14-day free trial
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Setup in minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContentSection
