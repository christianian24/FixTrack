import { apiClient, ApiError, setToken, clearToken } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: 'REPORTER';
  user_type: 'STUDENT' | 'FACULTY';
  department?: string;
  phone?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface MeResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  user_type: string;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_online: boolean;
}

export const authApi = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    // FastAPI OAuth2 expects form data for token endpoint
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      }
    );
    if (!res.ok) {
      let detail: unknown = res.statusText;
      try {
        const payload = await res.json();
        detail = payload?.detail ?? payload;
      } catch {
        // Keep a generic status-based error when the response is not JSON.
      }
      throw new ApiError(res.status, detail);
    }
    const token: TokenResponse = await res.json();
    setToken(token.access_token);
    return token;
  },

  async register(data: RegisterRequest): Promise<TokenResponse> {
    const token = await apiClient.post<TokenResponse>('/auth/register', data);
    setToken(token.access_token);
    return token;
  },

  async loginDemo(userId: string): Promise<TokenResponse> {
    const token = await apiClient.post<TokenResponse>('/auth/demo-login', { user_id: userId });
    setToken(token.access_token);
    return token;
  },

  async me(): Promise<MeResponse> {
    return apiClient.get<MeResponse>('/auth/me');
  },

  logout(): void {
    clearToken();
  },
};
