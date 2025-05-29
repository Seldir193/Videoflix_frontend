import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { VideoService } from '../../shared/video-service';
import { Video } from '../../shared/models/video.model';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

function deepest(r: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  while (r.firstChild) r = r.firstChild;
  return r;
}

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SafeUrlPipe,
  ],
  templateUrl: './layout-shell.component.html',
  styleUrls: ['./layout-shell.component.scss'],
})
export class LayoutShellComponent implements OnInit {
  /* reactive state */
  bgSrc = signal<string | null>(null);
  hero = signal<Video | null>(null);
  isVideoGrid = signal(false);
  showHF = signal(true);

  /* video / sound */
  @ViewChild('heroVid') heroVid!: ElementRef<HTMLVideoElement>;
  muted = true;

  /* DI */
  private vs = inject(VideoService);
  private rt = inject(Router);

  /* getters */
  get trailerSrc() {
    return this.hero()?.video_file ?? null;
  }
  get thumbSrc() {
    return this.hero()?.thumb ?? 'assets/img/start.jpg';
  }

  /* ---------------- lifecycle ---------------- */
  ngOnInit(): void {
    this.registerRouterEvents();
  }

  /* ---------------- router handling ---------------- */
  private registerRouterEvents(): void {
    this.rt.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.onNavEnd(e as NavigationEnd));
  }

  private onNavEnd(e: NavigationEnd): void {
    const url = e.urlAfterRedirects;
    const grid = url.includes('/videos');
    const dash = url === '/' || url.startsWith('/dashboard');
    const auth = url.startsWith('/auth');

    this.showHF.set(grid || dash || auth);
    this.isVideoGrid.set(grid);

    grid ? this.loadHeroTrailer() : this.resetHeroAndBg();
  }

  /* ---------------- hero / bg ---------------- */
  private loadHeroTrailer(): void {
    this.muted = true;
    if (this.hero()) return;
    this.vs.getTrailers().subscribe((t) => this.hero.set(t[0] ?? null));
  }

  private resetHeroAndBg(): void {
    this.hero.set(null);
    const active = deepest(this.rt.routerState.snapshot.root);
    const bgFile = active.data['background'] as string | undefined;
    this.bgSrc.set(bgFile ? `assets/img/${bgFile}` : 'assets/img/start.jpg');
  }

  /* ---------------- mute toggle ---------------- */
  toggleMute(ev: Event): void {
    ev.stopPropagation();
    this.muted = !this.muted;

    const vid = this.heroVid?.nativeElement;
    if (vid) {
      vid.muted = this.muted;
      if (!this.muted) vid.play().catch(() => {});
    }
  }

  /* ---------------- autoplay helper ---------------- */
  forcePlay(el: EventTarget | null): void {
    const v = el as HTMLVideoElement | null;
    if (!v) return;

    v.muted = this.muted;
    v.play().catch(() => {});
  }
}
