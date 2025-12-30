/**
 * Authentication Service
 * API client for authentication endpoints (register, login, Google OAuth)
 */

import axios, { AxiosInstance } from 'axios';
import {
  RegisterRequest,
  LoginRequest,
  GoogleAuthRequest,
  AuthResponse,
  User,
} from '../types/auth';

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Axios instance for authentication API calls
 */
class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/auth`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Register new user with email and password
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/register', data);

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Registration failed. Please try again.'
      );
    }
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/login', data);

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Login failed. Please check your credentials.'
      );
    }
  }

  /**
   * Authenticate with Google OAuth
   */
  async googleAuth(data: GoogleAuthRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/google', data);

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Google authentication failed. Please try again.'
      );
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const userId = this.getUserIdFromToken();
      const response = await this.api.get<AuthResponse>(`/me?user_id=${userId}`);

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data.user;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch user profile.'
      );
    }
  }

  /**
   * Logout user (clear local storage)
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Decode JWT token (without verification - only for reading claims)
   */
  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Extract user_id from JWT token
   */
  private getUserIdFromToken(): string {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token found');

    const payload = this.decodeToken(token);
    return payload.user_id;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
