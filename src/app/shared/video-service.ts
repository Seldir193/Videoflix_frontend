import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { Video, VideoBackend } from './models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly api = environment.apiUrl.replace(/\/$/, '');
  private readonly videoApi = `${this.api}/videos/`;
  private readonly progressApi = `${this.api}/progress/`;
  private readonly staticRoot = environment.staticUrl;

  constructor(private http: HttpClient, private i18n: TranslateService) {}

  private langHeaders(): HttpHeaders {
    const lang = this.i18n.currentLang || 'en';
    return new HttpHeaders({ 'Accept-Language': lang });
  }

private abs = (rel?: string | null): string | null => {
  if (!rel) return null;                               
  if (/^https?:\/\//i.test(rel) || rel.startsWith('//')) {
    return rel;
  }
  const clean = rel.replace(/^\/+/, '');
  return `${this.staticRoot.replace(/\/$/, '')}/media/${clean}`;
};

  private mapVideo = (v: VideoBackend): Video => ({
    ...v,
    video_file_url: v.source_url
      ? this.abs(v.source_url)
      : this.abs(v.video_file),
    hero_frame_url: this.abs(v.hero_frame),
    sources: (v.source_variants ?? [])
      .sort((a, b) => b.height - a.height)
      .map((variant) => ({
        src: this.abs(variant.path)!,
        type: 'video/mp4',
        size: variant.height,
      })),
  });

  private trailers$ = this.http
    .get<VideoBackend[]>(`${this.api}/trailers/`, {
      headers: this.langHeaders(),
    })
    .pipe(
      map((arr) => arr.map(this.mapVideo)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  getTrailers(): Observable<Video[]> {
    return this.trailers$;
  }

  private readonly videos$ = this.http
    .get<VideoBackend[]>(this.videoApi, { headers: this.langHeaders() })
    .pipe(
      map((arr) => arr.map(this.mapVideo)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError((err) => {
        console.error('API unreachable, using mock data', err);
        return of(this.mockVideos);
      })
    );

  list(): Observable<Video[]> {
    return this.videos$;
  }

  detail(id: number): Observable<Video> {
    return this.http
      .get<VideoBackend>(`${this.videoApi}${id}/`, {
        headers: this.langHeaders(),
      })
      .pipe(map(this.mapVideo));
  }

  create(payload: Partial<Video>): Observable<Video> {
    return this.http
      .post<VideoBackend>(this.videoApi, payload, {
        headers: this.langHeaders(),
      })
      .pipe(map(this.mapVideo));
  }

  upload(file: File): Observable<HttpEvent<Video>> {
    const fd = new FormData();
    fd.append('video_file', file, file.name);
    return this.http.post<VideoBackend>(this.videoApi, fd, {
      reportProgress: true,
      observe: 'events',
      headers: this.langHeaders(),
    }) as unknown as Observable<HttpEvent<Video>>;
  }

  saveProgress(videoId: number, pos: number, dur: number): void {
    this.http
      .post(
        this.progressApi,
        { video: videoId, position: pos, duration: dur },
        { headers: this.langHeaders() }
      )
     .subscribe();
  }

  getProgress(videoId: number) {
    return this.http.get<{ id: number; position: number; duration: number }>(
      `${this.progressApi}?video=${videoId}`,
      { headers: this.langHeaders() }
    );
  }

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
