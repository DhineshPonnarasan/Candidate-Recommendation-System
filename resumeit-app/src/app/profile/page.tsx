'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
const demoStats = {
  companiesApplied: 0, // set to 0 to show Start Apply button
  resumesUploaded: 2,
  companiesRejected: 1,
  upcomingInterview: null, // or { company: 'AISO Think', date: '2025-08-20' }
}
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold">{user?.name || 'User'}</span>. Track your job search progress.
            </p>
          </div>
          <button 
            onClick={logout} 
            className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200 font-medium"
          >
            Log out
          </button>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white grid place-items-center text-2xl font-bold shadow-lg">
                {(user?.name || 'U').slice(0,1)}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</div>
                <div className="text-gray-600 mb-2">{user?.email || '—'}</div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-full">
                    {user?.plan || 'Starter'} Plan
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Last active</div>
              <div className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-1">{demoStats.companiesApplied}</div>
            <div className="text-sm text-gray-600">Companies Applied</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-700 mb-1">{demoStats.resumesUploaded}</div>
            <div className="text-sm text-gray-600">Resumes Uploaded</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-red-700 mb-1">{demoStats.companiesRejected}</div>
            <div className="text-sm text-gray-600">Companies Rejected</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-1">
              {demoStats.upcomingInterview ? 'TechCorp' : '—'}
            </div>
            <div className="text-sm text-gray-600">Upcoming Interview</div>
            {demoStats.upcomingInterview && (
              <div className="text-xs text-gray-500 mt-1">Tomorrow 2:00 PM</div>
            )}
          </div>
        </div>
        {demoStats.companiesApplied === 0 && (
          <div className="flex justify-center mb-8">
            <a
              href="https://www.linkedin.com/jobs/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-cyan-500 transition"
            >
              Start Apply
            </a>
          </div>
        )}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="font-medium text-blue-900">Tip</div>
          <p className="text-sm text-blue-800 mt-1">Boost your match rate by updating your resume with keywords from target job descriptions.</p>
        </div>
      </div>
    </main>
  )
}
