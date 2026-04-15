// resumeit-app/src/services/apiService.ts (or resumeService.ts if that’s the file you use)

export interface CandidateData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  skills: string[];
  experience_years?: number;
  education?: string;
  location?: string;
  resume_text: string;
  file_path: string;
  extracted_info: {
    sections: Record<string, string>;
    skills_found: number;
    has_embedding: boolean;
    contact_info?: {
      name?: string;
      email?: string;
      phone?: string;
      linkedin?: string;
      location?: string;
    };
  };
}

export interface UploadResponse {
  message?: string;
  candidate?: CandidateData;
  // also allow flat responses from backend stubs
  resume_text?: string;
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  skills?: string[];
}

class ResumeService {
  // Prefer NEXT_PUBLIC_API_URL and fall back to NEXT_PUBLIC_API_BASE for compatibility.
  private baseURL = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    'http://localhost:8081'
  ).replace(/\/+$/, '');

  private async getAuthToken(): Promise<string | null> {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Could not get auth token:', error);
      return null;
    }
  }

  async uploadResume(
    file: File,
    additionalData?: { name?: string; email?: string; phone?: string }
  ): Promise<CandidateData> {
    const formData = new FormData();
    formData.append('resume', file);
    if (additionalData?.name) formData.append('name', additionalData.name);
    if (additionalData?.email) formData.append('email', additionalData.email);
    if (additionalData?.phone) formData.append('phone', additionalData.phone);

    const token = await this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${this.baseURL}/api/candidates/upload`;
    console.log('[uploadResume] POST', url, { file: file.name });

    const response = await fetch(url, { method: 'POST', headers, body: formData });

    const text = await response.text(); // for better debugging
    if (!response.ok) {
      // try to parse JSON error, else use status
      try {
        const err = JSON.parse(text);
        throw new Error(err.error || `Upload failed with status ${response.status}`);
      } catch {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    }

    // accept both {candidate:{...}} and flat responses
    const data: UploadResponse = JSON.parse(text || '{}');
    if (data.candidate) {
      const candidate = data.candidate;
      const contact = candidate.extracted_info?.contact_info || {};
      return {
        ...candidate,
        name: candidate.name || contact.name || file.name.replace(/\.[^.]+$/, '') || 'Unknown Candidate',
        email: candidate.email || contact.email || '',
        phone: candidate.phone || contact.phone || '',
        linkedin: candidate.linkedin || contact.linkedin || '',
        resume_text: candidate.resume_text || '',
        skills: candidate.skills || [],
      };
    }

    // build a CandidateData from a flat backend stub so the UI continues to work
    return {
      id: `cand_${Date.now()}`,
      name: data.name || file.name.replace(/\.[^.]+$/, '') || 'Unknown',
      email: data.email || '',
      phone: data.phone || '',
      linkedin: data.linkedin || '',
      skills: data.skills || [],
      experience_years: undefined,
      education: undefined,
      location: undefined,
      resume_text: data.resume_text || '',
      file_path: '',
      extracted_info: {
        sections: {},
        skills_found: (data.skills || []).length,
        has_embedding: false,
      },
    };
  }

  async uploadMultipleResumes(files: File[]): Promise<{ successful: CandidateData[]; failed: Array<{ filename: string; error: string }> }> {
    // Only enable this if your backend actually has a matching route.
    const formData = new FormData();
    files.forEach(f => formData.append('resumes', f));

    const token = await this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${this.baseURL}/api/candidates/bulk-upload`;
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const text = await res.text();

    if (!res.ok) {
      try {
        const err = JSON.parse(text);
        throw new Error(err.error || `Bulk upload failed with status ${res.status}`);
      } catch {
        throw new Error(`Bulk upload failed with status ${res.status}`);
      }
    }

    const data = JSON.parse(text || '{}');
    return {
      successful: (data.results || []) as CandidateData[],
      failed: data.failures || [],
    };
  }

  async testConnection(): Promise<boolean> {
    const url = `${this.baseURL}/api/health`;
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      return res.ok;
    } catch (e) {
      console.warn('Backend connection test failed:', e);
      return false;
    }
  }
}

export const resumeService = new ResumeService();
