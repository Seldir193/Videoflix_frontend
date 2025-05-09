

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
 * Interceptor, der bei allen Requests an das eigene Backend automatisch den
 * JWT-Access-Token an den `Authorization`-Header anhängt.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // ab Angular 16+: Dependency-Injection per inject() statt Constructor-Args
  private auth = inject(AuthService);
  private apiBase = environment.apiUrl.replace(/\/$/, ''); // ohne trailing Slash

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.auth.accessToken;

    // Header nur setzen, wenn ein Token vorhanden ist **und** die Request-URL
    // zu unserem API-Backend gehört (vermeidet CORS/3rd-party Issues).
    if (token && req.url.startsWith(this.apiBase)) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(req);
  }
}