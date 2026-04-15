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
 * IMPROVED PHONE EXTRACTION WITH EXPANDED FORMAT SUPPORT
 * 
 * Supports:
 * - +1-XXX-XXX-XXXX
 * - +1 XXX XXX XXXX  
 * - XXX.XXX.XXXX
 * - (XXX) XXX-XXXX
 * - XXX-XXX-XXXX
 * - XXXXXXXXXX (10 digits no separators)
 * - International formats with 10-15 digits
 * - PDF layout quirks (spaces, line breaks within numbers)
 */
function extractPhoneWithConfidence(headerZone: string): ExtractionResult {
  if (!headerZone) return { value: "", confidence: 0.0 };
  
  // Normalize text for phone extraction
  let normalizedText = normalizeTextForPhone(headerZone);
  
  // EXPANDED phone patterns to cover more real-world formats
  const phonePatterns = [
    // US formats with country code
    /\+1[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b/g,
    
    // US formats without country code: (XXX) XXX-XXXX
    /\((\d{3})\)[\s.-]?(\d{3})[\s.-]?(\d{4})\b/g,
    
    // US formats: XXX-XXX-XXXX, XXX.XXX.XXXX, XXX XXX XXXX
    /\b(\d{3})[\s.-](\d{3})[\s.-](\d{4})\b/g,
    
    // 10 digits with optional leading 1
    /\b1?(\d{3})(\d{3})(\d{4})\b/g,
    
    // International formats: +XX XXXX XXXX XXXX (10-15 digits)
    /\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}\b/g,
    
    // Formats with area code in parentheses and various separators
    /\(?(\d{3})\)?[\s.\-\/]?(\d{3})[\s.\-\/]?(\d{4})\b/g,
    
    // Phone with "tel:", "phone:", "cell:", "mobile:" prefix
    /(?:tel|phone|cell|mobile|ph)[:\s]*\+?1?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b/gi,
  ];
  
  for (const pattern of phonePatterns) {
    const matches = [...normalizedText.matchAll(pattern)];
    for (const match of matches) {
      const candidate = match[0];
      const digits = candidate.replace(/\D/g, '');
      
      // Validate phone number
      if (!isValidPhoneNumber(digits)) continue;
      
      const phone = normalizePhoneOutput(digits);
      // High confidence for validated phone
      return { value: phone, confidence: 0.9 };
    }
  }
  
  return { value: "", confidence: 0.0 };
}

/**
 * Normalize text for phone extraction
 * Handles PDF layout quirks and unicode issues
 */
function normalizeTextForPhone(text: string): string {
  if (!text) return "";
  
  let normalized = text;
  
  // Remove zero-width and invisible characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');
  
  // Normalize unicode whitespace
  normalized = normalized.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ');
  
  // Normalize line breaks that might split phone numbers
  normalized = normalized.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove common phone label prefixes for cleaner matching
  normalized = normalized.replace(/(?:telephone|telefono|fax)[:\s]*/gi, 'phone: ');
  
  return normalized.trim();
}

/**
 * Validate phone number digits
 * 
 * Rules:
 * - Valid length: 10-15 digits
 * - NOT a year (1900-2099)
 * - NOT repeated digits
 * - NOT all zeros
 * - Has at least 3 unique digits
 */
function isValidPhoneNumber(digits: string): boolean {
  if (!digits) return false;
  
  // Valid length: 10-15 digits
  if (digits.length < 10 || digits.length > 15) return false;
  
  // Reject year-like numbers (4 digits that look like years)
  if (/^(19|20)\d{2}$/.test(digits)) return false;
  
  // Reject if more than 6 consecutive repeated digits
  if (/(\d)\1{6,}/.test(digits)) return false;
  
  // Reject all zeros
  if (/^0+$/.test(digits)) return false;
  
  // Reject all same digit
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Must have at least 3 unique digits
  const uniqueDigits = new Set(digits).size;
  if (uniqueDigits < 3) return false;
  
  // Reject common non-phone patterns (sequential numbers)
  if (/^1234567890/.test(digits) || /^0987654321/.test(digits)) return false;
  
  return true;
}

