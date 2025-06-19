import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  SecurityContext,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import Plyr from 'plyr';
import { VideoService } from '../shared/video-service';
import { Video, PlyrSource } from '../shared/models/video.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  imports: [CommonModule],
})
export class WatchComponent implements AfterViewInit, OnDestroy {
  /* ------------------------------------------------------------------
   * Reactive State
   * ----------------------------------------------------------------*/
  videos: Video[] = [];
  video = signal<Video | null>(null);
  barVisible = true;
  askResume = false;

  /* ------------------------------------------------------------------
   * Internals
   * ----------------------------------------------------------------*/
  @ViewChild('plyr', { static: true })
  private playerEl!: ElementRef<HTMLVideoElement>;
  private plyr!: Plyr;

  private currentId = 0;
  private saveThrottle = 0;
  private resumePos = 0;
  private hideTimer?: ReturnType<typeof setTimeout>;

  /* ------------------------------------------------------------------
   * DI
   * ----------------------------------------------------------------*/
  constructor(
    private vs: VideoService,
    private rt: Router,
    private ar: ActivatedRoute,
    private san: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {}

  /* ------------------------------------------------------------------
   * Lifecycle Hooks
   * ----------------------------------------------------------------*/
  ngAfterViewInit(): void {
    this.playerEl.nativeElement.preload = 'auto';
    this.initPlyr();
    this.scheduleHide();

    // React on route param changes
    this.ar.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      if (!isNaN(id)) this.load(id);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.hideTimer);
    this.plyr?.destroy();
  }

  /* ------------------------------------------------------------------
   * UI Helpers
   * ----------------------------------------------------------------*/
  showBar(): void {
    if (!this.barVisible) {
      this.barVisible = true;
      this.cd.detectChanges();
    }
    this.scheduleHide();
  }

  scheduleHide(): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.barVisible = false;
      this.cd.detectChanges();
    }, 3000);
  }

  /* ------------------------------------------------------------------
   * Plyr Initialisation
   * ----------------------------------------------------------------*/
  private initPlyr(): void {
    this.plyr = new Plyr(this.playerEl.nativeElement, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      autoplay: false,
    });

    this.plyr.on('qualitychange', (e: any) => {
      const q = e.detail.quality;
      if (typeof q === 'number' && q > 0) this.toast(`Qualität: ${q}p`);
    });
  }

  /* ------------------------------------------------------------------
   * Data Loading & Preparation
   * ----------------------------------------------------------------*/
  private load(id: number): void {
    this.currentId = id;

    forkJoin({
      progress: this.vs.getProgress(id).pipe(catchError(() => of(null))),
      clip: this.vs.detail(id),
    }).subscribe(({ progress, clip }) => {
      this.resumePos = progress?.position ?? 0;
      this.prepareVideo(clip);
    });
  }

  private prepareVideo(clip: Video): void {
    this.video.set(clip);
    this.detachOldHandlers();
    // Register resume logic before setting the source to avoid missing events
    this.setResumeOrPlay();
    this.setPlyrSource(clip);
    this.attachSaveHandlers();
  }

  /* ------------------------------------------------------------------
   * Event Handler Management
   * ----------------------------------------------------------------*/
  private detachOldHandlers(): void {
    (this.plyr as any).off('timeupdate');
    (this.plyr as any).off('pause');
    (this.plyr as any).off('ended');
  }

  private attachSaveHandlers(): void {
    const timeSave = () => {
      const now = Date.now();
      if (now - this.saveThrottle < 5000) return; // 5‑s‑Throttle
      this.saveThrottle = now;
      postProgress();
    };

    const postProgress = () => {
      this.vs
        .saveProgress(this.currentId, this.plyr.currentTime, this.plyr.duration)
        .subscribe();
    };

    this.plyr.on('timeupdate', timeSave);
    this.plyr.on('pause', postProgress);
    this.plyr.on('ended', () =>
      this.vs.saveProgress(this.currentId, 0, 0).subscribe()
    );
  }

  /* ------------------------------------------------------------------
   * Resume Prompt Logic
   * ----------------------------------------------------------------*/
  private setResumeOrPlay(): void {
    let done = false;
    const attempt = () => {
      if (done) return;

      const duration = this.plyr.duration;
      if (!duration || isNaN(duration)) {
        // Metadaten zwar geladen, aber Plyr hat Duration noch nicht gesetzt → gleich nochmal prüfen
        setTimeout(attempt, 25);
        return;
      }

      done = true;
      const pos = this.resumePos;
      const nearEnd = pos > 3 && pos < duration - 5;

      if (pos > 0 && nearEnd) {
        this.plyr.currentTime = pos;
        // Flag ausserhalb des aktuellen CD-Zyklus setzen
        Promise.resolve().then(() => {
          this.askResume = true;
          this.cd.detectChanges();
        });
      } else {
        this.plyr.currentTime = pos;
        this.plyr.play()?.catch(() => {});
      }
    };

    // Normalfall: nach dem Source-Setzen
    this.plyr.once('loadedmetadata', attempt);

    // Cache-Fall: Event ist schon gefeuert → Video ready
    if (this.playerEl.nativeElement.readyState >= 1) attempt();
  }

  resume(fromLast: boolean): void {
    this.plyr.currentTime = fromLast ? this.resumePos : 0;
    this.askResume = false;
    this.plyr.play()?.catch(() => {});
  }

  /* ------------------------------------------------------------------
   * Navigation Actions
   * ----------------------------------------------------------------*/
  goPrev(): void {
    this.rt.navigate(['/dashboard/videos'], { replaceUrl: true });
  }

  goNext(): void {
    const id = this.video()?.id;
    if (id) this.rt.navigate(['/movie', id]);
  }

  /* ------------------------------------------------------------------
   * Plyr Source Helpers
   * ----------------------------------------------------------------*/
  private setPlyrSource(clip: Video): void {
    if (clip.sources?.length) {
      const variants = this.buildVariants(clip);
      (this.plyr as any).quality = {
        default: this.defaultSize(variants),
        options: variants.map((v) => v.size),
        forced: true,
      };
      this.plyr.source = { type: 'video', sources: variants } as any;
    } else if (clip.video_file_url) {
      this.plyr.source = {
        type: 'video',
        sources: [
          {
            src: this.safeUrl(clip.video_file_url),
            type: 'video/mp4',
            size: 0,
          },
        ],
      } as any;
    }
  }

  private buildVariants(clip: Video): PlyrSource[] {
    return clip
      .sources!.sort((a, b) => a.size - b.size)
      .map((v) => ({ ...v, src: this.safeUrl(v.src) }));
  }

  private defaultSize(v: PlyrSource[]) {
    return v.find((x) => x.size === 720)?.size ?? v[0].size;
  }

  private safeUrl(url: string) {
    return this.san.sanitize(
      SecurityContext.RESOURCE_URL,
      this.san.bypassSecurityTrustResourceUrl(url)
    )!;
  }

  /* ------------------------------------------------------------------
   * Toast Helper
   * ----------------------------------------------------------------*/
  private toast(msg: string): void {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText =
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%)' +
      ';background:#14c8ff;color:#000;padding:6px 12px;border-radius:4px;' +
      'font-size:14px;z-index:9999;opacity:0;transition:opacity .3s';
    document.body.appendChild(el);
    requestAnimationFrame(() => (el.style.opacity = '1'));
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }, 2000);
  }
}