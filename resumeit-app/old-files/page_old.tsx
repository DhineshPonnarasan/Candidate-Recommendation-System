'use client'

import { useEffect, useState } from 'react'
import { MapPin, Mail, Phone, Linkedin, Twitter, Youtube, Send, Building2, Copy, Check } from 'lucide-react'
import Link from 'next/link'

type Category = 'general' | 'sales' | 'support'

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
    if (Date.now() - startTime < 2000) {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <nav className="text-sm text-blue-100/80 mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">Contact</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Get in touch</h1>
          <p className="text-blue-100 max-w-2xl">Questions, feedback, or partnership ideas? We’ll reply within 1–2 business days.</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><MapPin /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>
                <p className="text-gray-600 text-sm mt-1">ResumeIT<br/>Binghamton, New York 13903</p>
                <div className="mt-2">
                  <a className="text-sm text-blue-600 hover:underline" href="https://www.google.com/maps/search/?api=1&query=Binghamton%2C+NY+13901" target="_blank" rel="noopener noreferrer">View on Maps →</a>
                </div>
              </div>
            </div>
          </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Mail /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600 text-sm mt-1">
      <a className="text-blue-600 hover:underline" href="mailto:hello@resumeit.ai">hello@resumeit.ai</a>
      <button type="button" aria-label="Copy email" className="ml-2 text-gray-500 hover:text-gray-700" onClick={async () => { await navigator.clipboard.writeText('hello@resumeit.ai'); setCopied('email'); setTimeout(()=>setCopied(null), 1200) }}>
                    {copied === 'email' ? <Check className="inline h-4 w-4"/> : <Copy className="inline h-4 w-4"/>}
                  </button>
                </p>
              </div>
            </div>
          </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><Phone /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-gray-600 text-sm mt-1">
      <a className="text-blue-600 hover:underline" href="tel:+16071234567">+1 (607) 123‑4567</a>
      <button type="button" aria-label="Copy phone" className="ml-2 text-gray-500 hover:text-gray-700" onClick={async () => { await navigator.clipboard.writeText('+16071234567'); setCopied('phone'); setTimeout(()=>setCopied(null), 1200) }}>
                    {copied === 'phone' ? <Check className="inline h-4 w-4"/> : <Copy className="inline h-4 w-4"/>}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Socials row */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10">
          <h3 className="font-semibold text-gray-900 mb-3">Follow us</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="https://www.linkedin.com/company/resumeit-ai/" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Link>
            <Link href="https://twitter.com/resumeit_ai" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border">
              <Twitter className="h-4 w-4" /> X (Twitter)
            </Link>
            <Link href="https://youtube.com/@resumeit-ai" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border">
              <Youtube className="h-4 w-4" /> YouTube
            </Link>
          </div>
        </div>

        {/* Category chooser */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">How can we help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { key: 'general', label: 'General', desc: 'Questions or feedback', icon: Mail },
              { key: 'sales', label: 'Sales', desc: 'Pricing and demos', icon: Building2 },
              { key: 'support', label: 'Support', desc: 'Help with the product', icon: Phone },
            ] as Array<{key: Category, label: string, desc: string, icon: any}>).map(({ key, label, desc, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setCategory(key)} className={`text-left p-4 rounded-lg border transition-colors ${category === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-md ${category === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}><Icon className="h-4 w-4"/></span>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" required minLength={2} className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" required inputMode="email" className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
                  <input name="company" className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input readOnly value={category} name="category" className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input name="subject" required minLength={4} className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" rows={6} required minLength={10} maxLength={1000} onChange={(e)=>setMessageCount(e.target.value.length)} className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                <div className="text-xs text-gray-500 mt-1">{messageCount}/1000</div>
              </div>
              {/* Honeypot */}
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" className="mt-1" checked={consent} onChange={(e)=>setConsent(e.target.checked)} />
                I agree to be contacted about my inquiry and have read the privacy policy.
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={status === 'sending' || !consent}
                  className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" /> {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
                {status === 'success' && <span className="text-green-600 text-sm">Message sent!</span>}
                {status === 'error' && <span className="text-red-600 text-sm">{error}</span>}
              </div>
            </form>
          </div>

          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Office hours</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>Mon–Fri: 9:00 AM – 6:00 PM (EST)</li>
              <li>Sat–Sun: Closed</li>
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Quick contacts</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li><a className="text-blue-600 hover:underline" href="mailto:hello@resumeit.ai">hello@resumeit.ai</a></li>
                <li><a className="text-blue-600 hover:underline" href="mailto:support@resumeit.ai">support@resumeit.ai</a></li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Our location</h4>
              <div className="rounded-lg overflow-hidden border">
                <iframe
                  title="Office map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-75.925%2C42.092%2C-75.911%2C42.104&layer=mapnik&marker=42.098%2C-75.918"
                  className="w-full h-48"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Exact address may vary for privacy.</p>
            </div>
          </aside>
        </div>

        {/* Toast */}
        {(status === 'success' || status === 'error') && (
          <div className={`fixed bottom-6 right-6 z-50 rounded-lg shadow-lg px-4 py-3 text-white ${status === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {status === 'success' ? 'Message sent successfully.' : error || 'Something went wrong.'}
          </div>
        )}

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Frequently asked questions</h3>
          <details className="group border rounded-md p-3 mb-2">
            <summary className="cursor-pointer font-medium text-gray-800">How fast do you respond?</summary>
            <p className="text-sm text-gray-600 mt-2">We typically respond within 1–2 business days. Sales requests often get a reply within 24 hours.</p>
          </details>
          <details className="group border rounded-md p-3 mb-2">
            <summary className="cursor-pointer font-medium text-gray-800">Can I book a demo?</summary>
            <p className="text-sm text-gray-600 mt-2">Yes—choose the Sales category above and mention your preferred time. We’ll send a calendar invite.</p>
          </details>
          <details className="group border rounded-md p-3">
            <summary className="cursor-pointer font-medium text-gray-800">Do you offer support SLAs?</summary>
            <p className="text-sm text-gray-600 mt-2">Business plans include priority support SLAs. Contact Sales for details.</p>
          </details>
        </div>
      </div>
    </main>
  )
}
