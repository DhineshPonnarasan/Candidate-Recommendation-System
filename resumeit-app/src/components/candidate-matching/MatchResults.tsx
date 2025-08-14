'use client'
import { memo } from 'react'
import { motion } from 'framer-motion'
type MatchResult = {
  id: string
  name: string
  fileName: string
  matchScore: number
  email: string
  phone: string
  linkedin: string
  summary: string
  rank: number
}
interface Props {
  results: MatchResult[]
  isLoading: boolean
  jobTitle: string
}
const scoreBadgeClasses = (score: number) => {
  if (score >= 85) return 'text-green-700 bg-green-100 border-green-200'
  if (score >= 70) return 'text-blue-700 bg-blue-100 border-blue-200'
  if (score >= 55) return 'text-yellow-700 bg-yellow-100 border-yellow-200'
  if (score >= 40) return 'text-orange-700 bg-orange-100 border-orange-200'
  return 'text-red-700 bg-red-100 border-red-200'
}
const normalizeLink = (url?: string) => {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed || /^not specified$/i.test(trimmed)) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
const MatchResults = ({ results, isLoading, jobTitle }: Props) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent"
          aria-label="Loading"
        />
        <p className="mt-4 text-gray-600 font-medium">Analyzing resumes…</p>
        <p className="text-xs text-gray-400">Processing candidate profiles for comparison.</p>
      </div>
    )
  }
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
        <p className="text-gray-600">Upload resumes and enter a job description.</p>
      </div>
    )
  }
  const averageScore = Math.round(results.reduce((s, r) => s + (r.matchScore || 0), 0) / results.length)
  const topCandidate = results[0]
  const displayedResults = results.slice(0, 10);
  const showLimited = results.length > 10;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Top Candidate Recommendations</h2>
          <p className="text-gray-600 mt-1">
            {showLimited ? `Showing top 10 out of ${results.length}` : `Analyzed ${results.length}`} candidate{results.length !== 1 ? 's' : ''} for{' '}
            <span className="font-medium">{jobTitle || 'the role'}</span>
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          Avg Score:{' '}
          <span className="font-semibold" aria-label="Average similarity score">
            {Number.isFinite(averageScore) ? `${averageScore}%` : '–'}
          </span>
          <div className="text-xs text-gray-400">Similarity score</div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Top candidate:</span>{' '}
          <span className="text-gray-900 font-semibold">{topCandidate?.name || 'N/A'}</span>
        </div>
        <div
          className={`px-3 py-1 rounded-full border text-xs font-semibold ${scoreBadgeClasses(
            topCandidate?.matchScore ?? 0,
          )}`}
        >
          {topCandidate?.matchScore ?? 0}% match
        </div>
      </div>
      <div className="space-y-4">
        {displayedResults.map((r, i) => {
          const safeKey = `${r.id || 'cand'}-${r.fileName || 'file'}-${r.rank ?? i}`
          const displayName = r.name?.trim() || 'Unknown Candidate'
          const displayEmail = r.email?.trim() || 'Not specified'
          const displayPhone = r.phone?.trim() || 'Not specified'
          const normalizedLinkedIn = r.linkedin && r.linkedin !== 'Not specified' ? normalizeLink(r.linkedin) : ''
          const displayLinkedIn = normalizedLinkedIn ? normalizedLinkedIn : 'Not specified'
          return (
            <motion.div
              key={safeKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
                    {i === 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        🏆 Top Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    📄 {r.fileName || 'Unknown file'} • Rank #{r.rank ?? i + 1}
                  </p>
                  <div className="mt-2 text-sm text-gray-700 space-y-0.5">
                    <p>📧 Email: {displayEmail}</p>
                    <p>📞 Phone: {displayPhone}</p>
                    <p className="break-all">
                      🔗 LinkedIn:{' '}
                      {displayLinkedIn !== 'Not specified' ? (
                        <a
                          href={displayLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {displayLinkedIn}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-bold ${scoreBadgeClasses(
                      r.matchScore ?? 0,
                    )}`}
                    aria-label="Similarity score"
                  >
                    {r.matchScore ?? 0}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Similarity</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    📋 Summary
                  </span>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {r.summary?.trim() || 'No summary available.'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
export default memo(MatchResults)