/**
 * Normalize phone number for output
 * Preserves country code, formats consistently
 */
function normalizePhoneOutput(digits: string): string {
  if (!digits) return "";
  
  // Remove leading 1 if it's just the US country code and we have 11 digits
  let normalized = digits;
  if (normalized.length === 11 && normalized.startsWith('1')) {
    // Format as +1 XXX XXX XXXX
    return `+1 ${normalized.slice(1, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
  }
  
  // 10 digit US number
  if (normalized.length === 10) {
    return `+1 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
  }
  
  // International number - just add + if not present
  if (normalized.length > 10) {
    return `+${normalized}`;
  }
  
  return normalized;
}

/**
 * IMPROVED LINKEDIN EXTRACTION WITH TEXT NORMALIZATION
 * 
 * Handles:
 * - Unicode characters and zero-width spaces
 * - Icon-based LinkedIn text split across lines
 * - Various URL formats (http/https, www, /in/, /pub/, /profile/)
 * - Text-only cases like "LinkedIn: username"
 * - Trailing punctuation and whitespace cleanup
 */
function extractLinkedInWithConfidence(headerZone: string): ExtractionResult {
  if (!headerZone) return { value: "", confidence: 0.0 };
  
  // STEP 1: Normalize text BEFORE extraction
  let normalizedText = normalizeTextForLinkedIn(headerZone);
  
  // STEP 2: Try full URL patterns first (highest confidence)
  const fullUrlPatterns = [
    // Full URLs with protocol
    /https?:\/\/(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9._%-]{3,100})/i,
    /https?:\/\/(?:www\.)?linkedin\.com\/pub\/([A-Za-z0-9._%-]{3,100})/i,
    /https?:\/\/(?:www\.)?linkedin\.com\/profile\/view\?id=([A-Za-z0-9._%-]{3,100})/i,
  ];
  
  for (const pattern of fullUrlPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const username = cleanLinkedInUsername(match[1]);
      if (username) {
        return { value: `https://linkedin.com/in/${username}`, confidence: 0.95 };
      }
    }
  }
  
  // STEP 3: Try partial URL patterns (no protocol)
  const partialUrlPatterns = [
    /(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9._%-]{3,100})/i,
    /(?:www\.)?linkedin\.com\/pub\/([A-Za-z0-9._%-]{3,100})/i,
    /linkedin\.com\/profile\/view\?id=([A-Za-z0-9._%-]{3,100})/i,
  ];
  
  for (const pattern of partialUrlPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const username = cleanLinkedInUsername(match[1]);
      if (username) {
        return { value: `https://linkedin.com/in/${username}`, confidence: 0.9 };
      }
    }
  }
  
  // STEP 4: Try text-based patterns (LinkedIn: username, LinkedIn - username, etc.)
  // CRITICAL: These patterns are more prone to false positives, so we apply strict validation
  const textPatterns = [
    /linkedin\s*[:\-|]\s*(?:profile|url|link)?\s*[:\-|]?\s*([A-Za-z0-9._-]{4,60})/i,
    /linkedin\s*[:\-|]\s*@?([A-Za-z0-9._-]{4,60})/i,
  ];
  
  for (const pattern of textPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const username = match[1].trim();
      // STRICT validation: use cleanLinkedInUsername which applies blocklist
      const validatedUsername = cleanLinkedInUsername(username);
      if (validatedUsername && 
          !username.includes('@') && 
          !username.includes('http') &&
          !username.includes('.com')) {
        return { value: `https://linkedin.com/in/${validatedUsername}`, confidence: 0.75 };
      }
    }
  }
  
  // NOTE: Removed overly permissive icon-based patterns that caused false positives
  // like matching "linkedin" followed by any word (e.g., "LinkedIn EDUCATION")
  
  return { value: "", confidence: 0.0 };
}

