import { Component, OnInit, inject, signal } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { VideoService } from '../../shared/video-service';
import { Video } from '../../shared/models/video.model';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  while (route.firstChild) route = route.firstChild;
  return route;
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
  bgSrc = signal<string | null>(null);
  hero = signal<Video | null>(null);
  isVideoGrid = signal(false);
  showHF = signal(true);

  get trailerSrc() {
    return this.hero()?.video_file ?? null;
  }
  get thumbSrc() {
    return this.hero()?.thumb ?? 'assets/img/start.jpg';
  }

  private vs = inject(VideoService);
  private rt = inject(Router);

  ngOnInit(): void {
    this.rt.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        const grid = url.includes('/videos');
        const dash = url === '/' || url.startsWith('/dashboard');
        const auth = url.startsWith('/auth');
        this.showHF.set(grid || dash || auth);
        this.isVideoGrid.set(grid);
        if (grid || dash) {
          if (!this.hero()) {
            this.vs
              .getTrailers()
              .subscribe((list) => this.hero.set(list.length ? list[0] : null));
          }
        } else {
          const active = deepest(this.rt.routerState.snapshot.root);
          const bgFile = active.data['background'] as string | undefined;

          this.bgSrc.set(
            bgFile ? `assets/img/${bgFile}` : 'assets/img/start.jpg'
          );
        }
      });
  }

  forcePlay(el: EventTarget | null): void {
    const v = el as HTMLVideoElement | null;
    if (!v) return;
    v.muted = true;
    if (v.paused) {
      v.play().catch(() => {
        console.info('Autoplay still blocked – fallback accepted');
      });
    }
  }
}
