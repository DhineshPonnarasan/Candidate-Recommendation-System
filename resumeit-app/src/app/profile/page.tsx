'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const tasks = [
  { title: 'Upload your latest resume', desc: 'Support PDF/DOCX; we’ll parse skills and experience automatically.', href: '/ai-recommendation' },
  { title: 'Generate AI recommendations', desc: 'Match your profile against target job descriptions.', href: '/ai-recommendation' },
  { title: 'Improve ATS score', desc: 'Get keyword and formatting tips to pass ATS filters.', href: '/features' },
  { title: 'Track applications', desc: 'Organize roles, status, and interview notes.', href: '/features' },
]

export default function ProfilePage() {
  const { user, logout, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login')
    }
  }, [ready, user, router])

  if (!ready) return null
  if (!user) return null
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your profile</h1>
            <p className="text-gray-600">Welcome{user ? `, ${user.name}` : ''}. Manage your ResumeIT journey here.</p>
          </div>
          <button onClick={logout} className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black">Log out</button>
        </div>

        {/* Profile card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-600 text-white grid place-items-center text-xl font-semibold">
              {(user?.name || 'U').slice(0,1)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.name || 'User'}</div>
              <div className="text-sm text-gray-600">{user?.email || '—'}</div>
              <div className="text-xs mt-1">Plan: <span className="font-medium">{user?.plan || 'Starter'}</span></div>
            </div>
          </div>
        </div>

        {/* Quick tasks */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Getting started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((t) => (
            <Link key={t.title} href={t.href} className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="font-medium text-gray-900">{t.title}</div>
              <div className="text-sm text-gray-600 mt-1">{t.desc}</div>
            </Link>
          ))}
        </div>

        {/* Resume upload reminder */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="font-medium text-blue-900">Tip</div>
          <p className="text-sm text-blue-800 mt-1">Boost your match rate by updating your resume with keywords from target job descriptions.</p>
        </div>
      </div>
    </main>
  )
}
