import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  private readonly apiUrl = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:7071/api'
      : '/api';

  // Auth State
  readonly currentUser = signal<User | null>(null);
  readonly token = signal<string | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('stylesphere_user');
      const savedToken = localStorage.getItem('stylesphere_token');
      if (savedUser) {
        try {
          this.currentUser.set(JSON.parse(savedUser));
          this.token.set(savedToken);
        } catch {
          localStorage.removeItem('stylesphere_user');
          localStorage.removeItem('stylesphere_token');
        }
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const user: User = data.user || { email };
        this.setSession(user, data.token);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Invalid email or password. Please check your credentials.' 
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: 'Unable to connect to authentication server. Please ensure the backend is running.' 
      };
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const user: User = data.user || { email, first_name: firstName, last_name: lastName };
        this.setSession(user, data.token);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Registration failed. Please try again.' 
        };
      }
    } catch {
      return { 
        success: false, 
        error: 'Unable to connect to registration server. Please try again later.' 
      };
    }
  }

  private setSession(user: User, token?: string): void {
    this.currentUser.set(user);
    if (token) this.token.set(token);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('stylesphere_user', JSON.stringify(user));
      if (token) localStorage.setItem('stylesphere_token', token);
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('stylesphere_user');
      localStorage.removeItem('stylesphere_token');
    }
    this.router.navigate(['/login']);
  }
}
