import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 p-6">
    <div class="max-w-5xl mx-auto">
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-brand-800">Student Portal</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-700">{{ auth.user?.name }} • level {{ auth.user?.level }}</span>
          <button class="btn-primary px-3 py-1" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold">Quick Actions</h2>
          <ul class="mt-3 space-y-2 text-brand-800">
            <li><a routerLink="/register" class="underline" *ngIf="auth.user?.level===1">Create User (Admin)</a></li>
            <li class="opacity-60">Students UI coming next</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  logout() { this.auth.logout().subscribe(() => location.href = '/login'); }
}
