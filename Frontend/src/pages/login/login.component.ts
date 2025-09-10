import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4">
    <div class="card max-w-md w-full p-8">
      <h1 class="text-2xl font-bold text-brand-800 mb-6">Sign in</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input class="input mt-1" type="email" formControlName="email" placeholder="you@example.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input class="input mt-1" type="password" formControlName="password" placeholder="••••••••">
        </div>
        <button class="btn-primary" type="submit" [disabled]="loading()">Log in</button>
        <p class="text-sm text-red-600" *ngIf="error()">{{ error() }}</p>
      </form>

      <p class="text-xs text-gray-600 mt-4">
        Admin can create users on <a routerLink="/register" class="text-brand-700 underline">Register</a>.
      </p>
    </div>
  </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set(null);
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => { this.loading.set(false); this.router.navigateByUrl('/dashboard'); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.message || 'Login failed'); }
    });
  }
}
