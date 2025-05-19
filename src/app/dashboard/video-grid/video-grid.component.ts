// src/app/video-grid/video-grid.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  ChangeDetectorRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer }  from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { VideoService, Video } from '../../shared/video-service';
import { SafeUrlPipe }   from '../../shared/safe-url.pipe';

/* --------------------------------------------------------------
   Kategorien in gewünschter Sortierung
----------------------------------------------------------------*/
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
  // changeDetection: ChangeDetectionStrategy.OnPush,   // optional
})
export class VideoGridComponent implements OnInit, AfterViewInit {

  /* ------------------------------------------------------------
     ViewChildren – jede Thumbnail-Zeile
  ------------------------------------------------------------ */
  @ViewChildren('rowEl')
  private rows!: QueryList<ElementRef<HTMLElement>>;

  /* ------------------------------------------------------------
     Signale für Kategorien & Hero
  ------------------------------------------------------------ */
  groups = signal<Record<Cat, Video[]>>({
    'New on Videoflix': [],
    Documentary: [],
    Drama: [],
    Romance: [],
  });
  hero     = signal<Video | null>(null);
  autoplay = signal(false);

  readonly catOrder = CAT_ORDER;

  /* ------------------------------------------------------------
     Scroll-Schalter für jede Zeile
  ------------------------------------------------------------ */
  scrollState: { prev: boolean; next: boolean }[] = [];

  /* ------------------------------------------------------------
     DI – gemischter Stil: Constructor + inject()
  ------------------------------------------------------------ */
  constructor(private cdr: ChangeDetectorRef) {}

  private vs  = inject(VideoService);
  private rt  = inject(Router);
  private ar  = inject(ActivatedRoute);
  private san = inject(DomSanitizer);

  /* ============================================================
     Daten holen
  ============================================================ */
  ngOnInit(): void {
    this.autoplay.set(this.ar.snapshot.queryParamMap.get('autoplay') === 'true');

    this.vs.list().subscribe(list => {
      /* Videos nach Kategorie einsortieren */
      const g: Record<Cat, Video[]> = {
        'New on Videoflix': [],
        Documentary: [],
        Drama: [],
        Romance: [],
      };
      for (const v of list) {
        const cat = ((v as any).category as Cat) ?? 'New on Videoflix';
        (g[cat] ?? g['New on Videoflix']).push(v);
      }
      this.groups.set(g);

      /* Hero: jüngstes Video overall */
      const newest = list.reduce<Video | null>(
        (best, v) => (best === null || v.id > best.id ? v : best),
        null
      );
      this.hero.set(newest);

      /* Scroll-Buttons erst nach erstem Render ermitteln */
      setTimeout(() => this.initScrollStates());
    });
  }

  /* ============================================================
     ViewChildren initialisieren
  ============================================================ */
  ngAfterViewInit(): void {
    /* Jedes Mal, wenn sich die Rows verändern (z. B. Daten nachladen) */
    this.rows.changes.subscribe(() =>
      setTimeout(() => this.initScrollStates())
    );
  }

  /* ------------------------------------------------------------
     Scroll-Status pro Zeile berechnen
  ------------------------------------------------------------ */
  private initScrollStates(): void {
    this.scrollState = this.rows.toArray().map(row => {
      const el = row.nativeElement;
      const overflow = el.scrollWidth > el.clientWidth + 1;
      return { prev: false, next: overflow };  // Prev erst nach Scroll
    });
    this.cdr.detectChanges();
  }

  /* ------------------------------------------------------------
     Scroll-Event: Buttons zeigen / verstecken
  ------------------------------------------------------------ */
  onRowScroll(index: number, el: HTMLElement): void {
    const atStart = el.scrollLeft < 1;
    const atEnd   = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    this.scrollState[index] = {
      prev: !atStart,
      next: !atEnd,
    };
    this.cdr.detectChanges();
  }

  /* ------------------------------------------------------------
     Buttons klicken → weich scrollen
  ------------------------------------------------------------ */
  scroll(el: HTMLElement, dir: number, index: number): void {
    const step = el.clientWidth;                       // eine „Seite“
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
    setTimeout(() => this.onRowScroll(index, el), 350); // Status nachziehen
  }

  /* ------------------------------------------------------------
     Player öffnen
  ------------------------------------------------------------ */
  playVideo(v: Video) {
    this.rt.navigate(['/watch', v.id]);
  }
  playHero() {
    const h = this.hero();
    if (h) this.playVideo(h);
  }
}
