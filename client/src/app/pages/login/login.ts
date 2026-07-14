import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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

  readonly loginError = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);

    const { email, password } = this.loginForm.getRawValue();

    // Simulate network latency
    setTimeout(() => {
      const success = this.authService.login(email, password);
      this.isLoading.set(false);

      if (success) {
        this.router.navigate(['/']);
      } else {
        this.loginError.set('Invalid email or password. Please use user@stylesphere.com / password123.');
      }
    }, 800);
  }

  fillCredentials(): void {
    this.loginForm.setValue({
      email: 'user@stylesphere.com',
      password: 'password123'
    });
  }
}
