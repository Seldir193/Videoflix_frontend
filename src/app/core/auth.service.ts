import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
export interface AuthTokens {
  access: string;
  refresh: string;
}
export interface RegisterDTO {
  email: string;
  password: string;
  re_password: string;
}
export interface LoginDTO {
  email: string;
  password: string;
}
import { catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl.replace(/\/$/, '')}/auth`;

  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}
  register(dto: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${this.base}/users/`, dto);
  }

  activate(uid: string, token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/users/activation/`, {
      uid,
      token,
   });
  }


  login(dto: LoginDTO): Observable<AuthTokens> {
   
    return this.http.post<AuthTokens>(`${this.base}/jwt/create/`, dto).pipe(
      map((tokens) => {
        this.saveTokens(tokens);
        this.loggedInSubject.next(true);
        return tokens;
      }),
      catchError((error) => {
        console.error('Login failed', error);
        throw error;
      })
    );
  }

  refresh(refresh: string): Observable<{ access: string }> {
    return this.http
      .post<{ access: string }>(`${this.base}/jwt/refresh/`, { refresh })
      .pipe(
        map((r) => {
          this.saveTokens({ access: r.access, refresh });
          return r;
        }),
        catchError((error) => {
          console.error('Token refresh failed', error);
          throw error;
        })
      );
  }

  me<T = any>(): Observable<T> {
    return this.http.get<T>(`${this.base}/users/me/`);
  }

  private saveTokens(tokens: AuthTokens) {
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.loggedInSubject.next(false);
  }

  get accessToken(): string | null {
    return localStorage.getItem('access');
  }
  get refreshToken(): string | null {
    return localStorage.getItem('refresh');
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  requestPasswordReset(email: string) {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCSRFToken());
    return this.http.post<void>(
      `${this.base}/users/reset_password/`,
      { email },
      { headers, withCredentials: true }
    );
  }

  confirmPasswordReset(dto: {
    uid: string;
    token: string;
    new_password: string;
    re_new_password: string;
  }) {
    const headers = new HttpHeaders().set('X-CSRFToken', this.getCSRFToken());
    return this.http.post<void>(
      `${this.base}/users/reset_password_confirm/`,
      dto,
      { headers }
    );
  }

  private getCSRFToken(): string {
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/);
    return csrfToken ? csrfToken[1] : '';
  }
}
