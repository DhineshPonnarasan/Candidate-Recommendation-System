'use client'
import ResumeUpload from '@/components/ai-recommendation/ResumeUpload';
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
interface ResumeUploadProps {
  uploadedResumes?: File[]
  onResumeUpload: (files: File[]) => void
  onRemoveResume: (index: number) => void
}
const ResumeUpload = ({ uploadedResumes = [], onResumeUpload, onRemoveResume }: ResumeUploadProps) => {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [processingFiles, setProcessingFiles] = useState<string[]>([])
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null)
    if (rejectedFiles.length > 0) {
      const rejectedReasons = rejectedFiles.map(file => {
        const errors = file.errors.map((error: any) => error.message).join(', ')
        return `${file.file.name}: ${errors}`
      })
      setUploadError(`Some files were rejected: ${rejectedReasons.join('; ')}`)
    }
    const supportedFiles: File[] = []
    const unsupportedFiles: string[] = []
    acceptedFiles.forEach(file => {
      const type = file.type
      const name = file.name.toLowerCase()
      const isSupported = (
        type === 'application/pdf' ||
        type === 'text/plain' ||
        type === 'application/msword' ||
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        name.endsWith('.pdf') ||
        name.endsWith('.txt') ||
        name.endsWith('.doc') ||
        name.endsWith('.docx')
      )
      if (isSupported) {
        if (file.size > 10 * 1024 * 1024) {
          unsupportedFiles.push(`${file.name} (too large - max 10MB)`)
        } else {
          supportedFiles.push(file)
        }
      } else {
        unsupportedFiles.push(`${file.name} (unsupported format)`)
      }
    })
    if (unsupportedFiles.length > 0) {
      setUploadError(`Unsupported files: ${unsupportedFiles.join(', ')}. Please upload PDF, DOC, DOCX, or TXT files only.`)
    }
    if (supportedFiles.length > 0) {
      const existingNames = uploadedResumes.map(f => f.name)
      const newFiles = supportedFiles.filter(file => !existingNames.includes(file.name))
      const duplicateFiles = supportedFiles.filter(file => existingNames.includes(file.name))
      if (duplicateFiles.length > 0) {
        setUploadError(`Duplicate files skipped: ${duplicateFiles.map(f => f.name).join(', ')}`)
      }
      if (newFiles.length > 0) {
        setProcessingFiles(newFiles.map(f => f.name))
        setTimeout(() => {
          onResumeUpload(newFiles)
          setProcessingFiles([])
        }, 500)
      }
    }
  }, [onResumeUpload, uploadedResumes])
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    maxFiles: 20 // Reasonable limit
  })
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'txt': return '📋'
      default: return '📄'
    }
  }
  const getFileStatusColor = (filename: string): string => {
    if (processingFiles.includes(filename)) {
      return 'border-blue-300 bg-blue-50'
    }
    return 'border-gray-200 bg-gray-50'
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload Candidate Resumes</h2>
        <div className="text-right">
          <span className="text-sm text-gray-600">
            {uploadedResumes.length} file{uploadedResumes.length !== 1 ? 's' : ''} uploaded
          </span>
          {uploadedResumes.length > 0 && (
            <p className="text-xs text-green-600">Ready for AI analysis</p>
          )}
        </div>
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive && !isDragReject
            ? 'border-primary-400 bg-primary-50 transform scale-105'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">
            {isDragActive ? (isDragReject ? '❌' : '📥') : '📁'}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive 
                ? (isDragReject ? 'Invalid file type!' : 'Drop the files here...') 
                : 'Drag & drop resumes here'
              }
            </p>
            <p className="text-gray-500 mt-1">
              or <span className="text-primary-600 font-medium">click to browse</span>
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Supports PDF, DOC, DOCX, TXT files (max 10MB each)</p>
            <p className="text-xs mt-1">Up to 20 files can be uploaded at once</p>
          </div>
        </div>
      </div>
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <span className="text-red-500 mr-2 text-lg">⚠️</span>
            <div>
              <h4 className="text-red-800 font-medium">Upload Issue</h4>
              <p className="text-red-700 text-sm mt-1">{uploadError}</p>
            </div>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}
      {processingFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700 text-sm font-medium">
              Processing {processingFiles.length} file{processingFiles.length !== 1 ? 's' : ''}...
            </span>
          </div>
        </motion.div>
      )}
      {uploadedResumes.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Uploaded Files:</h3>
            <button
              onClick={() => {
                for (let i = uploadedResumes.length - 1; i >= 0; i--) {
                  onRemoveResume(i)
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {uploadedResumes.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between rounded-lg p-3 border transition-colors ${getFileStatusColor(file.name)}`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getFileIcon(file.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="text-green-600">✓ Ready for analysis</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <button
                      onClick={() => onRemoveResume(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          💡 AI Analysis Guidelines
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-2">✅ What Works Best:</h5>
            <ul className="space-y-1">
              <li>• Resumes with clear candidate names in headers</li>
              <li>• Documents with structured sections (Experience, Skills, etc.)</li>
              <li>• Text-based PDFs (not scanned images)</li>
              <li>• Files with technical skills clearly listed</li>
              <li>• Recent resume formats with contact information</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">🎯 AI Analysis Features:</h5>
            <ul className="space-y-1">
              <li>• <strong>Real name extraction</strong> from document content (not filenames)</li>
              <li>• <strong>Skills detection</strong> from 100+ technical keywords</li>
              <li>• <strong>Experience analysis</strong> including years and seniority</li>
              <li>• <strong>Semantic matching</strong> using AI embeddings</li>
              <li>• <strong>Match explanations</strong> with detailed reasoning</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>📋 Example:</strong> Upload "john_smith_resume.pdf" containing "Jane Doe" in the header 
            → Our AI will correctly identify the candidate as "Jane Doe", not "John Smith"
          </p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          📄 Supported File Formats
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📄</span>
            <div>
              <p className="font-medium">PDF</p>
              <p className="text-gray-600 text-xs">PDF</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📝</span>
            <div>
              <p className="font-medium">DOCX</p>
              <p className="text-gray-600 text-xs">WORD</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📝</span>
            <div>
              <p className="font-medium">DOC</p>
              <p className="text-gray-600 text-xs">DOCS</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="font-medium">TXT</p>
              <p className="text-gray-600 text-xs">TEXT</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          💡 <strong>Tip:</strong> PDF files generally provide the best text extraction results for AI analysis.
        </p>
      </div>
      {uploadedResumes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">📊 Upload Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{uploadedResumes.length}</p>
              <p className="text-green-700">Total Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {uploadedResumes.filter(f => f.name.toLowerCase().endsWith('.pdf')).length}
              </p>
              <p className="text-green-700">PDF Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(uploadedResumes.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024) * 10) / 10}
              </p>
              <p className="text-green-700">Total MB</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">✓</p>
              <p className="text-green-700">Ready to Analyze</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default ResumeUpload