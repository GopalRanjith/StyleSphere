import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  // Auth State
  readonly currentUser = signal<{ email: string } | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    // Check localStorage for persisted session
    const savedUser = localStorage.getItem('stylesphere_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('stylesphere_user');
      }
    }
  }

  login(email: string, password: string): boolean {
    if (email === 'user@stylesphere.com' && password === 'password123') {
      const user = { email };
      this.currentUser.set(user);
      localStorage.setItem('stylesphere_user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('stylesphere_user');
    this.router.navigate(['/login']);
  }
}
