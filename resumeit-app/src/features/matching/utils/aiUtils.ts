export async function generateEmbeddings(text: string): Promise<number[]> {
  const EMBEDDING_SIZE = 384;
  const v = new Array(EMBEDDING_SIZE).fill(0);
  const clean = (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return v;
  const keywordsWeight: Record<string, number> = {
    python: 3, java: 3, javascript: 3, typescript: 3, react: 3, node: 3, "node.js": 3,
    sql: 3, r: 3, tableau: 3, "power bi": 3, pandas: 3, numpy: 3,
    "machine learning": 3, "deep learning": 3, tensorflow: 3, pytorch: 3,
    aws: 3, azure: 3, gcp: 3, docker: 3, kubernetes: 3, spark: 3, hadoop: 3,
  };
  const tokens = clean.split(" ").filter(w => w.length > 2);
  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    const bigram = `${w} ${tokens[i + 1] || ""}`.trim();
    const weight = keywordsWeight[w] ?? keywordsWeight[bigram] ?? 1;
    const pos = Math.abs(hashString(w)) % EMBEDDING_SIZE;
    v[pos] += weight;
    [1, 2].forEach(off => {
      v[(pos + off) % EMBEDDING_SIZE] += weight * 0.25;
      v[(pos - off + EMBEDDING_SIZE) % EMBEDDING_SIZE] += weight * 0.25;
    });
  }
  let mag = 0;
  for (let i = 0; i < v.length; i++) mag += v[i] * v[i];
  mag = Math.sqrt(mag) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= mag;
  return v;
}
export function calculateSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  ma = Math.sqrt(ma) || 1;
  mb = Math.sqrt(mb) || 1;
  const sim = dot / (ma * mb);
  return Math.max(0, Math.min(1, sim));
}
export async function calculateSemanticSimilarity(a: string, b: string): Promise<number> {
  const e1 = await generateEmbeddings(a || "");
  const e2 = await generateEmbeddings(b || "");
  const sim = calculateSimilarity(e1, e2);
  return Math.min(0.95, Math.max(0.15, sim + overlapBonus(a, b)));
}
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const stop = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
    "is","are","was","were","be","been","have","has","had","do","does","did",
    "will","would","could","should","may","might","must","can","shall",
    "this","that","these","those","i","you","he","she","it","we","they",
    "me","him","her","us","them","my","your","his","its","our","their"
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w));
  const count = new Map<string, number>();
  for (const w of words) count.set(w, (count.get(w) || 0) + 1);
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w);
}
function overlapBonus(t1: string, t2: string): number {
  const k1 = extractKeywords(t1);
  const k2 = extractKeywords(t2);
  if (!k1.length || !k2.length) return 0;
  const common = k1.filter(k => k2.includes(k));
  const ratio = common.length / Math.max(k1.length, k2.length);
  return Math.min(0.1, ratio * 0.3);
}
function REGEX_ESCAPE(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function containsToken(text: string, term: string): boolean {
  if (!text || !term) return false;
  const escaped = REGEX_ESCAPE(term);
  const re = new RegExp(`(^|[^A-Za-z0-9_])${escaped}([^A-Za-z0-9_]|$)`, "i");
  return re.test(text);
}
/**
 * STAGE 1: Document Normalization
 * Normalize whitespace, line breaks, and unicode characters
 */
function normalizeResumeText(text: string): string {
  if (!text) return "";
  
  // Normalize line breaks
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Normalize unicode whitespace
  normalized = normalized.replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');
  
  // Collapse multiple spaces to single space (but preserve line breaks)
  normalized = normalized.replace(/[ \t]+/g, ' ');
  
  // Remove excessive line breaks (more than 2 consecutive)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  return normalized.trim();
}

/**
 * STAGE 2: Structural Segmentation
 * Split resume into header zone (first 5-7 meaningful lines) and body zone
 */
interface ResumeZones {
  headerZone: string;
  bodyZone: string;
  headerLines: string[];
}

function segmentResume(text: string): ResumeZones {
  const normalized = normalizeResumeText(text);
  const lines = normalized.split(/\n+/);
  
  // Extract first 5-7 meaningful non-empty lines as header zone
  const headerLines: string[] = [];
  for (let i = 0; i < lines.length && headerLines.length < 7; i++) {
    const line = lines[i].trim();
    if (line && line.length >= 2) { // Meaningful line (at least 2 chars)
      headerLines.push(line);
    }
  }
  
  const headerZone = headerLines.join('\n');
  const bodyZone = lines.slice(headerLines.length).join('\n');
  
  return { headerZone, bodyZone, headerLines };
}

/**
 * STAGE 3: Header-First Entity Extraction with Confidence Scoring
 */
interface ExtractionResult {
  value: string;
  confidence: number; // 0.0 to 1.0
}

interface EntityExtraction {
  name: ExtractionResult;
  email: ExtractionResult;
  phone: ExtractionResult;
  linkedin: ExtractionResult;
}

/**
 * Extract and rank name candidates from header zone
 */
function extractNameWithConfidence(headerZone: string, headerLines: string[]): ExtractionResult {
  if (!headerZone || headerZone.length < 10) {
    return { value: "", confidence: 0.0 };
  }
  
  const banned = /\b(RESUME|CURRICULUM|VITAE|CONTACT|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|PHONE|EMAIL|ADDRESS|CITY|STATE|ZIP|COUNTRY|PAGE|DATE)\b/i;
  const nameCandidates: Array<{ name: string; score: number }> = [];
  
  // Generate multiple name candidates from header lines
  for (let lineIdx = 0; lineIdx < headerLines.length; lineIdx++) {
    const line = headerLines[lineIdx];
    
    // Skip banned lines, contact info, metadata
    if (banned.test(line)) continue;
    if (/^[A-Z\s]{0,2}$/.test(line)) continue;
    if (/@/.test(line) && !/^[A-Z][a-z]/.test(line)) continue;
    if (/^https?:\/\//.test(line)) continue;
    if (/^\+?\d[\d\s().-]{8,}/.test(line)) continue;
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line)) continue;
    
    // Pattern 1: Standard name format
    const pattern1 = /^([A-Z][a-z]{1,25}(?:\s+[A-Z][a-zA-Z\-']{1,25}){1,3})\b/;
    const match1 = line.match(pattern1);
    if (match1) {
      const candidate = match1[1].trim();
      const words = candidate.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(w => w.length >= 1 && /^[A-Z]/.test(w)) && 
          !banned.test(candidate)) {
        // Calculate confidence score
        const capitalizationRatio = candidate.split('').filter(c => /[A-Z]/.test(c)).length / candidate.length;
        const tokenCount = words.length;
        const hasVerbs = /\b(is|are|was|were|has|have|had|do|does|did|can|could|will|would)\b/i.test(candidate);
        const hasNumbers = /\d/.test(candidate);
        const hasPunctuation = /[.,;:!?]/.test(candidate);
        const positionScore = 1.0 - (lineIdx / headerLines.length) * 0.3; // Earlier lines score higher
        
        let score = 0.0;
        if (capitalizationRatio >= 0.1 && capitalizationRatio <= 0.5) score += 0.3; // Good capitalization
        if (tokenCount >= 2 && tokenCount <= 4) score += 0.3; // Good token count
        if (!hasVerbs) score += 0.2; // No verbs
        if (!hasNumbers) score += 0.1; // No numbers
        if (!hasPunctuation) score += 0.1; // No punctuation
        score *= positionScore; // Apply position multiplier
        
        nameCandidates.push({ name: candidate, score });
      }
    }
    
    // Pattern 2: All-caps names
    const capsPattern = /^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\b/;
    const capsMatch = line.match(capsPattern);
    if (capsMatch && !banned.test(capsMatch[1])) {
      const candidate = capsMatch[1].toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).trim();
      const words = candidate.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const positionScore = 1.0 - (lineIdx / headerLines.length) * 0.3;
        nameCandidates.push({ name: candidate, score: 0.7 * positionScore });
      }
    }
  }
  
  // Rank candidates by score and return best one
  if (nameCandidates.length === 0) {
    return { value: "", confidence: 0.0 };
  }
  
  nameCandidates.sort((a, b) => b.score - a.score);
  const best = nameCandidates[0];
  
  // More lenient threshold - accept if score >= 0.3 (matches CONFIDENCE_THRESHOLD)
  // This allows names that are less perfect but still likely valid
  return {
    value: best.score >= 0.3 ? best.name : "", // Accept if confidence >= 0.3
    confidence: best.score
  };
}