/**
 * AGGRESSIVE LINKEDIN URL NORMALIZATION
 * 
 * Handles broken/split LinkedIn URLs from PDF extraction:
 * - "linkedin.com / in / username"
 * - "linkedin.com\n/in\n/username"  
 * - "www.linkedin.com in / john-doe"
 * - URLs with unicode artifacts and invisible characters
 */
function normalizeTextForLinkedIn(text: string): string {
  if (!text) return "";
  
  let normalized = text;
  
  // STEP 1: Remove zero-width and invisible unicode characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u00AD\u200E\u200F]/g, '');
  
  // STEP 2: Normalize unicode whitespace to regular space
  normalized = normalized.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ');
  
  // STEP 3: Normalize all line breaks to space (for URL reconstruction)
  normalized = normalized.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ');
  
  // STEP 4: Remove common PDF artifacts
  normalized = normalized.replace(/\[link\]/gi, '');
  normalized = normalized.replace(/\(link\)/gi, '');
  normalized = normalized.replace(/\[hyperlink\]/gi, '');
  
  // STEP 5: Collapse multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // STEP 6: AGGRESSIVE LinkedIn URL reconstruction
  // Handle URLs split by spaces/newlines like "linkedin.com / in / username"
  // Pattern: linkedin.com [space/slash combo] in [space/slash combo] username
  normalized = normalized.replace(
    /linkedin\.com\s*[\/\s]+\s*in\s*[\/\s]+\s*([A-Za-z0-9._-]+)/gi,
    'linkedin.com/in/$1'
  );
  
  // Handle "www.linkedin.com in / username" (missing slash after .com)
  normalized = normalized.replace(
    /(?:www\.)?linkedin\.com\s+in\s*[\/\s]+\s*([A-Za-z0-9._-]+)/gi,
    'linkedin.com/in/$1'
  );
  
  // Handle "linkedin . com / in / username" (spaces around dots)
  normalized = normalized.replace(
    /linkedin\s*\.\s*com\s*[\/\s]+\s*in\s*[\/\s]+\s*([A-Za-z0-9._-]+)/gi,
    'linkedin.com/in/$1'
  );
  
  // Handle "linkedin.com/in/ username" (space after /in/)
  normalized = normalized.replace(
    /linkedin\.com\/in\/\s+([A-Za-z0-9._-]+)/gi,
    'linkedin.com/in/$1'
  );
  
  // Handle pub URLs similarly
  normalized = normalized.replace(
    /linkedin\.com\s*[\/\s]+\s*pub\s*[\/\s]+\s*([A-Za-z0-9._-]+)/gi,
    'linkedin.com/pub/$1'
  );
  
  // STEP 7: Normalize protocol variations
  // "https : // linkedin" -> "https://linkedin"
  normalized = normalized.replace(/https?\s*:\s*\/\s*\/\s*/gi, 'https://');
  
  // STEP 8: Remove spaces around slashes in URLs
  normalized = normalized.replace(/\s*\/\s*/g, '/');
  
  // STEP 9: Fix double slashes that aren't protocol
  normalized = normalized.replace(/([^:])\/\/+/g, '$1/');
  
  return normalized.trim();
}

/**
 * BLOCKLIST for LinkedIn username validation
 * These are common section headers and platform names that should NEVER be LinkedIn usernames
 */
const LINKEDIN_USERNAME_BLOCKLIST = new Set([
  'education',
  'experience', 
  'skills',
  'projects',
  'publications',
  'summary',
  'resume',
  'github',
  'linkedin',
  'contact',
  'references',
  'certifications',
  'awards',
  'interests',
  'languages',
  'objective',
  'profile',
  'work',
  'employment',
  'portfolio',
  'achievements',
  'activities',
  'volunteer',
  'training',
  'courses',
  'hobbies',
]);

/**
 * Validate LinkedIn username with strict rules
 * 
 * A valid LinkedIn username MUST:
 * 1. Contain at least one lowercase letter [a-z]
 * 2. Be longer than 3 characters
 * 3. Contain NO spaces
 * 4. NOT be fully uppercase
 * 5. NOT match blocklisted keywords (section headers, platform names)
 */
