'use client'
import AIRecommendationForm from '@/components/ai-recommendation/AIRecommendationForm'
import { 
  SparklesIcon, 
  CpuChipIcon, 
  ChartBarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
export default function AIRecommendation() {
  const features = [
    {
      icon: <CpuChipIcon className="w-6 h-6" />,
      title: "AI Analysis",
      description: "Advanced algorithms analyze skills and experience"
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: "Match Scoring",
      description: "Get detailed compatibility scores and insights"
    },
    {
      icon: <CheckCircleIcon className="w-6 h-6" />,
      title: "Instant Results",
      description: "Receive recommendations in under 3 seconds"
    }
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              AI-Powered Demo
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">
              Smart Candidate{' '}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 bg-clip-text text-transparent">
                Matching
              </span>
            </h1>
            <p className="text-xl text-secondary-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Experience the power of our AI recruitment platform. Upload resumes and job descriptions 
              to get instant, intelligent candidate recommendations with detailed match scores and insights.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-secondary-200/50 shadow-soft hover:shadow-medium transition-all duration-200 group"
                >
                  <div className="text-primary-600 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-secondary-900 text-sm">{feature.title}</div>
                    <div className="text-secondary-600 text-xs">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div>
            <AIRecommendationForm />
          </div>
        </div>
      </div>
    </div>
  )
}
