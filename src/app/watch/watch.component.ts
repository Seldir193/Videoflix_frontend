
// src/app/watch/watch.component.ts
import {
  Component, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, inject, signal, SecurityContext,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer }   from '@angular/platform-browser';
import Plyr               from 'plyr';

import { VideoService, Video, PlyrSource } from '../shared/video-service';

@Component({
  standalone : true,
  selector   : 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls  : ['./watch.component.scss'],
  imports    : [CommonModule],
})
export class WatchComponent implements AfterViewInit, OnDestroy {

  /* ---------------- Template Ref ----------------------- */
  @ViewChild('plyr', { static: true })
  private playerEl!: ElementRef<HTMLVideoElement>;

  /* ---------------- Player & State -------------------- */
  private plyr!: Plyr;
  private currentId   = 0;
  private saveThrottle = 0;
  private resumePos    = 0;

  video = signal<Video | null>(null);

  /* ---------------- DI -------------------------------- */
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);
  private vs        = inject(VideoService);
  private sanitizer = inject(DomSanitizer);

  /* ==================================================== */
  ngAfterViewInit(): void {
    /* ► preload nur Metadaten (Poster & Duration) */
    this.playerEl.nativeElement.preload = 'auto';
    this.initPlyr();

    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      if (!isNaN(id)) this.load(id);
    });
  }

  ngOnDestroy(): void {
    this.plyr?.destroy();
  }

  /* ---------------- Plyr ------------------------------ */
  private initPlyr(): void {
    this.plyr = new Plyr(this.playerEl.nativeElement, {
      controls: [
        'play', 'progress', 'current-time', 'duration',
        'mute', 'volume', 'settings', 'pip', 'fullscreen',
      ],
      settings: ['quality', 'speed'],
      speed   : { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      autoplay: false,
    });

    this.plyr.on('qualitychange', (e: any) => {
      const q = e.detail.plyr?.quality;
      if (typeof q === 'number' && q > 0) {
        this.toast(`Qualität: ${q}p`);
      }
    });
  }

  /* ---------------- Video laden ----------------------- */
  private load(id: number): void {
    this.currentId = id;
    this.resumePos = 0;

    /* Position + Dauer aus Backend holen */
    this.vs.getProgress(id).subscribe(p => this.resumePos = p?.position ?? 0);

    this.vs.detail(id).subscribe(clip => {
      this.video.set(clip);

      /* Events resetten */
      (this.plyr as any).off('timeupdate');
      (this.plyr as any).off('pause');
      (this.plyr as any).off('ended');

      /* ---------- Quellen zusammenbauen ---------- */
      if (clip.sources?.length) {
        const variants: PlyrSource[] = clip.sources
          .sort((a, b) => b.size - a.size)
          .map(v => ({
            ...v,
            src: this.sanitizer.sanitize(
              SecurityContext.RESOURCE_URL,
              this.sanitizer.bypassSecurityTrustResourceUrl(v.src),
            )!,
          }));

        const defaultSize = variants.find(v => v.size === 720)?.size
                         ?? variants[0].size;

        (this.plyr as any).quality = {
          default : defaultSize,
          options : variants.map(v => v.size),
          forced  : true,
        };

        this.plyr.source = { type: 'video', sources: variants } as any;
      } else if (clip.video_file_url) {
        const realUrl = this.sanitizer.sanitize(
          SecurityContext.RESOURCE_URL,
          this.sanitizer.bypassSecurityTrustResourceUrl(clip.video_file_url),
        )!;

        this.plyr.source = {
          type   : 'video',
          sources: [{ src: realUrl, type: 'video/mp4', size: 0 }],
        } as any;
      }

      /* ---------- Autoplay sobald genug gepuffert ---- */
      this.plyr.once('canplay', () => {
        if (
          this.resumePos > 30 &&
          this.resumePos < this.plyr.duration - 5 &&
          confirm('An letzter Stelle fortsetzen?')
        ) {
          this.plyr.currentTime = this.resumePos;
        }
        this.plyr.play()?.catch(() => {});   // ignoriert Autoplay-Block
      });

      /* ---------- Fortschritt sichern --------------- */
      const save = () => {
        const now = Date.now();
        if (now - this.saveThrottle < 5000) return;
        this.saveThrottle = now;

        const pos = this.plyr.currentTime;
        const dur = this.plyr.duration;
        if (dur > 60 && pos > 0 && pos < dur - 5)
          this.vs.saveProgress(this.currentId, pos, dur);
      };
      this.plyr.on('timeupdate', save);
      this.plyr.on('pause',      save);
      this.plyr.on('ended',      () => this.vs.saveProgress(id, 0, 0));
    });
  }

  /* ---------------- Navigation ------------------------ */
  goPrev() { this.router.navigate(['/dashboard/videos'], { replaceUrl: true }); }
  goNext() { const id = this.video()?.id; if (id) this.router.navigate(['/movie', id]); }

  /* ---------------- Mini-Toast ------------------------ */
  private toast(msg: string): void {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText =
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
      'background:#14c8ff;color:#000;padding:6px 12px;border-radius:4px;' +
      'font-size:14px;z-index:9999;opacity:0;transition:opacity .3s';
    document.body.appendChild(el);
    requestAnimationFrame(() => (el.style.opacity = '1'));
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 2000);
  }
}














