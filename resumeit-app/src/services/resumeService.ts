export interface CandidateData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
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
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
      const data: UploadResponse = await response.json();
      return data.candidate;
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
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend connection test failed:', error);
      return false;
    }
  }
}
export const resumeService = new ResumeService();