/**
 * Extract email with confidence scoring
 */
function extractEmailWithConfidence(headerZone: string): ExtractionResult {
  if (!headerZone) return { value: "", confidence: 0.0 };
  
  const emailPatterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /[A-Z0-9._%+-]+\s*\[at\]\s*[A-Z0-9.-]+\s*\[dot\]\s*[A-Z]{2,}/gi,
    /[A-Z0-9._%+-]+\s*at\s*[A-Z0-9.-]+\s*dot\s*[A-Z]{2,}/gi,
  ];
  
  for (const pattern of emailPatterns) {
    const match = headerZone.match(pattern);
    if (match && match[0]) {
      let email = match[0]
        .replace(/\s*\[at\]\s*/gi, "@")
        .replace(/\s*at\s*/gi, "@")
        .replace(/\s*\[dot\]\s*/gi, ".")
        .replace(/\s*dot\s*/gi, ".")
        .trim();
      
      if (email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
        // High confidence for valid email format
        return { value: email, confidence: 0.95 };
      }
    }
  }
  
  return { value: "", confidence: 0.0 };
}

/**
 * Extract phone with confidence scoring
 */
function extractPhoneWithConfidence(headerZone: string): ExtractionResult {
  if (!headerZone) return { value: "", confidence: 0.0 };
  
  const phonePatterns = [
    /\+?1?[\s.-]?\(?([2-9]\d{2})\)?[\s.-]?([2-9]\d{2})[\s.-]?(\d{4})\b/g,
    /\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g,
    /\b([2-9]\d{1,2}[\s.-]?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{0,4})\b/g,
  ];
  
  for (const pattern of phonePatterns) {
    const matches = [...headerZone.matchAll(pattern)];
    for (const match of matches) {
      const candidate = match[0];
      const digits = candidate.replace(/\D/g, '');
      
      // Validation
      if (digits.length < 10 || digits.length > 15) continue;
      if (/^(19|20)\d{2}$/.test(digits)) continue;
      if (/^(\d)\1{6,}$/.test(digits)) continue;
      if (/^0+$/.test(digits)) continue;
      
      const digitVariety = new Set(digits).size;
      if (digitVariety < 3) continue;
      
      const phone = normalizePhone(candidate);
      // High confidence for validated phone
      return { value: phone, confidence: 0.9 };
    }
  }
  
  return { value: "", confidence: 0.0 };
}

