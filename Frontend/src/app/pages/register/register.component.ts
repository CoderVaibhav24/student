import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
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
