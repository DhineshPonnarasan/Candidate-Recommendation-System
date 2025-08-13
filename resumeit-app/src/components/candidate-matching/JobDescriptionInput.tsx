'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

interface JobDescriptionInputProps {
  value: string
  onChange: (value: string) => void
}

const JobDescriptionInput = ({ value, onChange }: JobDescriptionInputProps) => {
  const [charCount, setCharCount] = useState(value.length)
  const [wordCount, setWordCount] = useState(0)
  const [keywordCount, setKeywordCount] = useState(0)
  const [analysisPreview, setAnalysisPreview] = useState<string[]>([])

  // Technical keywords for analysis preview - memoized to prevent re-renders
  const technicalKeywords = useMemo(() => [
    'javascript', 'python', 'java', 'react', 'nodejs', 'typescript', 'sql', 'mongodb',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'machine learning',
    'data science', 'api', 'microservices', 'senior', 'lead', 'manager', 'experience'
  ], [])

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0)
    const wordsCount = value.trim() ? words.length : 0
    
    // Find technical keywords in the job description
    const lowerText = value.toLowerCase()
    const foundKeywords = technicalKeywords.filter(keyword => 
      lowerText.includes(keyword)
    )
    
    setWordCount(wordsCount)
    setKeywordCount(foundKeywords.length)
    setAnalysisPreview(foundKeywords.slice(0, 8)) // Show top 8 keywords
  }, [value, technicalKeywords])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setCharCount(newValue.length)
  }

  const sampleJobDescriptions = [
    {
      title: "Senior Software Engineer - Full Stack",
      content: `Senior Software Engineer - Full Stack Development

We are seeking an experienced Senior Software Engineer to join our dynamic development team. The ideal candidate will have strong expertise in modern web technologies and a passion for building scalable applications.

Key Responsibilities:
• Design and develop web applications using React, Node.js, and TypeScript
• Collaborate with cross-functional teams to deliver high-quality software
• Mentor junior developers and provide technical leadership
• Participate in code reviews and maintain coding standards
• Work with cloud platforms (AWS/Azure) and containerization technologies

Required Skills:
• 5+ years of experience in software development
• Proficiency in JavaScript, TypeScript, React, and Node.js
• Experience with databases (PostgreSQL, MongoDB)
• Knowledge of cloud platforms and DevOps practices
• Strong problem-solving and communication skills
• Bachelor's degree in Computer Science or related field

Preferred Qualifications:
• Experience with microservices architecture
• Knowledge of machine learning and data science
• Previous leadership or mentoring experience
• Contributions to open-source projects`
    },
    {
      title: "Data Scientist - Machine Learning",
      content: `Data Scientist - Machine Learning & AI

Join our innovative data science team to build cutting-edge machine learning solutions that drive business impact.

Key Responsibilities:
• Develop and deploy machine learning models using Python and TensorFlow
• Analyze large datasets to extract actionable insights
• Collaborate with engineering teams to productionize ML models
• Design experiments and A/B tests to validate hypotheses
• Present findings to stakeholders and leadership teams

Required Skills:
• 3+ years of experience in data science or machine learning
• Proficiency in Python, pandas, scikit-learn, TensorFlow or PyTorch
• Strong statistical analysis and mathematical modeling skills
• Experience with SQL and data manipulation
• Knowledge of cloud platforms (AWS, GCP) and MLOps practices
• Master's degree in Data Science, Statistics, or related field

Preferred Qualifications:
• Experience with deep learning and neural networks
• Knowledge of big data technologies (Spark, Hadoop)
• Previous experience in a fast-paced startup environment
• Publications in machine learning conferences or journals`
    },
    {
      title: "Frontend Developer - React/TypeScript",
      content: `Frontend Developer - React & TypeScript Specialist

We're looking for a talented Frontend Developer to create exceptional user experiences using modern web technologies.

Key Responsibilities:
• Build responsive web applications using React and TypeScript
• Implement pixel-perfect designs from Figma mockups
• Optimize applications for performance and accessibility
• Collaborate with UX/UI designers and backend developers
• Write clean, maintainable, and well-tested code

Required Skills:
• 3+ years of experience in frontend development
• Expert knowledge of React, TypeScript, HTML5, and CSS3
• Experience with modern build tools (Webpack, Vite)
• Understanding of responsive design and CSS frameworks
• Knowledge of testing frameworks (Jest, React Testing Library)
• Familiarity with version control (Git) and Agile methodologies

Preferred Qualifications:
• Experience with Next.js and server-side rendering
• Knowledge of state management libraries (Redux, Zustand)
• Understanding of web performance optimization
• Experience with design systems and component libraries`
    }
  ]

  const useSampleDescription = (sample: typeof sampleJobDescriptions[0]) => {
    onChange(sample.content)
    setCharCount(sample.content.length)
  }

  const getQualityIndicator = () => {
    if (charCount < 200) return { color: 'text-red-600', label: 'Too Short', description: 'Add more details for better analysis' }
    if (charCount < 500) return { color: 'text-yellow-600', label: 'Basic', description: 'Good start, consider adding more requirements' }
    if (charCount < 1000) return { color: 'text-blue-600', label: 'Good', description: 'Well-detailed job description' }
    if (charCount < 2000) return { color: 'text-green-600', label: 'Excellent', description: 'Comprehensive job description for optimal AI analysis' }
    return { color: 'text-purple-600', label: 'Very Detailed', description: 'Highly detailed description' }
  }

  const quality = getQualityIndicator()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${quality.color} bg-opacity-10`}>
            {quality.label}
          </div>
        </div>
      </div>

      {/* Sample Job Descriptions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">📝 Quick Start Templates:</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {sampleJobDescriptions.map((sample, index) => (
            <button
              key={index}
              onClick={() => useSampleDescription(sample)}
              className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group"
            >
              <h4 className="font-medium text-gray-900 group-hover:text-primary-700 text-sm">
                {sample.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Click to use this template
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Text Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Paste your job description here... Include role responsibilities, required skills, experience level, and any specific qualifications for the best AI analysis results."
          className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm leading-relaxed"
          maxLength={5000}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center space-x-4 text-sm text-gray-500">
          <span>{wordCount} words</span>
          <span>{charCount}/5000</span>
        </div>
      </div>

      {/* Analysis Quality Indicator */}
      {value.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Quality Assessment */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              📊 Description Quality
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Quality:</span>
                <span className={`text-sm font-medium ${quality.color}`}>
                  {quality.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    charCount < 200 ? 'bg-red-500 w-1/5' :
                    charCount < 500 ? 'bg-yellow-500 w-2/5' :
                    charCount < 1000 ? 'bg-blue-500 w-3/5' :
                    charCount < 2000 ? 'bg-green-500 w-4/5' :
                    'bg-purple-500 w-full'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-600">{quality.description}</p>
            </div>
          </div>

          {/* AI Analysis Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              🤖 AI Analysis Preview
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Technical Keywords:</span>
                <span className="text-sm font-medium text-blue-600">
                  {keywordCount} found
                </span>
              </div>
              
              {analysisPreview.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {analysisPreview.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {keywordCount > 8 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{keywordCount - 8} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Add technical requirements to see keyword detection
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Ready Status */}
      {value.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-green-600 mr-2 text-lg">✓</span>
              <div>
                <span className="text-green-700 text-sm font-medium">
                  Job description ready for AI analysis
                </span>
                <p className="text-green-600 text-xs mt-1">
                  {wordCount} words • {keywordCount} technical keywords detected
                </p>
              </div>
            </div>
            {charCount >= 500 && keywordCount >= 3 && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Optimized for AI
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Writing Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          💡 Tips for Better AI Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-2">✅ Include These Elements:</h5>
            <ul className="space-y-1">
              <li>• Specific technical skills and technologies</li>
              <li>• Required experience level and years</li>
              <li>• Industry or domain knowledge requirements</li>
              <li>• Soft skills and cultural fit criteria</li>
              <li>• Educational background requirements</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">🎯 AI Analysis Strengths:</h5>
            <ul className="space-y-1">
              <li>• Detects 100+ technical keywords automatically</li>
              <li>• Matches experience levels (Junior/Mid/Senior)</li>
              <li>• Recognizes programming languages and frameworks</li>
              <li>• Identifies cloud platforms and methodologies</li>
              <li>• Analyzes semantic meaning, not just keywords</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Character Limit Warning */}
      {charCount > 4500 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-3"
        >
          <div className="flex items-center">
            <span className="text-orange-500 mr-2">⚠️</span>
            <span className="text-orange-700 text-sm">
              Approaching character limit ({charCount}/5000). Consider condensing for optimal performance.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default JobDescriptionInput