/**
 * Extract LinkedIn with confidence scoring
 */
function extractLinkedInWithConfidence(headerZone: string): ExtractionResult {
  if (!headerZone) return { value: "", confidence: 0.0 };
  
  const linkedinPatterns = [
    /https?:\/\/[^\s]*linkedin\.com\/in\/[^\s)]+/i,
    /https?:\/\/[^\s]*linkedin\.com\/profile\/[^\s)]+/i,
    /\b(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9._%-]{3,60}/i,
    /linkedin\.com\/in\/([A-Za-z0-9._%-]{3,60})/i,
  ];
  
  for (const pattern of linkedinPatterns) {
    const match = headerZone.match(pattern);
    if (match) {
      let linkedin = "";
      if (match[0].startsWith('http')) {
        linkedin = match[0];
      } else if (match[1]) {
        linkedin = `https://linkedin.com/in/${match[1]}`;
      } else {
        linkedin = `https://${match[0]}`;
      }
      
      if (linkedin && !/^https?:\/\//i.test(linkedin)) {
        linkedin = `https://${linkedin.replace(/^www\./i, "")}`;
      }
      
      return { value: linkedin, confidence: 0.85 };
    }
  }
  
  // Try extracting handle from text like "LinkedIn: username"
  const handle = headerZone.match(/linkedin\s*[:\-]?\s*(?:profile|url)?\s*[:\-]?\s*@?([A-Za-z0-9._-]{3,60})/i)?.[1];
  if (handle && !handle.includes('@') && !handle.includes('http')) {
    return { value: `https://linkedin.com/in/${handle}`, confidence: 0.7 };
  }
  
  return { value: "", confidence: 0.0 };
}

/**
 * STAGE 3: Header-First Entity Extraction (Main Function)
 */
function extractEntitiesFromHeader(text: string): EntityExtraction {
  const zones = segmentResume(text);
  
  return {
    name: extractNameWithConfidence(zones.headerZone, zones.headerLines),
    email: extractEmailWithConfidence(zones.headerZone),
    phone: extractPhoneWithConfidence(zones.headerZone),
    linkedin: extractLinkedInWithConfidence(zones.headerZone),
  };
}

/**
 * STAGE 4: Confidence Gating
 * Accept fields only if confidence >= threshold
 * Lowered from 0.5 to 0.3 to be more lenient for name extraction
 */
const CONFIDENCE_THRESHOLD = 0.3;

function applyConfidenceGating(extraction: EntityExtraction): { email: string; phone: string; linkedin: string; name: string } {
  return {
    name: extraction.name.confidence >= CONFIDENCE_THRESHOLD ? extraction.name.value : "",
    email: extraction.email.confidence >= CONFIDENCE_THRESHOLD ? extraction.email.value : "",
    phone: extraction.phone.confidence >= CONFIDENCE_THRESHOLD ? extraction.phone.value : "",
    linkedin: extraction.linkedin.confidence >= CONFIDENCE_THRESHOLD ? extraction.linkedin.value : "",
  };
}

