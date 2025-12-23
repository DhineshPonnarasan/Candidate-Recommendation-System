interface Candidate {
  id: string;
  name: string;
  similarity: number;
  skills: string[];
  experience: string[];
  summary: string;
  fileName: string;
  content: string;
}
interface MatchResult {
  candidateName: string;
  matchScore: number;
  keySkills: string[];
  experience: string;
  summary: string;
}
interface AnalysisSummary {
  total_candidates: number;
  average_score: number;
  strong_matches: number;
  top_candidate: string | null;
  processing_method: string;
  confidence: string;
}
interface SystemInfo {
  embedding_dimension: number;
  technical_keywords: number;
  analysis_version: string;
}
class APIService {
  private baseURL: string;
  private timeout: number = 30000;
  constructor() {
    this.baseURL = this.detectBackendURL();
  }
  private detectBackendURL(): string {
    if (typeof window !== 'undefined') {
      const envUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;
      if (envUrl) {
        console.log(`Using environment URL: ${envUrl}`);
        return envUrl;
      }
    }
    // Production-ready default: Backend always runs on port 8081
    return 'http://localhost:8081';
  }
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('resumeit_user');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.access_token || null;
      }
    } catch {}
    return null;
  }
  private setAuthToken(token: string) {
    localStorage.setItem('resumeit_user', JSON.stringify({ access_token: token }));
  }
  private async autoLogin() {
    let token = this.getAuthToken();
    if (!token) {
      console.log("No token found - logging in with default credentials");
      const username = process.env.REACT_APP_DEFAULT_USERNAME || "admin";
      const password = process.env.REACT_APP_DEFAULT_PASSWORD || "admin123";
      try {
        const res = await this.makeRequest("/api/users/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        }, false);
        console.log('Auto-login response:', res);
        if (res?.access_token) {
          this.setAuthToken(res.access_token);
          token = res.access_token;
          console.log("Auto-login successful");
        } else {
          console.error("Auto-login failed - no token returned");
        }
      } catch (err) {
        console.error("Auto-login error:", err);
      }
    }
    return token;
  }
  private async makeRequest(endpoint: string, options: RequestInit = {}, requireAuth: boolean = true): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (requireAuth) {
      const token = await this.autoLogin();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    const defaultOptions: RequestInit = {
      headers,
      mode: 'cors',
      credentials: 'same-origin',
      signal: options.signal ?? AbortSignal.timeout(this.timeout),
      ...options,
    };
    try {
      const response = await fetch(url, defaultOptions);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }
  async getMatching(jobDescription: string, candidates: Candidate[]): Promise<MatchResult[]> {
    try {
      const requestData = {
        job_description: jobDescription.trim(),
        candidates: candidates.map((c) => ({
          id: c.id,
          name: c.name,
          content: c.content,
          skills: c.skills || [],
          experience: c.experience || [],
          fileName: c.fileName,
        })),
      };
      const response = await this.makeRequest('/api/matching/quick-match', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });     
      const itemsRaw =
        response?.candidates ?? response?.results ?? response?.matches ??
        response?.data ?? (Array.isArray(response) ? response : null);
      if (!Array.isArray(itemsRaw)) {
        throw new Error('Invalid response format: expected an array of candidate results');
      }
      return itemsRaw.map((item: any, index: number) => ({
        candidateName: item.candidateName || item.name || `Candidate ${index + 1}`,
        matchScore: Math.round(item.matchScore ?? item.score ?? 0),
        keySkills: item.keySkills || [],
        experience: item.experience || 'No experience info',
        summary: item.summary || 'No summary available',
      }));
    } catch (error) {
      console.error('Matching analysis failed:', error);
      throw error;
    }
  }
  async login(username: string, password: string): Promise<any> {
    const response = await this.makeRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false);
    if (response?.access_token) {
      this.setAuthToken(response.access_token);
    }
    return response;
  }
  async register(userData: { username: string; email: string; password: string; first_name: string; last_name: string }): Promise<any> {
    const response = await this.makeRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
    return response;
  }
}
export const apiService = new APIService();
export { APIService };
export type { Candidate, MatchResult, AnalysisSummary, SystemInfo };