
import { ApplicationConfig, APP_INITIALIZER,importProvidersFrom  } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  HTTP_INTERCEPTORS,
  HttpClient,
  withInterceptorsFromDi 
} from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/jwt.interceptor';
import { TokenRefreshInterceptor } from './core/token-refresh.interceptor';



/* ---------- i18n ---------- */
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const initLang = (translate: TranslateService) => () => {
  const lang = navigator.language.slice(0, 2).toLowerCase();
  translate.setDefaultLang('en');
  translate.use(lang === 'de' ? 'de' : 'en');
  document.documentElement.lang = translate.currentLang;
};

/* ---------- ApplicationConfig ---------- */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()   ),

    /* Angular Material Animations */
    provideAnimationsAsync(),

    /* ngx-translate (unverändert) */
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor,          multi: true },
{ provide: HTTP_INTERCEPTORS, useClass: TokenRefreshInterceptor, multi: true },

    /* Initiale Sprachwahl */
    {
      provide: APP_INITIALIZER,
      useFactory: initLang,
      deps: [TranslateService],
      multi: true,
    },
  ],
};




