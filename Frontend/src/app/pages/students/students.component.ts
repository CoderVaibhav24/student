import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { StudentsService, Student } from '../../core/students.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './students.component.html'
})
export class StudentsComponent implements OnInit {
  private api = inject(StudentsService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  // ui state
  loading = signal(false);
  items = signal<Student[]>([]);
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  q = signal('');

  isAdmin = computed(() => this.auth.user?.level === 1);

  // create/edit modal controls
  showForm = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    class_name: [''],
    section_name: [''],
    email: [''],
    phone: [''],
    guardian_name: [''],
    status: ['active']
  });

  ngOnInit() { this.fetch(); }

  fetch() {
    this.loading.set(true);
    this.api.list({ page: this.page(), limit: this.limit(), q: this.q() }).subscribe({
      next: (r: any) => {
        const data = (r.items ? r : { items: r, page: 1, limit: r?.length ?? 0, total: r?.length ?? 0 }) as any;
        this.items.set(data.items || []);
        this.total.set(data.total || (data.items?.length ?? 0));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ status: 'active' });
    this.showForm.set(true);
  }

  openEdit(stu: Student) {
    this.editingId.set(stu.id);
    this.form.reset({
      full_name: stu.full_name,
      class_name: stu.class_name ?? '',
      section_name: stu.section_name ?? '',
      email: stu.email ?? '',
      phone: stu.phone ?? '',
      guardian_name: stu.guardian_name ?? '',
      status: stu.status ?? 'active'
    });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value as any;
    const id = this.editingId();

    const req = id ? this.api.update(id, payload) : this.api.create(payload);
    req.subscribe({
      next: () => { this.showForm.set(false); this.fetch(); },
      error: (e) => alert(e?.error?.message || 'Save failed')
    });
  }

  delete(stu: Student) {
    if (!confirm(`Delete ${stu.full_name}?`)) return;
    this.api.remove(stu.id).subscribe({
      next: () => this.fetch(),
      error: (e) => alert(e?.error?.message || 'Delete failed')
    });
  }

  view(stu: Student) { this.router.navigate(['/students', stu.id]); }
}
