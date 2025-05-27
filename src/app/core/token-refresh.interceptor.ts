import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import jwtDecode from 'jwt-decode';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface Jwt {
  exp: number;
}

@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);
  private apiBase = environment.apiUrl.replace(/\/$/, '');

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && this.auth.refreshToken) {
          return this.auth.refresh(this.auth.refreshToken).pipe(
            switchMap(() =>
              next.handle(
                req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${this.auth.accessToken}`,
                  },
                })
              )
            )
          );
        }
        return throwError(() => err);
      })
    );
  }
}