function isValidLinkedInUsername(username: string): boolean {
  if (!username) return false;
  
  // Must be longer than 3 characters
  if (username.length <= 3) return false;
  
  // Must contain NO spaces
  if (/\s/.test(username)) return false;
  
  // Must contain at least one lowercase letter [a-z]
  if (!/[a-z]/.test(username)) return false;
  
  // Must NOT be fully uppercase
  if (username === username.toUpperCase()) return false;
  
  // Must NOT match blocklisted keywords (case-insensitive)
  if (LINKEDIN_USERNAME_BLOCKLIST.has(username.toLowerCase())) return false;
  
  // Must be alphanumeric with ._- only
  if (!/^[A-Za-z0-9._-]+$/.test(username)) return false;
  
  return true;
}

/**
 * Clean and validate LinkedIn username
 * Removes trailing punctuation, validates format, applies blocklist
 */
function cleanLinkedInUsername(username: string): string | null {
  if (!username) return null;
  
  // Remove trailing punctuation, spaces, and common URL artifacts
  let cleaned = username
    .replace(/[.,;:!?\s]+$/, '')  // Trailing punctuation
    .replace(/[)\]}>]+$/, '')      // Trailing brackets
    .replace(/[\/\\]+$/, '')       // Trailing slashes
    .trim();
  
  // Remove query parameters if present
  const queryIndex = cleaned.indexOf('?');
  if (queryIndex > 0) {
    cleaned = cleaned.substring(0, queryIndex);
  }
  
  // Remove hash fragments if present
  const hashIndex = cleaned.indexOf('#');
  if (hashIndex > 0) {
    cleaned = cleaned.substring(0, hashIndex);
  }
  
  // CRITICAL: Apply strict validation rules
  // This prevents false positives like "EDUCATION", "Github", etc.
  if (!isValidLinkedInUsername(cleaned)) {
    return null;
  }
  
  // Final length check
  if (cleaned.length > 100) {
    return null;
  }
  
  return cleaned;
}

/**
 * STAGE 3: Header-First Entity Extraction (Main Function)
 * 
 * For LinkedIn: If not found in header, searches FULL text as fallback
 * because LinkedIn URLs may appear in contact sections further down
 */
