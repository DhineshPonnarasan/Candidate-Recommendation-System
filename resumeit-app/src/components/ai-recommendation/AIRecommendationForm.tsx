'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseResume } from '@/utils/resumeParser';
import { resumeService, type CandidateData } from '@/services/resumeService';
import ResumeUpload from '@/components/ai-recommendation/ResumeUpload';
import JobDescriptionInput from '@/components/ai-recommendation/JobDescriptionInput';
import MatchResults from '@/components/ai-recommendation/MatchResults';
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
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
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
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
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
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:80',message:'generateCandidateMatches START',data:{resumeCount:uploadedResumes.length,useBackend,apiStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    setIsAnalyzing(true);
    setCandidates([]);
    setError(null);
    setAnalysisComplete(false);
    setProcessingStep('Initializing analysis...');
    setProcessingProgress({ current: 0, total: uploadedResumes.length });
    
    try {
      const parsed: Candidate[] = [];
      for (let i = 0; i < uploadedResumes.length; i++) {
        const file = uploadedResumes[i];
        setProcessingProgress({ current: i + 1, total: uploadedResumes.length });
        setProcessingStep(`Processing ${file.name} (${i + 1}/${uploadedResumes.length})`);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:95',message:'processing file loop iteration',data:{fileName:file.name,fileIndex:i,useBackend,apiStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        try {
          let candidateData: Candidate;
          if (useBackend && apiStatus === 'connected') {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:109',message:'BACKEND PATH selected',data:{fileName:file.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.log(`[PATH SELECTION] Using backend path for ${file.name} (backend has better PDF parsing)`);
            setProcessingStep(`Uploading ${file.name} to server...`);
            try {
              const backendResult = await resumeService.uploadResume(file);
              
              // Extract resume_text - check multiple possible locations in response
              const resumeText = backendResult.resume_text || 
                                (backendResult as any).resume_text || 
                                (backendResult as any).candidate?.resume_text || 
                                '';
              
              console.log(`[BACKEND] Response structure:`, {
                hasResumeText: !!resumeText,
                resumeTextLength: resumeText.length,
                candidateKeys: Object.keys(backendResult),
                topLevelKeys: Object.keys((backendResult as any))
              });
              
              // Validate extracted text - reject binary data
              if (resumeText && (resumeText.trim().startsWith('%PDF-') || resumeText.includes('\x00'))) {
                throw new Error('Backend returned binary PDF data instead of extracted text. PDF parsing failed.');
              }
              
              if (!resumeText || resumeText.length === 0) {
                console.error(`[BACKEND ERROR] No resume text in response. Full response:`, backendResult);
                throw new Error('No resume text extracted from backend. Check backend logs for PDF parsing errors.');
              }
              
              console.log(`[BACKEND] Successfully extracted ${resumeText.length} characters from ${file.name}`);
              
              setProcessingStep(`Calculating similarity for ${file.name}`);
              const similarity = await calculateSemanticSimilarity(jobDescription, resumeText);
              
              // Use backend-extracted data directly (backend now has multi-library parsing)
              // Backend extracts: name, email, phone, linkedin, skills
              const backendName = (backendResult as any).name || backendResult.name || '';
              const backendEmail = (backendResult as any).email || backendResult.email || '';
              const backendPhone = (backendResult as any).phone || backendResult.phone || '';
              const backendLinkedin = (backendResult as any).linkedin || '';
              
              // Use backend name if valid, otherwise try one extraction attempt
              let finalName = backendName && backendName !== 'Unknown Candidate' ? backendName : extractCandidateNameFromText(resumeText);
              
              // If still unknown and we have text, try aggressive extraction
              if (finalName === 'Unknown Candidate' && resumeText.length > 50) {
                const firstLine = resumeText.split(/\n/)[0]?.trim();
                if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
                  const aggressiveMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
                  if (aggressiveMatch) {
                    finalName = aggressiveMatch[1];
                    console.log(`[BACKEND] Aggressive extraction found name: "${finalName}"`);
                  }
                }
              }
              
              // Use backend contact info directly (backend extraction is more reliable)
              const finalEmail = backendEmail || '';
              const finalPhone = backendPhone || '';
              const finalLinkedin = backendLinkedin || '';
              
              candidateData = {
                id: `cand_${i}_${Date.now()}`,
                name: finalName,
                email: finalEmail,
                phone: finalPhone,
                linkedin: finalLinkedin,
                similarity: similarity,
                skills: backendResult.skills || [],
                summary: generateCandidateSummary({
                  name: finalName,
                  resumeText: resumeText,
                  jobText: jobDescription,
                  similarity: similarity,
                  contact: { email: finalEmail, phone: finalPhone, linkedin: finalLinkedin },
                  skills: backendResult.skills || [],
                }),
                fileName: file.name,
                content: resumeText,
              };
              
              console.log(`[BACKEND] Candidate created:`, { name: candidateData.name, email: candidateData.email, phone: candidateData.phone, linkedin: candidateData.linkedin });
            } catch (backendError) {
              console.error(`[BACKEND ERROR] Backend processing failed for ${file.name}:`, backendError);
              const errorMsg = backendError instanceof Error ? backendError.message : String(backendError);
              
              // For PDF/DOCX files, backend is REQUIRED - show error and stop processing
              const fileExt = file.name.split('.').pop()?.toLowerCase();
              if (fileExt === 'pdf' || fileExt === 'docx' || fileExt === 'doc') {
                // Set error and stop processing this file
                setError(`Cannot process ${fileExt.toUpperCase()} file "${file.name}" without backend server. Error: ${errorMsg}. Please ensure backend server is running on port 8081.`);
                // Skip this file - don't create fallback candidate
                continue;
              }
              
              // For TXT files, fallback to client-side
              console.log(`[FALLBACK] Using client-side parsing for TXT file ${file.name}`);
              candidateData = await processResumeClientSide(file, i, jobDescription);
            }
          } else {
            // Backend not available
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            
            // For PDF/DOCX files, backend is REQUIRED
            if (fileExt === 'pdf' || fileExt === 'docx' || fileExt === 'doc') {
              setError(`Backend server is required for ${fileExt.toUpperCase()} file parsing. Please start the backend server (run "python app.py" in the backend directory) and try again.`);
              // Skip this file - don't create fallback candidate
              continue;
            }
            
            // For TXT files, use client-side
            console.log(`[CLIENT-SIDE] Using client-side parsing for TXT file ${file.name} (backend unavailable)`);
            candidateData = await processResumeClientSide(file, i, jobDescription);
          }
          
          // Only push if candidateData was successfully created
          if (candidateData) {
            console.log(`[PARSED ARRAY] Pushing candidate to parsed array:`, { name: candidateData.name, email: candidateData.email, phone: candidateData.phone, linkedin: candidateData.linkedin });
            parsed.push(candidateData);
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:237',message:'candidate pushed to parsed array',data:{name:candidateData.name,email:candidateData.email,phone:candidateData.phone,linkedin:candidateData.linkedin,parsedLength:parsed.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          }
        } catch (e) {
          console.error(`Error processing ${file.name}:`, e);
          const errorMsg = e instanceof Error ? e.message : String(e);
          const fileExt = file.name.split('.').pop()?.toLowerCase();
          
          // Check if error is about backend being required
          if (errorMsg.includes('Backend required') || errorMsg.includes('Backend server is required')) {
            // Don't create fallback candidate - show error to user instead
            setError(`Cannot process ${fileExt?.toUpperCase()} file "${file.name}" without backend server. Please start the backend server (run "python app.py" in the backend directory) and try again.`);
            continue; // Skip this file
          }
          
          // For other errors, try to create a fallback candidate
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:242',message:'ERROR HANDLER: exception caught',data:{fileName:file.name,errorMessage:errorMsg},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          // Only try client-side extraction for TXT files
          let errorResumeText = '';
          let errorName = '';
          let errorEmail = '';
          let errorPhone = '';
          let errorLinkedin = '';
          
          if (fileExt === 'txt') {
            try {
              // Last-ditch attempt for TXT files only
              errorResumeText = await file.text();
              if (errorResumeText && errorResumeText.length > 0) {
                const errorContact = extractContactInfoFromText(errorResumeText);
                errorName = extractCandidateNameFromText(errorResumeText);
                errorEmail = errorContact.email || '';
                errorPhone = errorContact.phone || '';
                errorLinkedin = errorContact.linkedin || '';
              }
            } catch (extractError) {
              console.warn('Last-ditch extraction failed:', extractError);
            }
          }
          
          // Use extracted values if available, otherwise filename fallback
          const fallbackName = errorName && errorName !== 'Unknown Candidate' 
            ? errorName 
            : extractNameFromFilename(file.name) || 'Unknown Candidate';
          
          // Create error message based on file type
          let errorSummary = `Unable to process resume file "${file.name}". `;
          if (fileExt === 'pdf' || fileExt === 'docx' || fileExt === 'doc') {
            errorSummary += `Backend server is required for ${fileExt.toUpperCase()} file parsing. Please start the backend server and try again.`;
          } else {
            errorSummary += `Error: ${errorMsg}. Please check the file and try again.`;
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:275',message:'ERROR HANDLER: creating fallback candidate',data:{fileName:file.name,errorMessage:errorMsg,fallbackName,errorResumeTextLength:errorResumeText.length,hasExtractedText:errorResumeText.length>0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          // INVARIANT 3: Create single canonical candidate object
          parsed.push({
            id: `cand_${i}_${Date.now()}`,
            name: fallbackName,
            email: errorEmail,
            phone: errorPhone,
            linkedin: errorLinkedin,
            similarity: 0,
            skills: [],
            summary: errorSummary,
            fileName: file.name,
            content: errorResumeText,
          });
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:295',message:'ERROR HANDLER: fallback candidate pushed',data:{name:fallbackName,email:errorEmail,phone:errorPhone,linkedin:errorLinkedin,parsedLength:parsed.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
      }
      parsed.sort((a, b) => b.similarity - a.similarity);
      
      console.log(`[STATE UPDATE] Setting candidates state:`, parsed.map(c => ({ name: c.name, email: c.email, phone: c.phone, linkedin: c.linkedin })));
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:325',message:'candidates sorted and ready for state',data:{parsedLength:parsed.length,firstCandidateName:parsed[0]?.name,firstCandidateEmail:parsed[0]?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      setCandidates(parsed);
      setAnalysisComplete(true);
      setProcessingStep('');
      setProcessingProgress({ current: 0, total: 0 });
      
      if (parsed.length === 0) {
        // Check if we have PDFs and backend is offline
        const hasPDFs = uploadedResumes.some(f => {
          const ext = f.name.split('.').pop()?.toLowerCase();
          return ext === 'pdf' || ext === 'docx' || ext === 'doc';
        });
        
        if (hasPDFs && apiStatus === 'disconnected') {
          setError('Cannot process PDF/DOCX files without backend server. Please:\n1. Start the backend server: Open a terminal, navigate to the "backend" folder, and run "python app.py"\n2. Wait for "Running on http://0.0.0.0:8081" message\n3. Refresh this page\n4. Try uploading again');
        } else if (hasPDFs && apiStatus === 'connected') {
          setError('Backend processing failed for all files. Please check the backend server terminal for error messages. Common issues: missing Python libraries (run "pip install -r requirements.txt") or database errors.');
        } else {
          setError('No candidates were successfully processed. Please check your files and try again.');
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(errorMessage);
      setProcessingStep('');
      setProcessingProgress({ current: 0, total: 0 });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const processResumeClientSide = async (file: File, index: number, jobDesc: string): Promise<Candidate> => {
    console.log(`[CLIENT-SIDE] Processing TXT file: ${file.name}`);
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // CRITICAL: Client-side only supports TXT files
    // PDF/DOCX require backend (multi-library parsing)
    if (fileExt !== 'txt') {
      throw new Error(`Client-side parsing only supports TXT files. ${fileExt?.toUpperCase()} files require backend server. Please start the backend and try again.`);
    }
    
    // Simple TXT file reading
    let resumeText = '';
    try {
      resumeText = await file.text();
      console.log(`[CLIENT-SIDE] Extracted ${resumeText.length} characters from TXT file`);
    } catch (parseError) {
      console.error(`[CLIENT-SIDE] Error reading TXT file ${file.name}:`, parseError);
      throw new Error(`Failed to read TXT file: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
    
    if (!resumeText || resumeText.length === 0) {
      const fallbackName = extractNameFromFilename(file.name);
      return {
        id: `cand_${index}_${Date.now()}`,
        name: fallbackName || 'Unknown Candidate',
        email: '',
        phone: '',
        linkedin: '',
        similarity: 0,
        skills: [],
        summary: `Unable to extract text from "${file.name}". The file appears to be empty.`,
        fileName: file.name,
        content: '',
      };
    }
    // STAGE 3-4: Header-First Entity Extraction with Confidence Gating
    // This follows FAANG-style pipeline: extract from header zone only, apply confidence gating
    console.log(`[EXTRACTION] Starting entity extraction for ${file.name}, resumeText length: ${resumeText.length}`);
    const contact = extractContactInfoFromText(resumeText);
    console.log(`[EXTRACTION] Contact extracted:`, { email: contact.email, phone: contact.phone, linkedin: contact.linkedin });
    let candidateName = extractCandidateNameFromText(resumeText);
    console.log(`[EXTRACTION] Name extracted: "${candidateName}"`);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:395',message:'entity extraction results',data:{candidateName,email:contact.email,phone:contact.phone,linkedin:contact.linkedin,resumeTextLength:resumeText.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // STAGE 5: Canonical Candidate Object Assembly
    // Filename fallback logic moved below to INVARIANT 1 enforcement section
    // (removed duplicate fallback logic)
    
    // INVARIANT 1 ENFORCEMENT: Identity must exist if resume text exists
    // If resume text length > 0, candidate name MUST NOT be "Unknown Candidate"
    // Filename fallback is ONLY allowed if text extraction failed (< 50 chars)
    let finalName: string;
    
    // INVARIANT 4: Fallback is terminal - filename fallback executes ONLY ONCE here
    const filenameFallbackExecuted = resumeText.length < 50 && candidateName === 'Unknown Candidate';
    if (filenameFallbackExecuted) {
      const filenameName = extractNameFromFilename(file.name);
      const words = filenameName.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(w => /^[A-Z][a-z]+$/.test(w))) {
        candidateName = filenameName;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:361',message:'filename fallback executed (terminal)',data:{filenameName,resumeTextLength:resumeText.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    }
    
    // INVARIANT 1: Enforce identity existence
    if (resumeText.length > 0) {
      // We have text - name MUST exist (either extracted or filename fallback)
      if (candidateName && candidateName !== 'Unknown Candidate' && candidateName.trim().length > 0) {
        finalName = candidateName; // INVARIANT 2: Immutable after assignment
      } else {
        // CRITICAL: This violates INVARIANT 1 - try aggressive extraction
        console.error(`[INVARIANT 1 VIOLATION] Client-side: Resume text exists (${resumeText.length} chars) but name extraction failed. Text preview: ${resumeText.substring(0, 300)}`);
        
        // Aggressive extraction: try first line
        const firstLine = resumeText.split(/\n/)[0]?.trim();
        if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
          const aggressiveMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+){0,2})/);
          if (aggressiveMatch && aggressiveMatch[1]) {
            const aggressiveName = aggressiveMatch[1].trim();
            const words = aggressiveName.split(/\s+/);
            if (words.length >= 2 && words.length <= 4) {
              finalName = aggressiveName;
              console.log(`[CLIENT-SIDE] Aggressive extraction found name: "${finalName}"`);
            } else {
              finalName = 'Unknown Candidate';
            }
          } else {
            finalName = 'Unknown Candidate';
          }
        } else {
          finalName = 'Unknown Candidate';
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:448',message:'INVARIANT 1 VIOLATION detected (client-side)',data:{resumeTextLength:resumeText.length,candidateName,finalName,firstLine:firstLine?.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    } else {
      // No text - filename fallback is acceptable (text extraction failed)
      const filenameName = extractNameFromFilename(file.name);
      const words = filenameName.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(w => /^[A-Z][a-z]+$/.test(w))) {
        finalName = filenameName;
        console.log(`[CLIENT-SIDE] Using filename fallback (text extraction failed): "${finalName}"`);
      } else {
        finalName = 'Unknown Candidate';
      }
    }
    
    const finalEmail = contact.email || '';
    const finalPhone = contact.phone || '';
    const finalLinkedIn = contact.linkedin || '';
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:355',message:'final identity fields BEFORE candidate object',data:{finalName,finalEmail,finalPhone,finalLinkedIn,candidateName,resumeTextLength:resumeText.length,invariantCheck:resumeText.length > 0 && finalName === 'Unknown Candidate' ? 'VIOLATED' : 'OK'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const skills = extractSkillsBasic(resumeText);
    setProcessingStep(`Calculating similarity for ${file.name}`);
    const sim = await calculateSemanticSimilarity(jobDesc, resumeText);
    const aiSummary = generateCandidateSummary({
      name: finalName,
      resumeText: resumeText,
      jobText: jobDesc,
      similarity: sim,
      contact: { email: finalEmail, phone: finalPhone, linkedin: finalLinkedIn },
      skills: skills,
    });
    
    // INVARIANT 3: Single source of truth - create ONE canonical candidate object
    // INVARIANT 2: Identity is immutable after extraction - these values MUST NOT be overwritten
    console.log(`[CANDIDATE OBJECT] Creating candidate object with:`, { name: finalName, email: finalEmail, phone: finalPhone, linkedin: finalLinkedIn });
    const candidateObj: Candidate = {
      id: `cand_${index}_${Date.now()}`,
      name: finalName, // INVARIANT 2: Immutable after this assignment
      email: finalEmail, // INVARIANT 2: Immutable after this assignment
      phone: finalPhone, // INVARIANT 2: Immutable after this assignment
      linkedin: finalLinkedIn, // INVARIANT 2: Immutable after this assignment
      similarity: sim,
      skills,
      summary: aiSummary,
      fileName: file.name,
      content: resumeText,
    };
    
    console.log(`[CANDIDATE OBJECT] Created candidate:`, { id: candidateObj.id, name: candidateObj.name, email: candidateObj.email, phone: candidateObj.phone });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:410',message:'canonical candidate object created (INVARIANT 3)',data:{name:candidateObj.name,email:candidateObj.email,phone:candidateObj.phone,linkedin:candidateObj.linkedin,resumeTextLength:resumeText.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // INVARIANT 2: Return immutable object - no further modifications allowed
    return candidateObj;
  };
  // INVARIANT 3: Single source of truth - map from canonical candidate objects
  // INVARIANT 5: UI renders truth - pass through exact values, no defaulting
  const matchResults = candidates.map((c, idx) => {
    const score = Math.round((c.similarity || 0) * 100);
    
    // INVARIANT 5: Render truth - use exact values from canonical object
    // DO NOT default here - let UI component handle empty strings
    const mapped = {
      id: c.id,
      name: c.name || '', // Pass through exactly - UI will handle display
      fileName: c.fileName,
      matchScore: score,
      email: c.email?.trim() || '', // Empty string, not "Not specified"
      phone: c.phone?.trim() || '', // Empty string, not "Not specified"
      linkedin: (c.linkedin || '').trim(), // Empty string if missing
      summary: c.summary,
      rank: idx + 1,
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIRecommendationForm.tsx:450',message:'matchResults mapping (INVARIANT 5)',data:{originalName:c.name,originalEmail:c.email,originalPhone:c.phone,originalLinkedin:c.linkedin,mappedName:mapped.name,mappedEmail:mapped.email,mappedPhone:mapped.phone,mappedLinkedin:mapped.linkedin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    return mapped;
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
              <div className="text-sm mt-2 space-y-1">
                <p>
                  Using server-side PDF processing for better accuracy and contact information extraction.
                </p>
                <p className="font-medium text-green-900">
                  ✅ Files are saved permanently to the server and stored in the database.
                </p>
              </div>
            )}
            {apiStatus === 'disconnected' && (
              <div className="text-sm mt-2 space-y-1">
                <p>
                  Falling back to browser-based processing. Some PDFs may not parse correctly.
                </p>
                <p className="font-medium text-yellow-900">
                  ⚠️ Note: Files are NOT saved permanently. They're only processed in your browser and will be lost if you refresh the page.
                </p>
              </div>
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
          <Card variant="elevated">
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
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <Card variant="elevated">
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
          </Card>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-center mb-8"
      >
        <Button
          onClick={generateCandidateMatches}
          disabled={isAnalyzing || !jobDescription.trim() || uploadedResumes.length === 0}
          size="lg"
          className="group"
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
        </Button>
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
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card variant="outlined" className="border-danger-200 bg-danger-50">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-danger-900 mb-1">Analysis Error</h3>
                <p className="text-danger-700 text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-danger-600 hover:text-danger-800 text-sm font-medium underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      {isAnalyzing && processingStep && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card variant="elevated" className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <div className="font-semibold text-blue-900">Processing Resumes</div>
                <div className="text-sm text-blue-700">{processingStep}</div>
              </div>
            </div>
            {processingProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-blue-700">
                  <span>Progress</span>
                  <span>{processingProgress.current} / {processingProgress.total}</span>
                </div>
                <div className="bg-blue-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-blue-600 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(processingProgress.current / processingProgress.total) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
      {analysisComplete && matchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card variant="elevated" className="p-8">
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
          </Card>
        </motion.div>
      )}
      {analysisComplete && matchResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card variant="outlined" className="border-warning-200 bg-warning-50 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Matches Found</h3>
          <p className="text-warning-700">
            Try different resumes or adjust the job description for better alignment.
          </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
export default AIRecommendationForm;