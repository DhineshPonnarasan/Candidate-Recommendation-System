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
  };
}
export interface UploadResponse {
  message: string;
  candidate: CandidateData;
}
class ResumeService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.warn('Could not get auth token:', error);
      return null;
    }
  }
  async uploadResume(file: File, additionalData?: { name?: string; email?: string; phone?: string }): Promise<CandidateData> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (additionalData?.name) {
        formData.append('name', additionalData.name);
      }
      if (additionalData?.email) {
        formData.append('email', additionalData.email);
      }
      if (additionalData?.phone) {
        formData.append('phone', additionalData.phone);
      }
      const token = await this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${this.baseURL}/api/candidates/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.message || `Upload failed with status ${response.status}`;
        console.error(`[RESUME SERVICE] Backend upload failed:`, errorMsg, errorData);
        throw new Error(errorMsg);
      }
      
      const data: UploadResponse = await response.json();
      console.log(`[RESUME SERVICE] Backend response received:`, {
        hasCandidate: !!data.candidate,
        hasResumeText: !!(data.candidate?.resume_text || (data as any).resume_text),
        topLevelResumeText: !!(data as any).resume_text
      });
      
      // Backend now returns data at multiple levels for compatibility
      // Check candidate object first, then top-level fields
      const candidate = data.candidate || data;
      
      // Ensure resume_text is available (critical for similarity calculation)
      if (!candidate.resume_text && (data as any).resume_text) {
        candidate.resume_text = (data as any).resume_text;
      }
      
      // Also check top-level fields
      if (!candidate.resume_text && (data as any).resume_text) {
        candidate.resume_text = (data as any).resume_text;
      }
      
      // Ensure name, email, phone, linkedin are available
      if (!candidate.name && (data as any).name) {
        candidate.name = (data as any).name;
      }
      if (!candidate.email && (data as any).email) {
        candidate.email = (data as any).email;
      }
      if (!candidate.phone && (data as any).phone) {
        candidate.phone = (data as any).phone;
      }
      if (!candidate.linkedin && (data as any).linkedin) {
        candidate.linkedin = (data as any).linkedin;
      }
      
      return candidate;
    } catch (error) {
      console.error('Resume upload failed:', error);
      throw error;
    }
  }
  async uploadMultipleResumes(files: File[]): Promise<{ successful: CandidateData[]; failed: Array<{ filename: string; error: string }> }> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('resumes', file);
      });
      const token = await this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${this.baseURL}/api/candidates/bulk-upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Bulk upload failed with status ${response.status}`);
      }
      const data = await response.json();
      return {
        successful: data.results.map((result: any) => result),
        failed: data.failures || []
      };
    } catch (error) {
      console.error('Bulk resume upload failed:', error);
      throw error;
    }
  }
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const healthUrl = `${this.baseURL}/api/health`;
      console.log(`[ResumeService] Testing backend connection at: ${healthUrl}`);

      let response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      // If /api/health is not available or not OK, fall back to root URL
      if (!response.ok) {
        const fallbackUrl = `${this.baseURL}/`;
        console.warn(`[ResumeService] Health endpoint returned ${response.status}. Falling back to root URL: ${fallbackUrl}`);
        response = await fetch(fallbackUrl, {
          method: 'GET',
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[ResumeService] Backend connected at ${this.baseURL}`);
        return true;
      }

      console.warn(`[ResumeService] Backend unreachable at ${this.baseURL}. Last response status: ${response.status}`);
      return false;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`[ResumeService] Backend connection test timed out after 5 seconds for ${this.baseURL}`);
      } else {
        console.warn(`[ResumeService] Backend connection test failed for ${this.baseURL}:`, error);
      }
      return false;
    }
  }
}
export const resumeService = new ResumeService();