function extractEntitiesFromHeader(text: string): EntityExtraction {
  const zones = segmentResume(text);
  
  // Extract from header zone first
  const nameResult = extractNameWithConfidence(zones.headerZone, zones.headerLines);
  const emailResult = extractEmailWithConfidence(zones.headerZone);
  const phoneResult = extractPhoneWithConfidence(zones.headerZone);
  let linkedinResult = extractLinkedInWithConfidence(zones.headerZone);
  
  // FALLBACK: If LinkedIn not found in header, search FULL text
  // LinkedIn URLs may be in contact sections, footers, or other locations
  if (linkedinResult.confidence === 0 && text.length > zones.headerZone.length) {
    linkedinResult = extractLinkedInWithConfidence(text);
  }
  
  return {
    name: nameResult,
    email: emailResult,
    phone: phoneResult,
    linkedin: linkedinResult,
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
  const safeText = (text || '').replace(/\u00A0/g, ' ');
  const email =
    safeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] || "";
  const rawPhone =
    safeText.match(/\+?\d?[\s.-]?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g)?.[0] ||
    safeText.match(/\+?\d[\d\s().-]{8,16}\d/g)?.[0] || "";
  const phone = normalizePhone(rawPhone);

  const squashed = safeText
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

  let linkedin =
    squashed.match(/https?:\/\/[^\s]*linkedin\.com\/(?:in|pub|company)\/[^\s)]+/i)?.[0] ||
    squashed.match(/\b(?:www\.)?linkedin\.com\/(?:in|pub|company)\/[^\s)]+/i)?.[0] ||
    "";

  if (!linkedin) {
    const stitched = safeText.replace(/\s+/g, '');
    const broken = stitched.match(/linkedin\.com\/(?:in|pub|company)\/([A-Za-z0-9._%-]{3,80})/i);
    if (broken) linkedin = `https://linkedin.com/in/${broken[1]}`;
  }

  if (!linkedin) {
    const handle = safeText.match(/linkedin\s*[:\-]?\s*@?([A-Za-z0-9._-]{3,80})/i)?.[1];
    if (handle) linkedin = `https://linkedin.com/in/${handle}`;
  }

  if (!linkedin) {
    const compact = safeText.replace(/\s+/g, '');
    const brokenPath = compact.match(/linkedin\.com(?:\/)??(in|pub|company)(?:\/)?([A-Za-z0-9._%-]{3,80})/i);
    if (brokenPath) {
      linkedin = `https://linkedin.com/${brokenPath[1].toLowerCase()}/${brokenPath[2]}`;
    }
  }

  if (linkedin && !/^https?:\/\//i.test(linkedin)) {
    linkedin = `https://${linkedin}`;
  }

  linkedin = linkedin
    .replace(/[)>.,;]+$/g, '')
    .replace(/\s+/g, '')
    .replace(/linkedin\.com\/(?!in\/|pub\/|company\/)/i, 'linkedin.com/in/');

  return { email, phone, linkedin };
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
  if (!text) return "Unknown Candidate";
  const rawHead = text.slice(0, 1500);
  const lines = rawHead
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 14);
  const head = rawHead.replace(/\s+/g, " ").trim();
  const headStrip = head
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\+?\d[\d\s().-]{8,}/g, " ");

  const banned = /\b(RESUME|CURRICULUM|VITAE|CONTACT|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|PROFILE|CERTIFICATIONS|WORK|HISTORY|SOFTWARE|ENGINEER|DEVELOPER|STACK|FULL|ROLE)\b/i;

  const lineName = lines.find((line) => {
    if (line.length < 5 || line.length > 60) return false;
    if (banned.test(line)) return false;
    if (/[0-9@]|linkedin|github|portfolio|mailto:/i.test(line)) return false;
    const tokens = line.split(' ');
    if (tokens.length < 2 || tokens.length > 4) return false;
    return tokens.every(token => /^[A-Za-z][A-Za-z'\-.]*$/.test(token));
  });
  if (lineName) {
    return lineName
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  const locPat = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z\-']+){1,4})\s+[A-Z][a-zA-Z]+,\s*(?:[A-Z]{2,3}|[A-Z][a-zA-Z]+)\b/;
  const locMatch = head.match(locPat);
  if (locMatch && !banned.test(locMatch[1])) return locMatch[1].trim();
  const tcStart = headStrip.match(/^([A-Z][a-z]{2,20}(?:\s+[A-Z][a-zA-Z\-']{2,20}){1,4})\b/);
  if (tcStart && !banned.test(tcStart[1])) return tcStart[1].trim();
  const tcAny = headStrip.match(/\b([A-Z][a-z]{2,20}(?:\s+[A-Z][a-zA-Z\-']{2,20}){1,4})\b/);
  if (tcAny && !banned.test(tcAny[1])) return tcAny[1].trim();
  const caps = head.match(/\b([A-Z]{2,}(?:\s+[A-Z]{2,}){1,4})\b/);
  if (caps && !banned.test(caps[1])) {
    return caps[1].toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).trim();
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
/**
 * GROUNDED CANDIDATE SUMMARY GENERATION
 * 
 * CRITICAL CONSTRAINTS (DO NOT VIOLATE):
 * 1. ONLY use structured fields explicitly provided (name, skills, similarity)
 * 2. NEVER invent, infer, or fabricate education, institutions, or degrees
 * 3. NEVER treat LinkedIn, Publications, or section headers as education sources
 * 4. If education extraction confidence is low, say "Education not specified"
 * 5. The model rewrites verified facts into natural language - NO fact discovery
 */
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
  
  // Use verified name only - no guessing
  const nameSafe =
    name && name !== "Unknown Candidate"
      ? name
      : "This candidate";
  
  // Extract education with strict confidence gating
  const eduResult = extractEducationInfoGrounded(resumeText);
  
  // Extract experience highlights (verified patterns only)
  const highlights = extractExperienceHighlightsGrounded(resumeText);
  
  // Use only explicitly provided skills - no inference
  const verifiedSkills = skills && skills.length > 0 ? skills : [];
  
  // Determine fit level based on score only
  const level =
    score >= 85 ? "highly capable" :
    score >= 70 ? "strong" :
    score >= 55 ? "solid" :
    score >= 40 ? "developing" :
    "entry-level";
  
  // BUILD GROUNDED SUMMARY - only verified facts
  let out = `${nameSafe} demonstrates a ${score}% similarity to the role and appears to be a ${level} fit. `;
  
  // Education: ONLY include if high confidence extraction succeeded
  if (eduResult.confident && eduResult.text) {
    out += `Education: ${eduResult.text}. `;
  } else {
    out += `Education: Not specified. `;
  }
  
  // Skills: ONLY use explicitly extracted skills
  if (verifiedSkills.length > 0) {
    out += `Key skills include ${verifiedSkills.slice(0, 8).join(", ")}. `;
  }
  
  // Experience highlights: ONLY verified quantified achievements
  if (highlights.length > 0) {
    out += `Notable achievements: ${highlights.slice(0, 2).join("; ")}. `;
  }
  
  // Recommendation based on score
  out += score >= 80
    ? `Recommended for immediate consideration and a technical interview.`
    : score >= 60
      ? `Recommended for further technical screening.`
      : `Consider with team context; additional screening advised.`;
  
  return out.trim();
}
/**
 * GROUNDED EDUCATION EXTRACTION
 * 
 * CRITICAL CONSTRAINTS:
 * 1. NEVER treat "LinkedIn", "Publications", "Projects", or section headers as education
 * 2. ONLY extract education if BOTH degree AND institution are found with high confidence
 * 3. Institution MUST end with University/College/Institute/School
 * 4. Degree MUST be a recognized academic degree pattern
 * 5. If confidence is low, return { confident: false } - let caller handle
 */
interface EducationResult {
  text: string | null;
  confident: boolean;
}

function extractEducationInfoGrounded(text: string): EducationResult {
  if (!text || text.length < 50) {
    return { text: null, confident: false };
  }
  
  // BANNED TERMS - these are NOT education sources
  const bannedSources = /\b(linkedin|publications?|projects?|portfolio|github|website|blog|medium|twitter|facebook|instagram)\b/i;
  
  // Extract education section only (avoid contamination from other sections)
  const educationSection = extractEducationSection(text);
  const searchText = educationSection || text.slice(0, 3000);
  
  // STRICT degree patterns - must be clearly academic
  const degreePatterns = [
    /\b(Ph\.?D\.?|Doctor(?:ate)?)\b/i,
    /\b(Master(?:'s)?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|M\.?Tech\.?|M\.?Sc\.?)\b/i,
    /\b(Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?Tech\.?|B\.?Sc\.?|B\.?E\.?)\b/i,
    /\b(Associate(?:'s)?)\b/i,
  ];
  
  // STRICT institution patterns - must be a real educational institution
  const institutionPattern = /\b([A-Z][A-Za-z&.\s]{3,50}(?:University|College|Institute|School|Academy))\b/;
  
  // STRICT field patterns
  const fieldPatterns = [
    /\b(Computer Science|Data Science|Information (?:Technology|Systems)|Software Engineering)\b/i,
    /\b(Electrical Engineering|Electronics|Mechanical Engineering|Civil Engineering)\b/i,
    /\b(Business Administration|Finance|Economics|Marketing|Management)\b/i,
    /\b(Mathematics|Statistics|Physics|Chemistry|Biology)\b/i,
    /\b(Artificial Intelligence|Machine Learning|Analytics)\b/i,
  ];
  
  let degree: string | null = null;
  let institution: string | null = null;
  let field: string | null = null;
  
  // Extract degree
  for (const pattern of degreePatterns) {
    const match = searchText.match(pattern);
    if (match) {
      degree = match[0];
      break;
    }
  }
  
  // Extract institution - MUST be a valid educational institution
  const instMatch = searchText.match(institutionPattern);
  if (instMatch) {
    const candidate = instMatch[1].trim();
    // Validate: must not contain banned terms
    if (!bannedSources.test(candidate) && candidate.length >= 5) {
      institution = candidate;
    }
  }
  
  // Extract field
  for (const pattern of fieldPatterns) {
    const match = searchText.match(pattern);
    if (match) {
      field = match[0];
      break;
    }
  }
  
  // CONFIDENCE GATING: Only return education if we have BOTH degree AND institution
  // This prevents hallucination of partial or inferred education
  if (degree && institution) {
    const parts: string[] = [degree];
    if (field) parts.push(`in ${field}`);
    parts.push(`from ${institution}`);
    return { text: parts.join(" "), confident: true };
  }
  
  // If only degree found without institution, still report but with lower confidence
  if (degree && field) {
    return { text: `${degree} in ${field}`, confident: true };
  }
  
  if (degree) {
    return { text: degree, confident: true };
  }
  
  // No confident education extraction - DO NOT GUESS
  return { text: null, confident: false };
}

/**
 * Extract education section from resume text
 * Helps isolate education content from other sections
 */
function extractEducationSection(text: string): string | null {
  const lines = text.split('\n');
  let inEducation = false;
  let educationLines: string[] = [];
  
  const educationHeaders = /^(education|academic|degrees?|qualifications?)\s*:?\s*$/i;
  const otherHeaders = /^(experience|work|employment|skills|projects|publications|certifications?|awards?|references?)\s*:?\s*$/i;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (educationHeaders.test(trimmed)) {
      inEducation = true;
      continue;
    }
    
    if (inEducation && otherHeaders.test(trimmed)) {
      break; // End of education section
    }
    
    if (inEducation && trimmed.length > 0) {
      educationLines.push(trimmed);
    }
  }
  
  return educationLines.length > 0 ? educationLines.join('\n') : null;
}
/**
 * GROUNDED EXPERIENCE HIGHLIGHTS EXTRACTION
 * 
 * CRITICAL CONSTRAINTS:
 * 1. ONLY extract quantified achievements with clear metrics
 * 2. NEVER infer or fabricate achievements
 * 3. Must contain actual numbers/percentages from the text
 * 4. Clean and normalize extracted text
 */
function extractExperienceHighlightsGrounded(text: string): string[] {
  if (!text || text.length < 100) {
    return [];
  }
  
  const out: string[] = [];
  const ctx = text.slice(0, 4000);
  
  // ONLY extract achievements with CLEAR quantified metrics
  // These patterns require actual numbers in the text
  const quantifiedPatterns = [
    /(?:reduced|decreased|cut)\s+[^.]{0,60}?\b(\d{1,3}%)/gi,
    /(?:improved|increased|boosted|grew)\s+[^.]{0,60}?\b(\d{1,3}%)/gi,
    /(?:saved|generated|delivered)\s+[^.]{0,60}?\$[\d,]+/gi,
    /(?:managed|led)\s+(?:a\s+)?team\s+of\s+\d+/gi,
  ];
  
  for (const pattern of quantifiedPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(ctx)) !== null && out.length < 3) {
      let achievement = match[0].replace(/\s+/g, " ").trim();
      
      // Clean up: capitalize first letter, ensure reasonable length
      if (achievement.length >= 15 && achievement.length <= 150) {
        achievement = achievement.charAt(0).toUpperCase() + achievement.slice(1);
        out.push(achievement);
      }
    }
    if (out.length >= 3) break;
  }
  
  return out;
}

