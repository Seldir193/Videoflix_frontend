






import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRouteSnapshot} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { HeaderComponent }  from '../header/header.component';
import { FooterComponent }  from '../footer/footer.component';
import { VideoService, Video } from '../../shared/video-service';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  while (route.firstChild) route = route.firstChild;
  return route;
} 

@Component({
  selector   : 'app-layout-shell',
  standalone : true,
  imports    : [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SafeUrlPipe
  ],
  templateUrl: './layout-shell.component.html',
  styleUrls  : ['./layout-shell.component.scss']
})
export class LayoutShellComponent implements OnInit {

  /* -------------- Bild / Trailer ------------------ */
  /* Signal leer starten */
bgSrc = signal<string | null>(null);

  //bgSrc       = signal<string>('assets/img/start.jpg');     // Fallback-Bild
  hero        = signal<Video | null>(null);                 // liefert Trailer
  isVideoGrid = signal(false);                              // steuert Grid-Spezifika
  showHF      = signal(true);                               // Header/Footer anzeigen?

  /* -------------- Getter für Template -------------- */
  get trailerSrc() { return this.hero()?.video_file ?? null; }




  get thumbSrc()   { return this.hero()?.thumb      ?? 'assets/img/start.jpg'; }

 


  /* -------------- DI ------------------------------- */
  private vs = inject(VideoService);
  private rt = inject(Router);




  ngOnInit(): void {

    this.rt.events.pipe(filter(e => e instanceof NavigationEnd))
  .subscribe(e => {
    const url = (e as NavigationEnd).urlAfterRedirects;

    /* ---------------------------- */
    /*  Ersetz die bisherige Zeile  */
    /* ---------------------------- */
    // const grid = url.startsWith('/videos');
    const grid = url.includes('/videos');          // ① trifft auch /dashboard/videos

    const dash = url === '/' || url.startsWith('/dashboard');
    const auth = url.startsWith('/auth');

    this.showHF.set(grid || dash || auth);
    this.isVideoGrid.set(grid);

    /* Trailer nur im Grid laden ---------------- */
    if (grid) {
      if (!this.hero()) {
        this.vs.list().subscribe(list => this.hero.set(list[0] ?? null));
      }
    } else {
      this.hero.set(null);

      const active = deepest(this.rt.routerState.snapshot.root);
      const bgFile = active.data['background'] as string | undefined;

      this.bgSrc.set(bgFile ? `assets/img/${bgFile}` : 'assets/img/start.jpg');

      
      
    }
});


 
  }








  
  forcePlay(el: EventTarget | null): void {
    const v = el as HTMLVideoElement | null;
    if (!v) return;
  
    /* Attribut + Eigenschaft sicherstellen */
    v.muted = true;
  
    if (v.paused) {
      v.play().catch(() => {
        console.info('Autoplay still blocked – fallback accepted');
      });
    }
  }

  
  
  
}


