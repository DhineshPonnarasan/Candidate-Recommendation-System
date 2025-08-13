'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline'

type Category = 'general' | 'sales' | 'support' | 'partnership'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('general')
  const [consent, setConsent] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [startTime, setStartTime] = useState<number>(() => Date.now())
  const [copied, setCopied] = useState<'email' | 'phone' | null>(null)

  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Honeypot check
    if ((formData.get('website') as string)?.trim()) {
      setStatus('error')
      setError('Spam detected.')
      return
    }

    // Basic bot timing guard
    if (Date.now() - startTime < 3000) {
      setStatus('error')
      setError('Please take a moment before submitting.')
      return
    }

    const payload = Object.fromEntries(formData.entries()) as Record<string, string>
    payload.category = category
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setStatus('success')
      form.reset()
      setConsent(false)
      setMessageCount(0)
    } catch (err: any) {
      setStatus('error')
      setError(err?.message || 'Something went wrong')
    }
  }

  const contactInfo = [
    {
      title: 'Office Location',
      icon: <MapPinIcon className="w-6 h-6" />,
      content: 'Binghamton, New York 13903',
      link: 'https://www.google.com/maps/search/?api=1&query=Binghamton%2C+NY+13903',
      linkText: 'View on Maps',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Email Us',
      icon: <EnvelopeIcon className="w-6 h-6" />,
      content: 'hello@resumeit.ai',
      link: 'mailto:hello@resumeit.ai',
      linkText: 'Send Email',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      copyable: true,
      copyText: 'hello@resumeit.ai'
    },
    {
      title: 'Call Us',
      icon: <PhoneIcon className="w-6 h-6" />,
      content: '+1 (607) 123-4567',
      link: 'tel:+16071234567',
      linkText: 'Call Now',
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
      copyable: true,
      copyText: '+16071234567'
    },
    {
      title: 'Office Hours',
      icon: <ClockIcon className="w-6 h-6" />,
      content: 'Mon-Fri: 9AM-6PM EST',
      subContent: 'Weekend: Closed',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const categories = [
    {
      key: 'general' as Category,
      title: 'General Inquiry',
      description: 'Questions, feedback, or general information',
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      color: 'from-primary-500 to-primary-600'
    },
    {
      key: 'sales' as Category,
      title: 'Sales & Demos',
      description: 'Pricing, plans, and product demonstrations',
      icon: <BuildingOfficeIcon className="w-6 h-6" />,
      color: 'from-success-500 to-success-600'
    },
    {
      key: 'support' as Category,
      title: 'Technical Support',
      description: 'Help with the platform and troubleshooting',
      icon: <CogIcon className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      key: 'partnership' as Category,
      title: 'Partnerships',
      description: 'Business partnerships and integrations',
      icon: <UsersIcon className="w-6 h-6" />,
      color: 'from-accent-500 to-accent-600'
    }
  ]

  const faqs = [
    {
      question: 'How quickly do you respond?',
      answer: 'We typically respond within 1-2 business hours for sales inquiries and within 24 hours for general questions. Support tickets are handled based on your plan\'s SLA.'
    },
    {
      question: 'Can I schedule a product demo?',
      answer: 'Absolutely! Select "Sales & Demos" above and mention your preferred time. We\'ll send you a calendar invite with our demo link.'
    },
    {
      question: 'Do you offer technical support?',
      answer: 'Yes, we provide comprehensive technical support. Professional and Enterprise plans include priority support with faster response times.'
    },
    {
      question: 'Are you available for partnerships?',
      answer: 'We\'re always interested in strategic partnerships. Select "Partnerships" and tell us about your proposal - we\'ll get back to you quickly.'
    }
  ]

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
            <span className="text-gray-900 font-medium">Contact</span>
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
              We're Here to Help
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Have questions, feedback, or need support? Our team is ready to help you succeed. 
              We typically respond within 1-2 business hours.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
            >
              <span className="flex items-center">
                <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                Fast Response Times
              </span>
              <span className="flex items-center">
                <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                Expert Support Team
              </span>
              <span className="flex items-center">
                <CheckIcon className="w-4 h-4 text-success-500 mr-2" />
                Multiple Ways to Connect
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className={`${info.bgColor} rounded-2xl p-6 hover:shadow-medium transition-all duration-300 group-hover:scale-105`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl text-white mb-4`}>
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-700 mb-1">{info.content}</p>
                  {info.subContent && (
                    <p className="text-gray-600 text-sm">{info.subContent}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4">
                    {info.link && (
                      <a
                        href={info.link}
                        target={info.link.startsWith('http') ? '_blank' : '_self'}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        {info.linkText}
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </a>
                    )}
                    
                    {info.copyable && (
                      <button
                        onClick={() => copyToClipboard(info.copyText!, info.copyText!.includes('@') ? 'email' : 'phone')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied === (info.copyText!.includes('@') ? 'email' : 'phone') ? (
                          <CheckIcon className="w-4 h-4 text-success-500" />
                        ) : (
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose a category below and tell us how we can help. We'll get back to you as soon as possible.
            </p>
          </motion.div>

          {/* Category Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">How can we help you?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    category === cat.key
                      ? 'border-primary-500 bg-primary-50 shadow-medium'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-soft'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${
                    category === cat.key 
                      ? `bg-gradient-to-r ${cat.color} text-white` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cat.icon}
                  </div>
                  <h4 className={`font-semibold mb-2 ${category === cat.key ? 'text-primary-900' : 'text-gray-900'}`}>
                    {cat.title}
                  </h4>
                  <p className={`text-sm ${category === cat.key ? 'text-primary-700' : 'text-gray-600'}`}>
                    {cat.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Form and Sidebar */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <form onSubmit={onSubmit} className="bg-white rounded-3xl p-8 shadow-soft">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                    <input
                      name="name"
                      required
                      minLength={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      inputMode="email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company</label>
                    <input
                      name="company"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                    <input
                      readOnly
                      value={categories.find(c => c.key === category)?.title || ''}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Subject *</label>
                  <input
                    name="subject"
                    required
                    minLength={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Message *</label>
                  <textarea
                    name="message"
                    rows={6}
                    required
                    minLength={10}
                    maxLength={1000}
                    onChange={(e) => setMessageCount(e.target.value.length)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                  <div className="text-sm text-gray-500 mt-2 text-right">{messageCount}/1000 characters</div>
                </div>

                {/* Honeypot */}
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="mb-6">
                  <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      I agree to be contacted about my inquiry and have read the{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                        privacy policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <motion.button
                    type="submit"
                    disabled={status === 'sending' || !consent}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
                  >
                    {status === 'sending' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </motion.button>

                  {status === 'success' && (
                    <div className="flex items-center text-success-600 font-medium">
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Message sent successfully!
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="flex items-center text-red-600 font-medium">
                      <XMarkIcon className="w-5 h-5 mr-2" />
                      {error || 'Something went wrong'}
                    </div>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Quick Response Info */}
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Response Times</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sales Inquiries</span>
                    <span className="font-medium text-primary-600">1-2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">General Questions</span>
                    <span className="font-medium text-gray-900">24 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Support Tickets</span>
                    <span className="font-medium text-gray-900">Based on SLA</span>
                  </div>
                </div>
              </div>

              {/* Alternative Contact Methods */}
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:hello@resumeit.ai"
                    className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <EnvelopeIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Direct Email</div>
                      <div className="text-sm text-gray-600">hello@resumeit.ai</div>
                    </div>
                  </a>
                  
                  <a
                    href="tel:+16071234567"
                    className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <PhoneIcon className="w-5 h-5 text-success-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Phone Support</div>
                      <div className="text-sm text-gray-600">+1 (607) 123-4567</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-soft">
                <h3 className="font-semibold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium text-gray-900">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekend</span>
                    <span className="font-medium text-gray-900">Closed</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    Emergency support available 24/7 for Enterprise customers
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions. Can't find what you're looking for? Send us a message above.
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
    </div>
  )
}
