// src/features/matching/utils/aiUtils.ts

// -------------------------------------
// Lightweight embeddings & similarity
// -------------------------------------
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

    // smear to neighbors
    [1, 2].forEach(off => {
      v[(pos + off) % EMBEDDING_SIZE] += weight * 0.25;
      v[(pos - off + EMBEDDING_SIZE) % EMBEDDING_SIZE] += weight * 0.25;
    });
  }

  // L2 normalize
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

// -------------------------------------
// Keyword helpers
// -------------------------------------
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

// -------------------------------------
// Safe token matching (handles C++ / C#)
// -------------------------------------
function REGEX_ESCAPE(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Treat tokens as separated by non [A-Za-z0-9_] characters (no \b). */
function containsToken(text: string, term: string): boolean {
  if (!text || !term) return false;
  const escaped = REGEX_ESCAPE(term);
  const re = new RegExp(`(^|[^A-Za-z0-9_])${escaped}([^A-Za-z0-9_]|$)`, "i");
  return re.test(text);
}

// -------------------------------------
// Contact info & name extraction
// -------------------------------------
export function extractContactInfoFromText(text: string) {
  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] || "";

  const rawPhone =
    text.match(/\+?\d?[\s.-]?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g)?.[0] ||
    text.match(/\+?\d[\d\s().-]{8,16}\d/g)?.[0] || "";
  const phone = normalizePhone(rawPhone);

  let linkedin =
    text.match(/https?:\/\/[^\s]*linkedin\.com\/[^\s)]+/i)?.[0] ||
    text.match(/\b(?:www\.)?linkedin\.com\/[^\s)]+/i)?.[0] ||
    "";

  if (!linkedin) {
    const squashed = text.replace(/\s+/g, "");
    const broken = squashed.match(/linkedin\.com\/in\/([A-Za-z0-9._%-]{3,60})/i);
    if (broken) linkedin = `https://linkedin.com/in/${broken[1]}`;
  }
  if (!linkedin) {
    const handle = text.match(/linkedin\s*[:\-]?\s*@?([A-Za-z0-9._-]{3,60})/i)?.[1];
    if (handle) linkedin = `https://linkedin.com/in/${handle}`;
  }
  if (linkedin && !/^https?:\/\//i.test(linkedin)) {
    linkedin = `https://${linkedin.replace(/^www\./i, "www.")}`;
  }

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

export function extractCandidateNameFromText(text: string): string {
  if (!text) return "Unknown Candidate";
  const head = text.slice(0, 700).replace(/\s+/g, " ").trim();

  const headStrip = head
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\+?\d[\d\s().-]{8,}/g, " ");

  const banned = /\b(RESUME|CURRICULUM|VITAE|CONTACT|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS)\b/i;

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

  const li = text.match(/linkedin\.com\/in\/([A-Za-z0-9._-]{3,80})/i)?.[1];
  if (li) {
    const titled = li.replace(/[_.-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
    if (titled.split(" ").length >= 2) return titled;
  }

  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0];
  if (email) {
    const local = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\d+/g, "").trim();
    if (local && local.split(" ").length >= 2) {
      return local.replace(/\b\w/g, c => c.toUpperCase());
    }
  }

  return "Unknown Candidate";
}

// Fallback: name from filename (exported for AIRecommendationForm)
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

// -------------------------------------
// Skills & Languages (safe matching)
// -------------------------------------
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

// -------------------------------------
// AI-style candidate summary
// -------------------------------------
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
  
  // Extract programming languages and tools/frameworks
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

// --- helpers for summary ---
// (no duplicate or out-of-order helpers below)
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
