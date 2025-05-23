import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthTokens { access: string; refresh: string; }
export interface RegisterDTO { email: string; password: string; re_password: string; }
export interface LoginDTO { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl.replace(/\/$/, '')}/auth`;

  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Registrierung
  register(dto: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${this.base}/users/`, dto);
  }

  // Aktivierung
  activate(uid: string, token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/users/activation/`, { uid, token });
  }

  // Login
  login(dto: LoginDTO): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/jwt/create/`, dto).pipe(
      map(tokens => {
        this.saveTokens(tokens);
        this.loggedInSubject.next(true);
        return tokens;
      })
    );
  }

  // Token-Refresh
  refresh(refresh: string): Observable<{ access: string }> {
    return this.http.post<{ access: string }>(`${this.base}/jwt/refresh/`, { refresh }).pipe(
      map(r => {
        this.saveTokens({ access: r.access, refresh });
        return r;
      })
    );
  }

  // User-Profil
  me<T = any>(): Observable<T> {
    return this.http.get<T>(`${this.base}/users/me/`);
  }

  // Token-Utilities
  private saveTokens(tokens: AuthTokens) {
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.loggedInSubject.next(false);
  }

  get accessToken(): string | null { return localStorage.getItem('access'); }
  get refreshToken(): string | null { return localStorage.getItem('refresh'); }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  // Passwort-Reset-Anfrage
  requestPasswordReset(email: string) {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCSRFToken()); 
    // Endpunkt geändert auf /users/reset_password/
    return this.http.post<void>(`${this.base}/users/reset_password/`, { email }, { headers, withCredentials: true });
  }

  // Passwort-Reset-Bestätigung
  confirmPasswordReset(dto: { uid: string; token: string; password: string; re_password: string }) {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCSRFToken()); 
    // Endpunkt geändert auf /users/reset_password_confirm/
    return this.http.post<void>(`${this.base}/users/reset_password_confirm/`, dto, { headers });
  }

  private getCSRFToken(): string {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/);
    return csrfToken ? csrfToken[1] : '';
  }
}
