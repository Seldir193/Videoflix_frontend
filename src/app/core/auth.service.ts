import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/* ---------- DTO-Typen ---------- */
export interface AuthTokens { access: string; refresh: string; }
export interface RegisterDTO  { email: string; password: string; re_password: string; }
export interface LoginDTO     { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Basis-URL → z. B. http://localhost:8000/api/auth */
  private base = environment.authUrl.replace(/\/$/, ''); // Trailing slash entfernen

  constructor(private http: HttpClient) {}

  /* --------------------------------------------------------------
   * Helper: Authorization-Header aus localStorage lesen
   * -------------------------------------------------------------- */
  private get authHeaders(): HttpHeaders {
    const token = this.accessToken;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /* ---------- Auth-API ---------- */
  /** Registrierung */
  register(dto: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${this.base}/users/`, dto);
  }

  /** Konto aktivieren */
  activate(uid: string, token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/activation/`, { uid, token });
  }

  /** Login → erhalte Access + Refresh */
  login(dto: LoginDTO): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/jwt/create/`, dto);
  }

  /** Access-Token erneuern */
  refresh(refresh: string): Observable<{ access: string }> {
    return this.http.post<{ access: string }>(`${this.base}/jwt/refresh/`, { refresh });
  }

  /** Aktuelles Benutzerprofil laden (optional) */
  me<T = any>(): Observable<T> {
    return this.http.get<T>(`${this.base}/users/me/`, { headers: this.authHeaders });
  }

  /* ---------- Token-Handling (Client-seitig) ---------- */
  saveTokens(tokens: AuthTokens) {
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  get accessToken(): string | null {
    return localStorage.getItem('access');
  }

  get refreshToken(): string | null {
    return localStorage.getItem('refresh');
  }

  /** Prüft simples Vorhandensein eines Access-Tokens. */
  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
}