'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started',
    price: '$0',
    period: '/month',
    highlight: false,
    popular: false,
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50',
    features: [
      { name: 'Resume analysis', value: '5 per month', included: true },
      { name: 'Basic ATS insights', value: 'Limited', included: true },
      { name: 'Email support', value: '48h response', included: true },
      { name: 'Export reports', value: 'PDF only', included: true },
      { name: 'AI recommendations', value: false, included: false },
      { name: 'Priority support', value: false, included: false },
      { name: 'Team collaboration', value: false, included: false },
      { name: 'Custom integrations', value: false, included: false }
    ],
    cta: 'Get Started Free',
    ctaColor: 'bg-gray-600 hover:bg-gray-700'
  },
  {
    name: 'Professional',
    description: 'Advanced features for growing businesses and recruiters',
    price: '$29',
    period: '/month',
    highlight: true,
    popular: true,
    color: 'from-primary-500 to-accent-500',
    bgColor: 'bg-primary-50',
    features: [
      { name: 'Resume analysis', value: 'Unlimited', included: true },
      { name: 'Advanced ATS insights', value: 'Full access', included: true },
      { name: 'Priority support', value: '2h response', included: true },
      { name: 'Export reports', value: 'PDF, Excel, API', included: true },
      { name: 'AI recommendations', value: 'Advanced AI', included: true },
      { name: 'Skill gap analysis', value: 'Detailed reports', included: true },
      { name: 'Team collaboration', value: '5 members', included: true },
      { name: 'Custom integrations', value: 'Basic', included: true }
    ],
    cta: 'Start Pro Trial',
    ctaColor: 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700'
  },
  {
    name: 'Enterprise',
    description: 'Complete solution for large organizations',
    price: '$99',
    period: '/month',
    highlight: false,
    popular: false,
    color: 'from-success-500 to-emerald-500',
    bgColor: 'bg-success-50',
    features: [
      { name: 'Resume analysis', value: 'Unlimited', included: true },
      { name: 'Enterprise ATS suite', value: 'Full platform', included: true },
      { name: 'Dedicated support', value: '30min response', included: true },
      { name: 'Export reports', value: 'All formats + API', included: true },
      { name: 'AI recommendations', value: 'Custom models', included: true },
      { name: 'Advanced analytics', value: 'Full dashboard', included: true },
      { name: 'Team collaboration', value: 'Unlimited', included: true },
      { name: 'Custom integrations', value: 'Advanced + SSO', included: true }
    ],
    cta: 'Contact Sales',
    ctaColor: 'bg-gradient-to-r from-success-600 to-emerald-600 hover:from-success-700 hover:to-emerald-700'
  }
]

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'Start with our Professional plan free for 14 days. No credit card required. Cancel anytime during the trial period.'
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and can arrange invoice billing for Enterprise customers.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for any plan. We believe in transparent pricing with no hidden costs.'
  },
  {
    question: 'Do you offer volume discounts?',
    answer: 'Yes, we offer custom pricing for large teams and enterprises. Contact our sales team for a personalized quote.'
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-20 blur-3xl animate-pulse-soft"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-3xl animate-bounce-gentle"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm text-gray-500 mb-8"
          >
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Pricing</span>
          </motion.nav>

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
              Simple, Transparent Pricing
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Start free, scale as you grow. No hidden fees, no long-term contracts, 
              and you can upgrade, downgrade, or cancel anytime.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
            >
              <span className="flex items-center">
                <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                14-day free trial
              </span>
              <span className="flex items-center">
                <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                No setup fees
              </span>
              <span className="flex items-center">
                <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                Cancel anytime
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative group ${plan.highlight ? 'lg:scale-105 lg:z-10' : ''}`}
              >
                <div className={`bg-white rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border-2 ${plan.highlight ? 'border-primary-200' : 'border-gray-100'} group-hover:border-primary-200`}>
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                        <StarIcon className="w-4 h-4 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl text-white mb-4`}>
                      {index === 0 && <ChartBarIcon className="w-8 h-8" />}
                      {index === 1 && <SparklesIcon className="w-8 h-8" />}
                      {index === 2 && <ShieldCheckIcon className="w-8 h-8" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${plan.ctaColor} shadow-lg hover:shadow-xl flex items-center justify-center`}
                    >
                      {plan.cta}
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </motion.button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start justify-between">
                        <div className="flex items-start">
                          {feature.included ? (
                            <CheckIcon className="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XMarkIcon className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                            {feature.name}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {typeof feature.value === 'string' ? feature.value : feature.included ? '✓' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Compare All Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how our plans stack up and find the perfect fit for your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-soft overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="text-center p-6">
                        <div className="font-semibold text-gray-900">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.price}{plan.period}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans[0].features.map((_, featureIndex) => (
                    <tr key={featureIndex} className="hover:bg-gray-50/50">
                      <td className="p-6 font-medium text-gray-900">
                        {plans[0].features[featureIndex].name}
                      </td>
                      {plans.map((plan) => (
                        <td key={plan.name} className="p-6 text-center">
                          {plan.features[featureIndex].included ? (
                            typeof plan.features[featureIndex].value === 'string' ? (
                              <span className="text-sm font-medium text-gray-700">
                                {plan.features[featureIndex].value}
                              </span>
                            ) : (
                              <CheckIcon className="w-5 h-5 text-success-500 mx-auto" />
                            )
                          ) : (
                            <XMarkIcon className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers. Can't find what you're looking for? 
              <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
                Contact our team
              </Link>.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
                Join thousands of companies using ResumeIT to streamline their hiring process. 
                Start your free trial today—no credit card required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200 flex items-center justify-center"
                >
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Talk to Sales
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
