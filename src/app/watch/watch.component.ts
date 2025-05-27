import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  signal,
  SecurityContext,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import Plyr from 'plyr';
import { VideoService } from '../shared/video-service';
import { Video,PlyrSource } from '../shared/models/video.model';

@Component({
  standalone: true,
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  imports: [CommonModule],
})
export class WatchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('plyr', { static: true })
  private playerEl!: ElementRef<HTMLVideoElement>;

  private plyr!: Plyr;
  private currentId = 0;
  private saveThrottle = 0;
  private resumePos = 0;

  video = signal<Video | null>(null);
  barVisible = true;
  askResume = false;

  private hideTimer?: ReturnType<typeof setTimeout>;
  private vs = inject(VideoService);
  private rt = inject(Router);
  private ar = inject(ActivatedRoute);
  private san = inject(DomSanitizer);
  private zone = inject(NgZone);

  ngAfterViewInit(): void {
    this.playerEl.nativeElement.preload = 'auto';
    this.initPlyr();
    this.scheduleHide();

    this.ar.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      if (!isNaN(id)) this.load(id);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.hideTimer);
    this.plyr?.destroy();
  }

  showBar(): void {
    if (!this.barVisible) this.zone.run(() => (this.barVisible = true));
    this.scheduleHide();
  }

  scheduleHide(): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(
      () => this.zone.run(() => (this.barVisible = false)),
      3000
    );
  }

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

  private load(id: number): void {
    this.currentId = id;
    this.fetchProgress(id);
    this.vs.detail(id).subscribe((clip) => this.prepareVideo(clip));
  }

  private fetchProgress(id: number): void {
    this.vs.getProgress(id).subscribe((r) => {
      const p = Array.isArray(r) ? r[0] : r;
      this.resumePos = p?.position ?? 0;
    });
  }

  private prepareVideo(clip: Video): void {
    this.video.set(clip);
    this.detachOldHandlers();
    this.setPlyrSource(clip);
    this.setResumeOrPlay();
    this.attachSaveHandlers();
  }

  private detachOldHandlers(): void {
    (this.plyr as any).off('timeupdate');
    (this.plyr as any).off('pause');
    (this.plyr as any).off('ended');
  }

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

  private setResumeOrPlay(): void {
    this.plyr.once('canplay', () => {
      const nearEnd =
        this.resumePos > 30 && this.resumePos < this.plyr.duration - 5;
      if (nearEnd) {
        this.plyr.pause();
        this.zone.run(() => (this.askResume = true));
      } else {
        this.plyr.play()?.catch(() => {});
      }
    });
  }

  private attachSaveHandlers(): void {
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
    this.plyr.on('pause', save);
    this.plyr.on('ended', () => this.vs.saveProgress(this.currentId, 0, 0));
  }

  resume(fromLast: boolean): void {
    this.plyr.currentTime = fromLast ? this.resumePos : 0;
    this.askResume = false;
    this.plyr.play()?.catch(() => {});
  }

  goPrev() {
    this.rt.navigate(['/dashboard/videos'], { replaceUrl: true });
  }
  goNext() {
    const id = this.video()?.id;
    if (id) this.rt.navigate(['/movie', id]);
  }

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
