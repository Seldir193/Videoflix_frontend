















import { map, Observable } from 'rxjs';




import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

/* ---------- DTO-Typen ---------- */
export interface AuthTokens { access: string; refresh: string; }
export interface RegisterDTO { email: string; password: string; re_password: string; }
export interface LoginDTO { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl.replace(/\/$/, '')}/auth`;

  // BehaviorSubject für Login-Status
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();  // Observable, das den Status verfolgt

  constructor(private http: HttpClient) {}

  /* ---------- Registrierung ---------------------------------------- */
  register(dto: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${this.base}/users/`, dto);
  }

  /* ---------- Aktivierung ------------------------------------------ */
  activate(uid: string, token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/activation/`, { uid, token });
  }

  /* ---------- Login / Tokens --------------------------------------- */
  login(dto: LoginDTO): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/jwt/create/`, dto).pipe(
      map(tokens => {
        this.saveTokens(tokens);
        this.loggedInSubject.next(true);  // Update Login-Status
        return tokens;
      })
    );
  }

  refresh(refresh: string): Observable<{ access: string }> {
    return this.http.post<{ access: string }>(`${this.base}/jwt/refresh/`, { refresh }).pipe(
      map(r => {
        this.saveTokens({ access: r.access, refresh });
        return r;
      })
    );
  }

  /* ---------- User-Profil ------------------------------------------ */
  me<T = any>(): Observable<T> {
    return this.http.get<T>(`${this.base}/users/me/`);
  }

  /* ---------- Token-Utilities -------------------------------------- */
  private saveTokens(tokens: AuthTokens) {
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.loggedInSubject.next(false);  // Setze Login-Status auf false
  }

  get accessToken(): string | null { return localStorage.getItem('access'); }
  get refreshToken(): string | null { return localStorage.getItem('refresh'); }

  /** Einfacher Login-Check (reicht für Guards/Routing) */
  isLoggedIn(): boolean {
    return !!this.accessToken;
  }


  /* auth.service.ts – neue Endpunkte */
  requestPasswordReset(email: string) {
    return this.http.post<void>(`${this.base}/password/reset/`, { email });
  }
  

confirmPasswordReset(dto: {
  uid: string; token: string; password: string; re_password: string;
}) {
  return this.http.post<void>(`${this.base}/password/reset/confirm/`, dto);
}


}
