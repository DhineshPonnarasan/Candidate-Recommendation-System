'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseResume } from '@/utils/resumeParser';
import { resumeService, type CandidateData } from '@/services/resumeService';
import ResumeUpload from '@/components/ai-recommendation/MatchResults';
import JobDescriptionInput from '@/components/ai-recommendation/JobDescriptionInput';
import MatchResults from './MatchResults';
import {
  calculateSemanticSimilarity,
  extractContactInfoFromText,
  extractCandidateNameFromText,
  extractNameFromFilename,
  extractSkillsBasic,
  generateCandidateSummary,
} from '@/features/matching/utils/aiUtils';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
type Candidate = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  similarity: number;
  skills: string[];
  summary: string;
  fileName: string;
  content: string;
};
const AIRecommendationForm = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedResumes, setUploadedResumes] = useState<File[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [useBackend, setUseBackend] = useState(true);
  const [processingStep, setProcessingStep] = useState('');
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const isConnected = await resumeService.testConnection();
        setApiStatus(isConnected ? 'connected' : 'disconnected');
        setUseBackend(isConnected);
        if (!isConnected) {
          console.warn('Backend not available, will use client-side parsing as fallback');
        }
      } catch (error) {
        console.warn('Backend connection check failed:', error);
        setApiStatus('disconnected');
        setUseBackend(false);
      }
    };
    checkBackendConnection();
  }, []);
  const handleJobDescriptionChange = (v: string) => setJobDescription(v);
  const handleResumeUpload = (files: File[]) => setUploadedResumes(prev => [...prev, ...files]);
  const removeResume = (index: number) => {
    const newFiles = [...uploadedResumes];
    newFiles.splice(index, 1);
    setUploadedResumes(newFiles);
    if (candidates.length > 0) {
      const newCands = [...candidates];
      newCands.splice(index, 1);
      setCandidates(newCands);
    }
  };
  const generateCandidateMatches = async () => {
    if (!jobDescription.trim() || uploadedResumes.length === 0) return;
    setIsAnalyzing(true);
    setCandidates([]);
    setProcessingStep('Processing resumes...');
    try {
      const parsed: Candidate[] = [];
      for (let i = 0; i < uploadedResumes.length; i++) {
        const file = uploadedResumes[i];
        setProcessingStep(`Processing ${file.name} (${i + 1}/${uploadedResumes.length})`);
        try {
          let candidateData: Candidate;
          if (useBackend && apiStatus === 'connected') {
            setProcessingStep(`Uploading ${file.name} to server...`);
            try {
              const backendResult = await resumeService.uploadResume(file);
              setProcessingStep(`Calculating similarity for ${file.name}`);
              const similarity = await calculateSemanticSimilarity(jobDescription, backendResult.resume_text);
              candidateData = {
                id: `cand_${i}_${Date.now()}`,
                name: backendResult.name || extractNameFromFilename(file.name),
                email: backendResult.email || '',
                phone: backendResult.phone || '',
                linkedin: '', // Backend doesn't extract LinkedIn yet
                similarity: similarity,
                skills: backendResult.skills || [],
                summary: generateCandidateSummary({
                  name: backendResult.name || extractNameFromFilename(file.name),
                  resumeText: backendResult.resume_text,
                  jobText: jobDescription,
                  similarity: similarity,
                  contact: { 
                    email: backendResult.email || '', 
                    phone: backendResult.phone || '', 
                    linkedin: '' 
                  },
                  skills: backendResult.skills || [],
                }),
                fileName: file.name,
                content: backendResult.resume_text,
              };
              console.log(`Backend processing successful for ${file.name}`);
            } catch (backendError) {
              console.warn(`Backend processing failed for ${file.name}, falling back to client-side:`, backendError);
              candidateData = await processResumeClientSide(file, i, jobDescription);
            }
          } else {
            candidateData = await processResumeClientSide(file, i, jobDescription);
          }
          parsed.push(candidateData);
        } catch (e) {
          console.error(`Error processing ${file.name}:`, e);
          const fallbackName = extractNameFromFilename(file.name);
          parsed.push({
            id: `cand_${i}_${Date.now()}`,
            name: fallbackName || 'Unknown Candidate',
            email: '',
            phone: '',
            linkedin: '',
            similarity: 0,
            skills: [],
            summary: `Unable to process resume file "${file.name}". This could be due to a corrupted file, unsupported format, or parsing error. Please try re-uploading the file or converting it to a different format.`,
            fileName: file.name,
            content: '',
          });
        }
      }
      parsed.sort((a, b) => b.similarity - a.similarity);
      setCandidates(parsed);
      setAnalysisComplete(true);
      setProcessingStep('');
    } catch (err) {
      console.error('Analysis failed:', err);
      setProcessingStep('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  const processResumeClientSide = async (file: File, index: number, jobDesc: string): Promise<Candidate> => {
    console.log(`Client-side processing for: ${file.name}, type: ${file.type}, size: ${file.size}`);
    const resumeText = await parseResume(file);
    console.log(`Extracted text length: ${resumeText.length} characters`);
    if (!resumeText || resumeText.length === 0) {
      console.warn(`No text extracted from ${file.name}`);
      const fallbackName = extractNameFromFilename(file.name);
      let errorMessage = `Unable to extract text from "${file.name}". `;
      if (file.type.includes('pdf')) {
        errorMessage += 'This PDF may be image-based, password-protected, or corrupted. Try converting it to a text-based PDF or DOCX format.';
      } else if (file.type.includes('doc')) {
        errorMessage += 'This document format may not be supported. Try saving it as a DOCX or PDF file.';
      } else {
        errorMessage += 'The file format may not be supported or the file may be corrupted.';
      }
      return {
        id: `cand_${index}_${Date.now()}`,
        name: fallbackName || 'Unknown Candidate',
        email: '',
        phone: '',
        linkedin: '',
        similarity: 0,
        skills: [],
        summary: errorMessage,
        fileName: file.name,
        content: '',
      };
    }
    const contact = extractContactInfoFromText(resumeText);
    let candidateName = extractCandidateNameFromText(resumeText);
    if (!candidateName || candidateName === 'Unknown Candidate' || candidateName.length < 3) {
      candidateName = extractNameFromFilename(file.name);
    }
    const skills = extractSkillsBasic(resumeText);
    setProcessingStep(`Calculating similarity for ${file.name}`);
    const sim = await calculateSemanticSimilarity(jobDesc, resumeText);
    const aiSummary = generateCandidateSummary({
      name: candidateName,
      resumeText: resumeText,
      jobText: jobDesc,
      similarity: sim,
      contact: contact,
      skills: skills,
    });
    return {
      id: `cand_${index}_${Date.now()}`,
      name: candidateName,
      email: contact.email || '',
      phone: contact.phone || '',
      linkedin: contact.linkedin || '',
      similarity: sim,
      skills,
      summary: aiSummary,
      fileName: file.name,
      content: resumeText,
    };
  };
  const matchResults = candidates.map((c, idx) => {
    const score = Math.round((c.similarity || 0) * 100);
    return {
      id: c.id,
      name: c.name,
      fileName: c.fileName,
      matchScore: score,
      email: c.email?.trim() || 'Not specified',
      phone: c.phone?.trim() || 'Not specified',
      linkedin: (c.linkedin || '').trim(), // card decides Not specified
      summary: c.summary,
      rank: idx + 1,
    };
  });
  return (
    <div className="w-full max-w-6xl mx-auto">
      {apiStatus !== 'checking' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div
            className={`p-4 rounded-xl border ${
              apiStatus === 'connected'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <CpuChipIcon className="w-5 h-5" />
              <span className="font-medium">
                {apiStatus === 'connected'
                  ? 'Backend API Connected — Enhanced Resume Processing Active'
                  : 'Backend Offline — Using Client-Side Processing (Limited Accuracy)'}
              </span>
            </div>
            {apiStatus === 'connected' && (
              <p className="text-sm mt-2">
                Using server-side PDF processing for better accuracy and contact information extraction.
              </p>
            )}
            {apiStatus === 'disconnected' && (
              <p className="text-sm mt-2">
                Falling back to browser-based processing. Some PDFs may not parse correctly.
              </p>
            )}
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
                <p className="text-sm text-gray-600">Paste the role requirements and responsibilities</p>
              </div>
            </div>
            <JobDescriptionInput value={jobDescription} onChange={handleJobDescriptionChange} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <CloudArrowUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upload Resumes</h2>
                <p className="text-sm text-gray-600">Add candidate resumes (PDF/DOCX/TXT)</p>
              </div>
            </div>
            <ResumeUpload
              onResumeUpload={handleResumeUpload}
              uploadedResumes={uploadedResumes}
              onRemoveResume={removeResume}
            />
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-center mb-8"
      >
        <button
          onClick={generateCandidateMatches}
          disabled={isAnalyzing || !jobDescription.trim() || uploadedResumes.length === 0}
          className={`group relative px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${
            isAnalyzing || !jobDescription.trim() || uploadedResumes.length === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 hover:shadow-lg'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing…
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Analyze {uploadedResumes.length} Candidate{uploadedResumes.length !== 1 ? 's' : ''}
            </span>
          )}
        </button>
        {(jobDescription.trim() === '' || uploadedResumes.length === 0) && (
          <p className="mt-3 text-sm text-gray-500">
            {!jobDescription.trim() && uploadedResumes.length === 0
              ? 'Add a job description and upload resumes to begin'
              : !jobDescription.trim()
              ? 'Add a job description to begin'
              : 'Upload at least one resume to begin'}
          </p>
        )}
      </motion.div>
      {isAnalyzing && processingStep && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="font-medium text-blue-800">Processing</div>
              <div className="text-sm text-blue-700">{processingStep}</div>
            </div>
          </div>
          <div className="mt-4 bg-blue-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </motion.div>
      )}
      {analysisComplete && matchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-medium border border-gray-200/60"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <p className="text-gray-600">Candidates ranked by similarity</p>
            </div>
          </div>
          <MatchResults
            results={matchResults}
            isLoading={isAnalyzing}
            jobTitle={jobDescription.split('\n')[0] || 'Position'}
          />
        </motion.div>
      )}
      {analysisComplete && matchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Matches Found</h3>
          <p className="text-yellow-700">
            Try different resumes or adjust the job description for better alignment.
          </p>
        </motion.div>
      )}
    </div>
  );
};
export default AIRecommendationForm;