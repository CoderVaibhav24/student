import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, tap } from 'rxjs';

export type User = { id: number; name: string; email: string; level: 1|2|3 };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiUrl + '/auth';

  readonly user$ = new BehaviorSubject<User | null>(null);
  get user() { return this.user$.value; }
  get isLoggedIn() { return !!this.user; }

  me() {
    return this.http.get<{data:{user:User}}>(`${this.base}/me`).pipe(
      tap({ next: r => this.user$.next(r.data.user), error: () => this.user$.next(null) })
    );
  }

  login(email: string, password: string) {
    return this.http.post<{data:{user:User}}>(`${this.base}/login`, { email, password })
      .pipe(tap(r => this.user$.next(r.data.user)));
  }

  logout() {
    return this.http.post(`${this.base}/logout`, {}).pipe(tap(() => this.user$.next(null)));
  }

  // Admin-only (after bootstrap)
  register(payload: { name: string; email: string; password: string; level: 1|2|3; studentProfile?: any; }) {
    return this.http.post(`${this.base}/register`, payload);
  }
}
