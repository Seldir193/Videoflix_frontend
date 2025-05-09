// src/app/watch/watch.component.ts
import { Component, DestroyRef, signal ,inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService,Video } from '../shared/video-service';





@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watch.component.html',
  styleUrls : ['./watch.component.scss']
})
export class WatchComponent {

  /* --- State --- */
  video     = signal<Video & { safeUrl: SafeResourceUrl } | null>(null);
  nextVideo = signal<Video | null>(null);
  prevVideo = signal<Video | null>(null);

  playing = signal(true);
  muted   = signal(false);
  rotate  = signal(0);

  current  = signal(0);   // Sekunden
  duration = signal(0);

  speedOpt = [1, 1.5, 2];
  speedIdx = signal(0);

  /* --- DI --- */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vs  = inject(VideoService);
  private sani = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Bei Routenwechsel Daten neu holen
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(pm => this.load(+pm.get('id')!));
  }

  /* ---------- Daten laden ---------- */


  private load(id: number) {
    this.vs.detail(id).subscribe(v => {
      this.video.set({
        ...v,
        safeUrl: this.sani.bypassSecurityTrustResourceUrl(this.buildSrc(v))
      });
      this.prepareNav(id);
      this.playing.set(true);
      this.rotate.set(0);
    });
  }

  private buildSrc(v: Video): string {
    // 1) lokale Datei?
    if (v.video_file) {
      return 'http://127.0.0.1:8000' + v.video_file;   // Basis-URL anpassen!
    }
    // 2) Fallback auf externes Streaming-URL
    return v.url!;
  }
  

  /** Vor/Zurück-Info aus kompletter Liste ermitteln */
  private prepareNav(id: number) {
    this.vs.list().subscribe(videos => {
      const idx = videos.findIndex(v => v.id === id);
      this.prevVideo.set(idx > 0 ? videos[idx - 1] : null);
      this.nextVideo.set(idx < videos.length - 1 ? videos[idx + 1] : null);
    });
  }

  /* ---------- Player-Callbacks ---------- */
  initTime(v: HTMLVideoElement)   { this.duration.set(Math.floor(v.duration)); }
  updateTime(v: HTMLVideoElement) { this.current.set(Math.floor(v.currentTime)); }

  seek(e: Event, v: HTMLVideoElement) {
    const t = +(e.target as HTMLInputElement).value;
    v.currentTime = t;
    this.current.set(t);
  }

  togglePlay(v: HTMLVideoElement) {
    this.playing() ? v.pause() : v.play();
    this.playing.update(p => !p);
  }
  toggleMute(v: HTMLVideoElement) {
    const m = !v.muted;
    v.muted = m;
    this.muted.set(m);
  }
  rotLeft (v: HTMLVideoElement) { this.addRot(v, -90); }
  rotRight(v: HTMLVideoElement) { this.addRot(v,  90); }
  private addRot(v: HTMLVideoElement, deg: number) {
    this.rotate.update(r => r + deg);
    v.style.transform = `rotate(${this.rotate()}deg)`;
  }

  toggleSpeed(v: HTMLVideoElement) {
    this.speedIdx.update(i => (i + 1) % this.speedOpt.length);
    v.playbackRate = this.speedOpt[this.speedIdx()];
  }

  goFull(el: HTMLElement) {
    document.fullscreenElement ? document.exitFullscreen()
                               : el.requestFullscreen();
  }

  /* ---------- Navigation ---------- */
  goNext() { const n = this.nextVideo(); n && this.router.navigate(['/watch', n.id]); }
  goPrev() { const p = this.prevVideo(); p ? this.router.navigate(['/watch', p.id])
                                          : this.router.navigate(['/dashboard/videos']); }

  /* ---------- MM:SS-Formatter ---------- */
  toMMSS(total: number) {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = Math.floor(total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }













}
