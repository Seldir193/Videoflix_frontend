/* src/app/core/jwt.interceptor.ts */
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Hängt – falls vorhanden – den Bearer-Token an **alle** Requests zum eigenen
 * Backend an. 3rd-Party-Calls (z. B. YouTube-Thumbnail) werden ignoriert.
 *
 * Den Token speichern / erneuern übernimmt der AuthService bzw. der
 * TokenRefreshInterceptor – dieser Interceptor ist read-only.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private auth    = inject(AuthService);
  private apiBase = environment.apiUrl.replace(/\/$/, '');   // ohne trailing /

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.accessToken;

    // Anhängen NUR, wenn:
    // 1. ein Token existiert und
    // 2. die Request-URL zu unserem API-Backend gehört
    if (token && req.url.startsWith(this.apiBase)) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(req);
  }
}
