import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';

export interface Student {
  id: number;
  full_name: string;
  dob?: string | null;
  gender?: 'M'|'F'|'O'|null;
  class_name?: string | null;
  section_name?: string | null;
  email?: string | null;
  phone?: string | null;
  guardian_name?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  enrollment_date?: string | null;
  status?: 'active'|'inactive'|'alumni';
  created_at?: string;
  updated_at?: string;
}

type ListResponse = { items: Student[]; page: number; limit: number; total: number };

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl + '/students';

  list(opts: { page?: number; limit?: number; q?: string } = {}) {
    let params = new HttpParams();
    if (opts.page)  params = params.set('page', String(opts.page));
    if (opts.limit) params = params.set('limit', String(opts.limit));
    if (opts.q)     params = params.set('q', opts.q);
    return this.http.get<any>(this.base, { params }).pipe(
      map(res => res?.data ?? res), // backend returns {data:{items,...}}
    );
  }

  get(id: number) {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(res => res?.data ?? res));
  }

  create(payload: Partial<Student>) {
    return this.http.post<any>(this.base, payload).pipe(map(res => res?.data ?? res));
  }

  update(id: number, payload: Partial<Student>) {
    return this.http.put<any>(`${this.base}/${id}`, payload).pipe(map(res => res?.data ?? res));
  }

  remove(id: number) {
    return this.http.delete<any>(`${this.base}/${id}`);
  }

  // Comments
  listComments(studentId: number) {
    return this.http.get<any>(`${this.base}/${studentId}/comments`).pipe(map(res => res?.data ?? res));
  }

  addComment(studentId: number, body: string) {
    return this.http.post<any>(`${this.base}/${studentId}/comments`, { body });
  }

  // Teacher: assign class mapping (admin does this)
  assignClass(teacherUserId: number, class_name: string, section_name: string) {
    const url = environment.apiUrl + `/teachers/${teacherUserId}/classes`;
    return this.http.post<any>(url, { class_name, section_name });
  }
}
