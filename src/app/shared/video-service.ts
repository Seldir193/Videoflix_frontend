












import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/* ---------- Typen ---------- */
export interface Video {
  id: number;
  title: string;
  description?: string;
  url: string | null;
  video_file?: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  /** Basis‑URL für alle Video‑Endpunkte */
  private api = `${environment.apiUrl}/videos/`;

  constructor(private http: HttpClient) {}

  /* --------------------------------------------------------------
   * Helper: baut Authorization‑Header, falls Access‑Token vorhanden
   * -------------------------------------------------------------- */
  private get authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /* ---------- CRUD ---------- */
  private videos$ = this.http.get<Video[]>(this.api, { headers: this.authHeaders }).pipe(
    shareReplay(1),
    catchError(err => {
      console.error('API unreachable, using mock data', err);
      return of(this.mockVideos);
    }),
  );

  /** Alle Videos holen (gecacht) */
  list(): Observable<Video[]> {
    return this.videos$;
  }

  /** Ein einzelnes Video abrufen */
  detail(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.api}${id}/`, { headers: this.authHeaders });
  }

  /** Neues Video anlegen (JSON‑Body) */
  create(v: Partial<Video>): Observable<Video> {
    return this.http.post<Video>(this.api, v, { headers: this.authHeaders });
  }

  /** Datei‑Upload (multipart/form‑data) */
  upload(file: File): Observable<HttpEvent<Video>> {
    const fd = new FormData();
    fd.append('video_file', file, file.name);

    return this.http.post<Video>(this.api, fd, {
      headers: this.authHeaders,
      reportProgress: true,
      observe: 'events',
    });
  }

  /* ---------- Mock‑Daten (Fallback, wenn API offline) ---------- */
  private mockVideos: Video[] = [
    { id: 1, title: 'Breakout',      url: 'assets/trailer/video.MOV',  video_file: null, created_at: '2025-05-07T10:00:00Z' },
    { id: 2, title: 'Night Shift',   url: 'assets/trailer/video1.MOV', video_file: null, created_at: '2025-05-07T10:05:00Z' },
    { id: 3, title: 'Planet Ocean',  url: 'assets/trailer/ocean.mp4',  video_file: null, created_at: '2025-05-07T10:10:00Z' },
    { id: 4, title: 'Edge of Hope',  url: 'assets/trailer/edge.mp4',   video_file: null, created_at: '2025-05-07T10:15:00Z' },
    { id: 5, title: 'Love & Letters',url: 'assets/trailer/love.mp4',   video_file: null, created_at: '2025-05-07T10:20:00Z' },
  ];
}