/**
 * Public API: Extract contact info from text (FAANG-style pipeline)
 */
/**
 * Public API: Extract contact info from text (FAANG-style pipeline)
 */
export function extractContactInfoFromText(text: string) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:388',message:'extractContactInfoFromText entry',data:{textLength:text?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (!text || text.trim().length < 10) {
    return { email: "", phone: "", linkedin: "" };
  }
  
  const extraction = extractEntitiesFromHeader(text);
  const gated = applyConfidenceGating(extraction);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:397',message:'extractContactInfoFromText: extraction result',data:{email:gated.email,phone:gated.phone,linkedin:gated.linkedin,emailConfidence:extraction.email.confidence,phoneConfidence:extraction.phone.confidence},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return {
    email: gated.email,
    phone: gated.phone,
    linkedin: gated.linkedin,
  };
}
function normalizePhone(p?: string) {
  if (!p) return "";
  const digits = p.replace(/[^\d+]/g, "");
  if (/^\+?1?\d{10,11}$/.test(digits)) {
    const d = digits.replace(/^\+?1?/, "");
    return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  return p;
}
/**
 * Public API: Extract candidate name from text (FAANG-style pipeline)
 * Uses header-first extraction with confidence scoring
 */
export function extractCandidateNameFromText(text: string): string {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:419',message:'extractCandidateNameFromText entry',data:{textLength:text?.length || 0,textPreview:text?.substring(0,100) || ''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (!text || text.trim().length < 10) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:422',message:'extractCandidateNameFromText: text too short',data:{textLength:text?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return "Unknown Candidate";
  }
  
  // Use the FAANG-style pipeline
  const extraction = extractEntitiesFromHeader(text);
  const gated = applyConfidenceGating(extraction);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:428',message:'extractCandidateNameFromText: extraction result',data:{extractedName:gated.name,confidence:extraction.name.confidence,textLength:text.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // If name extraction succeeded, return it
  if (gated.name && gated.name.length > 0) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:432',message:'extractCandidateNameFromText: returning extracted name',data:{name:gated.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return gated.name;
  }
  
  // Fallback strategies (only if header extraction failed)
  const zones = segmentResume(text);
  
  // Fallback 1: Extract from LinkedIn URL in header
  const liMatch = zones.headerZone.match(/linkedin\.com\/in\/([A-Za-z0-9._-]{3,80})/i);
  const li = liMatch?.[1];
  if (li) {
    const titled = li.replace(/[_.-]+/g, " ").replace(/\d+/g, "").replace(/\b\w/g, c => c.toUpperCase()).trim();
    const words = titled.split(/\s+/).filter(w => w.length > 1);
    if (words.length >= 2 && words.length <= 4) {
      return words.join(" ");
    }
  }
  
  // Fallback 2: Extract from email local part in header
  const emailMatch = zones.headerZone.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  const email = emailMatch?.[0];
  if (email) {
    const local = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\d+/g, "").trim();
    const words = local.split(/\s+/).filter(w => w.length > 1);
    if (words.length >= 2 && words.length <= 4) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c4cd3831-a807-403e-b334-69b6f39b6aee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'aiUtils.ts:456',message:'extractCandidateNameFromText: returning Unknown Candidate',data:{textLength:text.length,fallbackAttempted:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return "Unknown Candidate";
}

export function extractNameFromFilename(filename: string): string {
  if (!filename) return "Unknown Candidate";
  const base = filename.replace(/\.[^.]+$/, "");
  const clean = base
    .replace(/resume|cv|curriculum|vitae|document/gi, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "Unknown Candidate";
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}
export function extractSkillsBasic(text: string): string[] {
  const dict = [
    "Python","Java","JavaScript","TypeScript","R","C++","C#",
    "HTML","CSS","React","Next.js","Angular","Vue",
    "Node.js","Express","Django","Flask","Spring",".NET",
    "SQL","MySQL","PostgreSQL","MongoDB",
    "Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch",
    "Tableau","Power BI","AWS","Azure","GCP","Docker","Kubernetes","YOLO","OpenCV",
  ];
  const found = new Set<string>();
  const textRaw = (text || "");
  for (const kw of dict) {
    if (containsToken(textRaw, kw)) found.add(kw);
  }
  return Array.from(found).slice(0, 20);
}
export function extractProgrammingLanguages(text: string): string[] {
  const langs = [
    "Python","JavaScript","TypeScript","Java","C++","C#","Go","Ruby","PHP","Swift","Kotlin","Rust","Scala","R"
  ];
  const out: string[] = [];
  const raw = text || "";
  for (const l of langs) {
    if (containsToken(raw, l)) out.push(l);
  }
  return out;
}
export function extractToolsAndFrameworks(text: string): string[] {
  const tools = [
    "React","Next.js","Angular","Vue","Node.js","Express","Django","Flask","Spring",".NET",
    "SQL","MySQL","PostgreSQL","MongoDB","Redis","Elasticsearch",
    "AWS","Azure","GCP","Docker","Kubernetes","Jenkins","GitHub Actions",
    "Tableau","Power BI","Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch",
    "Git","Webpack","Vite","Babel","Jest","Cypress","Selenium",
    "YOLO","OpenCV","Apache Spark","Hadoop","Kafka","RabbitMQ"
  ];
  const out: string[] = [];
  const raw = text || "";
  for (const tool of tools) {
    if (containsToken(raw, tool)) out.push(tool);
  }
  return out;
}
export function generateCandidateSummary({
  name,
  resumeText,
  jobText,
  similarity,
  contact,
  skills,
}: {
  name: string;
  resumeText: string;
  jobText: string;
  similarity: number;
  contact: { email?: string; phone?: string; linkedin?: string };
  skills: string[];
}) {
  const score = Math.round((similarity || 0) * 100);
  const nameSafe =
    name && name !== "Unknown Candidate"
      ? name
      : (contact.email?.split("@")[0] || "This candidate");
  const edu = extractEducationInfo(resumeText);
  const highlights = extractExperienceHighlights(resumeText);
  const jdKeywords = extractKeywords(jobText).slice(0, 6);
  const langs = extractProgrammingLanguages(resumeText);
  const tools = extractToolsAndFrameworks(resumeText);
  const level =
    score >= 85 ? "highly capable" :
    score >= 70 ? "strong" :
    score >= 55 ? "solid" :
    score >= 40 ? "developing" :
    "entry-level";
  let out = `${nameSafe} demonstrates a ${score}% similarity to the role and appears to be a ${level} fit. `;
  if (edu) out += `Education: ${edu}. `;
  const combinedSkills = Array.from(new Set([...(skills || []), ...langs, ...tools]));
  if (combinedSkills.length) out += `Key strengths include ${combinedSkills.slice(0, 8).join(", ")}. `;
  if (highlights.length) out += `Notable impact: ${highlights.slice(0, 2).join("; ")}. `;
  if (jdKeywords.length) out += `Good alignment on ${jdKeywords.slice(0, 4).join(", ")}. `;
  out += score >= 80
    ? `Recommended for immediate consideration and a technical interview.`
    : score >= 60
      ? `Recommended for further technical screening.`
      : `Consider with team context; additional screening advised.`;
  return out.trim();
}
function extractEducationInfo(text: string): string | null {
  const degree =
    text.match(/\b(Master|Bachelor|B\.?Tech|M\.?S\.?|B\.?S\.?|Ph\.?D\.?)\b/i)?.[0] || "";
  const field =
    text.match(/\b(Data Science|Computer Science|Information Systems|Electrical|Electronics|Analytics|AI|Machine Learning)\b/i)?.[0] || "";
  const school =
    text.match(/\b([A-Z][A-Za-z&.\s]+(?:University|College|Institute|School))\b/)?.[0] || "";
  const gpa = text.match(/\bGPA[:\s]*([0-9]\.\d{1,2})\b/i)?.[1] || "";
  const parts: string[] = [];
  if (degree) parts.push(degree);
  if (field) parts.push(`in ${field}`);
  if (school) parts.push(`from ${school}`);
  if (gpa) parts.push(`(GPA: ${gpa})`);
  return parts.length ? parts.join(" ") : null;
}
function extractExperienceHighlights(text: string): string[] {
  const out: string[] = [];
  const ctx = text.slice(0, 4000);
  const pats = [
    /(?:reduced|decreased|cut)\s+[^.]{0,80}?\b(\d{1,3}%)/gi,
    /(?:improved|increased|boosted|grew)\s+[^.]{0,80}?\b(\d{1,3}%)/gi,
    /(?:automated|optimized|streamlined)\s+[^.]{0,120}?\b(\d{1,3}%|\d+\+?)/gi,
    /(?:built|developed|led|designed|deployed)\s+[^.]{0,120}?/gi,
  ];
  for (const p of pats) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(ctx)) && out.length < 3) {
      const s = m[0].replace(/\s+/g, " ").trim();
      if (s.length > 15) out.push(s);
    }
    if (out.length >= 3) break;
  }
  return out;
}

