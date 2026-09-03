import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly activeSubTab = signal<'login' | 'register'>('login');

  // Login Form
  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  // Register Form
  readonly registerForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  readonly loginError = signal<string | null>(null);
  readonly registerError = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  setTab(tab: 'login' | 'register'): void {
    this.activeSubTab.set(tab);
    this.loginError.set(null);
    this.registerError.set(null);
  }

  async onLoginSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    const { email, password } = this.loginForm.getRawValue();

    try {
      const result = await this.authService.login(email, password);
      this.isLoading.set(false);

      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.loginError.set(result.error || 'Invalid email or password. Please check your credentials.');
      }
    } catch {
      this.isLoading.set(false);
      this.loginError.set('Authentication service error. Please try again.');
    }
  }

  async onRegisterSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.registerError.set(null);

    const { email, password, firstName, lastName } = this.registerForm.getRawValue();

    try {
      const result = await this.authService.register(email, password, firstName, lastName);
      this.isLoading.set(false);

      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.registerError.set(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      this.isLoading.set(false);
      this.registerError.set('Registration service error. Please try again.');
    }
  }
}
