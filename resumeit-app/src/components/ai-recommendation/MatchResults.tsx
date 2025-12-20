'use client'
import { memo } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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
      <Card variant="elevated" className="text-center py-12">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="mt-4 text-gray-600 font-display font-medium">Analyzing resumes…</p>
        <p className="text-xs text-gray-400 font-body mt-1">This uses cosine similarity over local embeddings.</p>
      </Card>
    )
  }
  if (!results || results.length === 0) {
    return (
      <Card variant="default" className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
        <p className="text-gray-600 font-body">Upload resumes and enter a job description.</p>
      </Card>
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
          <h2 className="text-2xl font-display font-bold text-gray-900">Top Candidate Recommendations</h2>
          <p className="text-gray-600 mt-1 font-body">
            {showLimited ? `Showing top 10 out of ${results.length}` : `Analyzed ${results.length}`} candidate{results.length !== 1 ? 's' : ''} for{' '}
            <span className="font-display font-medium">{jobTitle || 'the role'}</span>
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 font-body">
          Avg Score:{' '}
          <span className="font-display font-semibold" aria-label="Average similarity score">
            {Number.isFinite(averageScore) ? `${averageScore}%` : '–'}
          </span>
          <div className="text-xs text-gray-400 font-body">Cosine similarity based</div>
        </div>
      </div>
      <Card variant="elevated" className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 font-body">
            <span className="font-display font-medium">Top candidate:</span>{' '}
            <span className="text-gray-900 font-display font-semibold">{topCandidate?.name || 'N/A'}</span>
          </div>
          <div
            className={`px-3 py-1 rounded-full border text-xs font-display font-semibold ${scoreBadgeClasses(
              topCandidate?.matchScore ?? 0,
            )}`}
          >
            {topCandidate?.matchScore ?? 0}% match
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        {displayedResults.map((r, i) => {
          const safeKey = `${r.id || 'cand'}-${r.fileName || 'file'}-${r.rank ?? i}`
          
          // INVARIANT 5: UI renders truth - display exactly what parser produces
          // DO NOT default to "Unknown Candidate" or "Not specified" here
          // If parser produced empty string, show empty string (or let UI decide)
          const displayName = r.name?.trim() || '' // Render truth - empty if parser found nothing
          const displayEmail = r.email?.trim() || '' // Render truth
          const displayPhone = r.phone?.trim() || '' // Render truth
          const normalizedLinkedIn = r.linkedin?.trim() ? normalizeLink(r.linkedin.trim()) : ''
          const displayLinkedIn = normalizedLinkedIn || '' // Render truth
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MatchResults.tsx:96',message:'UI display values computed (INVARIANT 5)',data:{inputName:r.name,inputEmail:r.email,inputPhone:r.phone,inputLinkedin:r.linkedin,displayName,displayEmail,displayPhone,displayLinkedIn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return (
            <motion.div
              key={safeKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card variant="elevated" className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-display font-bold text-gray-900">{displayName || 'Unknown Candidate'}</h3>
                    {i === 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-display font-medium px-2 py-0.5 rounded-full">
                        🏆 Top Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-body">
                    📄 {r.fileName || 'Unknown file'} • Rank #{r.rank ?? i + 1}
                  </p>
                  <div className="mt-2 text-sm text-gray-700 space-y-0.5 font-body">
                    <p>📧 Email: {displayEmail || 'Not specified'}</p>
                    <p>📞 Phone: {displayPhone || 'Not specified'}</p>
                    <p className="break-all">
                      🔗 LinkedIn:{' '}
                      {displayLinkedIn ? (
                        <a
                          href={displayLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 hover:underline transition-colors"
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
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-display font-bold ${scoreBadgeClasses(
                      r.matchScore ?? 0,
                    )}`}
                    aria-label="Similarity score"
                  >
                    {r.matchScore ?? 0}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-body">Similarity</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-700 text-xs font-display font-medium px-2 py-0.5 rounded-full">
                    🤖 AI Summary
                  </span>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-body">
                  {r.summary?.trim() || 'No AI summary generated.'}
                </div>
              </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
export default memo(MatchResults)