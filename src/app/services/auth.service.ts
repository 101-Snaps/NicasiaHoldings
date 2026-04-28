import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'nh_token';
  private readonly USER_KEY  = 'nh_user';

  constructor(private http: HttpClient, private router: Router) {}

  // ── Token / user management ─────────────────────────────────────────

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isStaff(): boolean {
    const role = this.getRole();
    return role === 'STAFF' || role === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('selectedJob');
    this.router.navigate(['/login']);
  }

  // ── API calls ────────────────────────────────────────────────────────

  login(payload: { email: string; password: string; selectedRole: string }) {
   return this.http.post<any>(`${environment.apiUrl}/auth/login`, payload);
  }

  // FIX: Added register() here so signup.ts can use AuthService
  // as the single source of truth for all auth-related HTTP calls.
  register(payload: any) {
   return this.http.post<any>(`${environment.apiUrl}/auth/register`, payload); 
  }
}
