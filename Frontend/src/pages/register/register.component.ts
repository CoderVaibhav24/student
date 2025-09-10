import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4">
    <div class="card max-w-2xl w-full p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-brand-800">Create User</h1>
        <a routerLink="/dashboard" class="text-sm text-brand-700 underline">Back</a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium">Name</label>
          <input class="input mt-1" formControlName="name">
        </div>
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input class="input mt-1" type="email" formControlName="email">
        </div>
        <div>
          <label class="block text-sm font-medium">Password</label>
          <input class="input mt-1" type="password" formControlName="password">
        </div>
        <div>
          <label class="block text-sm font-medium">Level</label>
          <select class="input mt-1" formControlName="level">
            <option [ngValue]="1">Admin (1)</option>
            <option [ngValue]="2">Teacher (2)</option>
            <option [ngValue]="3">Student (3)</option>
          </select>
        </div>

        <ng-container *ngIf="isStudent()">
          <div>
            <label class="block text-sm font-medium">Student Full Name</label>
            <input class="input mt-1" formControlName="full_name">
          </div>
          <div>
            <label class="block text-sm font-medium">Class</label>
            <input class="input mt-1" formControlName="class_name" placeholder="Grade 10">
          </div>
          <div>
            <label class="block text-sm font-medium">Section</label>
            <input class="input mt-1" formControlName="section_name" placeholder="A">
          </div>
          <div>
            <label class="block text-sm font-medium">Guardian</label>
            <input class="input mt-1" formControlName="guardian_name">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium">Phone</label>
            <input class="input mt-1" formControlName="phone">
          </div>
        </ng-container>

        <div class="md:col-span-2">
          <button class="btn-primary" type="submit" [disabled]="loading()">Create</button>
          <p class="text-sm text-green-700 mt-2" *ngIf="success()">{{ success() }}</p>
          <p class="text-sm text-red-600 mt-2" *ngIf="error()">{{ error() }}</p>
        </div>
      </form>
    </div>
  </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    level: 3 as 1|2|3,
    full_name: [''],
    class_name: [''],
    section_name: [''],
    guardian_name: [''],
    phone: ['']
  });

  isStudent = computed(() => this.form.value.level === 3);

  onSubmit() {
    if (this.form.invalid) { this.error.set('Please complete required fields'); return; }
    this.loading.set(true); this.error.set(null); this.success.set(null);

    const v = this.form.value;
    const payload: any = { name: v.name!, email: v.email!, password: v.password!, level: v.level! };
    if (v.level === 3) {
      payload.studentProfile = {
        full_name: v.full_name || v.name,
        class_name: v.class_name,
        section_name: v.section_name,
        guardian_name: v.guardian_name,
        phone: v.phone
      };
    }

    this.auth.register(payload).subscribe({
      next: () => { this.loading.set(false); this.success.set('User created'); this.form.reset({ level: 3 }); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.message || 'Failed (admin only)'); }
    });
  }
}
