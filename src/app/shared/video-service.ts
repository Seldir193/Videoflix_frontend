// src/app/shared/video-service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';

/* ------------------------------------------------------------------ */
/* Typdefinitionen                                                    */
/* ------------------------------------------------------------------ */
export interface PlyrSource {
  src : string;   // absolute URL (video/mp4)
  type: string;
  size: number;   // 1080, 720 …
}

export interface VideoBackend {
  id: number;
  title: string;
  description?: string;

  /* Original-Quelle */
  url: string | null;
  video_file?: string | null;

  /* Transkodierte Varianten */
  source_url?: string | null;
  source_variants?: { path: string; height: number }[];

  /* Bilder */
  hero_frame?: string | null;
  thumb?: string | null;

  /* Metadaten */
  created_at: string;
  genre?: string;
  release?: string;
  director?: string;
  license_type?: string;
  license_url?: string;
}

export interface Video extends Omit<VideoBackend, 'source_variants'> {
  video_file_url: string | null;     // absoluter 720-p- oder Original-Link
  hero_frame_url: string | null;
  sources: PlyrSource[];
}
/* ------------------------------------------------------------------ */
/* Service                                                            */
/* ------------------------------------------------------------------ */
@Injectable({ providedIn: 'root' })
export class VideoService {

  /* API-Endpunkte --------------------------------------------------- */
  private readonly videoApi    = `${environment.apiUrl}/videos/`;
  private readonly progressApi = `${environment.apiUrl}/progress/`;
  private readonly staticRoot  = environment.staticUrl;           // endet mit /

  constructor(
    private http: HttpClient,
    private i18n: TranslateService,
  ) {}

  /* JWT- und Language-Header --------------------------------------- */
  private get authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    const lang  = this.i18n.currentLang || 'en';
    let h       = new HttpHeaders({ 'Accept-Language': lang });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }

  /* MEDIA-URL absolut machen --------------------------------------- */
  private abs = (rel?: string | null): string | null =>
    rel ? `${this.staticRoot}media/${rel}` : null;

  /* Backend → Frontend-Mapping ------------------------------------- */
  private mapVideo = (v: VideoBackend): Video => ({
    ...v,
    video_file_url : v.source_url
      ? this.abs(v.source_url)         // erzeugtes 720 p
      : this.abs(v.video_file),        // Original-Upload
    hero_frame_url : this.abs(v.hero_frame),
    sources: (v.source_variants ?? [])
      .sort((a, b) => b.height - a.height)         // höchste Auflösung zuerst
      .map(variant => ({
        src : this.abs(variant.path)!,
        type: 'video/mp4',
        size: variant.height,
      })),
  });

  /* ---------- Videos – CRUD -------------------------------------- */
  private readonly videos$ = this.http
    .get<VideoBackend[]>(this.videoApi, { headers: this.authHeaders })
    .pipe(
      map(arr => arr.map(this.mapVideo)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(err => {
        console.error('API unreachable, using mock data', err);
        return of(this.mockVideos);
      }),
    );

  list(): Observable<Video[]> {
    return this.videos$;
  }

  detail(id: number): Observable<Video> {
    return this.http
      .get<VideoBackend>(`${this.videoApi}${id}/`, { headers: this.authHeaders })
      .pipe(map(this.mapVideo));
  }

  create(payload: Partial<Video>): Observable<Video> {
    return this.http
      .post<VideoBackend>(this.videoApi, payload, { headers: this.authHeaders })
      .pipe(map(this.mapVideo));
  }

  upload(file: File): Observable<HttpEvent<Video>> {
    const fd = new FormData();
    fd.append('video_file', file, file.name);
    return this.http.post<VideoBackend>(this.videoApi, fd, {
      headers: this.authHeaders,
      reportProgress: true,
      observe: 'events',
    }) as unknown as Observable<HttpEvent<Video>>;
  }

  /* ---------- Wiedergabe-Fortschritt ----------------------------- */
  saveProgress(videoId: number, pos: number, dur: number): void {
    this.http.post(
      this.progressApi,
      { video: videoId, position: pos, duration: dur },
      { headers: this.authHeaders },
    ).subscribe();
  }

  getProgress(videoId: number) {
    return this.http.get<{
      id: number; position: number; duration: number;
    }>(`${this.progressApi}?video=${videoId}`, { headers: this.authHeaders });
  }

  /* ---------- Mock-Fallback (DEV) -------------------------------- */
  private readonly mockVideos: Video[] = [
    {
      id: 1,
      title: 'Breakout',
      url: null,
      created_at: '2025-05-07T10:00:00Z',
      video_file_url: null,
      hero_frame_url: null,
      sources: [],
    },
  ];
}
