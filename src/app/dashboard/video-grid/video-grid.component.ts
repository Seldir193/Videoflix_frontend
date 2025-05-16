







import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { VideoService, Video } from '../../shared/video-service';
import { SafeUrlPipe }        from '../../shared/safe-url.pipe';

/* --------------------------------------------------------------
 * Kategorien in fester Reihenfolge
 *  – ergänze oder ändere die Strings nach Bedarf
 * -------------------------------------------------------------- */
export const CAT_ORDER = [
  'New on Videoflix',
  'Documentary',
  'Drama',
  'Romance',
] as const;

type Cat = (typeof CAT_ORDER)[number];

@Component({
  selector   : 'app-video-grid',
  standalone : true,
  imports    : [CommonModule, RouterModule, TranslateModule, SafeUrlPipe],
  templateUrl: './video-grid.component.html',
  styleUrls  : ['./video-grid.component.scss'],
})
export class VideoGridComponent implements OnInit {

  /* -------------------- State (Signals) -------------------- */
  /** Videos gruppiert nach vorgegebenen Kategorien            */
  groups = signal<Record<Cat, Video[]>>({
    'New on Videoflix': [],
    Documentary: [],
    Drama: [],
    Romance: [],
  });

  /** Hero-Clip – wird nur benutzt, wenn dein Template
   *   weiterhin einen Hero-Bereich rendert                   */
  hero = signal<Video | null>(null);

  /** Autoplay-Flag aus ?autoplay=true in der URL              */
  autoplay = signal(false);

  /** Reihenfolge für <ngFor> im Template                      */
  readonly catOrder = CAT_ORDER;

  /* ----------------------- DI ----------------------------- */
  private vs  = inject(VideoService);
  private rt  = inject(Router);
  private ar  = inject(ActivatedRoute);
  private san = inject(DomSanitizer);   // nur falls du SafeUrlPipe nutzt

  /* -------------------- Lifecycle ------------------------- */
  ngOnInit(): void {

    /* 1) Autoplay-Query lesen */
    this.autoplay.set(this.ar.snapshot.queryParamMap.get('autoplay') === 'true');

    /* 2) Videos vom Backend holen */
    this.vs.list().subscribe(list => {

      /* --- nach Kategorie einsortieren -------------------- */
      const g: Record<Cat, Video[]> = {
        'New on Videoflix': [],
        Documentary: [],
        Drama: [],
        Romance: [],
      };

      for (const v of list) {
        const cat = (v as any).category as Cat ?? 'New on Videoflix';
        (g[cat] ?? g['New on Videoflix']).push(v);
      }
      this.groups.set(g);

     



      /* --- Hero-Clip = erstes Video der 1. Kategorie ------- */
      const firstHero = CAT_ORDER.map(c => g[c][0]).find(Boolean) ?? null;
      this.hero.set(firstHero);



/* --- Hero-Clip = Video mit höchster ID (neueste) -------------- */
const newestHero =
  list.reduce<Video | null>((best, v) => (best === null || v.id > best.id) ? v : best, null);

this.hero.set(newestHero);




    });


   


  }

  /* ------------------ Navigation -------------------------- */
  playVideo(v: Video) {
    this.rt.navigate(['/watch', v.id]);
  }





/* ------------------ Navigation -------------------------- */
//playVideo(v: Video): void {
  /* URL objektiv erzeugen, damit Router-Konfiguration greift */
  //const url = this.rt.serializeUrl(
    //this.rt.createUrlTree(['/watch', v.id])
  //);

  /* Neuer Tab – 'noopener' verhindert Zugriff aufs Ursprungsfenster */
 // window.open(url, '_blank', 'noopener');
//}




  /** Falls dein Template einen Play-Knopf im Hero hat */
  playHero() {
    const h = this.hero();
    if (h) { this.playVideo(h); }
  }








}
