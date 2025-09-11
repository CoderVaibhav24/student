import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StudentsService, Student } from '../../core/students.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './student-detail.component.html'
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(StudentsService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  loading = signal(false);
  student = signal<Student | null>(null);
  comments = signal<Array<{ id:number; body:string; created_at:string; user_id:number }>>([]);

  canComment = computed(() => (this.auth.user?.level ?? 3) <= 2); // level 1 or 2
  isAdmin = computed(() => this.auth.user?.level === 1);

  editOpen = signal(false);
  form = this.fb.group({
    full_name: ['', [Validators.required]],
    class_name: [''],
    section_name: [''],
    email: [''],
    phone: [''],
    guardian_name: [''],
    status: ['active']
  });

  commentForm = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get(this.id).subscribe({
      next: (s: Student) => {
        this.student.set(s);
        this.form.reset({
          full_name: s.full_name,
          class_name: s.class_name ?? '',
          section_name: s.section_name ?? '',
          email: s.email ?? '',
          phone: s.phone ?? '',
          guardian_name: s.guardian_name ?? '',
          status: s.status ?? 'active'
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.api.listComments(this.id).subscribe({
      next: (list: any[]) => this.comments.set(list || []),
      error: () => this.comments.set([])
    });
  }

  save() {
    if (this.form.invalid) return;
    this.api.update(this.id, this.form.value as any).subscribe({
      next: () => { this.editOpen.set(false); this.load(); },
      error: (e) => alert(e?.error?.message || 'Update failed')
    });
  }

  addComment() {
    if (this.commentForm.invalid) return;
    this.api.addComment(this.id, this.commentForm.value.body!).subscribe({
      next: () => { this.commentForm.reset(); this.load(); },
      error: (e) => alert(e?.error?.message || 'Comment failed')
    });
  }
}
