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
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { VideoService } from '../../shared/video-service';
import { Video } from '../../shared/models/video.model';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

export const CAT_KEYS = ['new', 'documentary', 'drama', 'romance'] as const;
type CatKey = (typeof CAT_KEYS)[number];

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, SafeUrlPipe],
  templateUrl: './video-grid.component.html',
  styleUrls: ['./video-grid.component.scss'],
})
export class VideoGridComponent implements OnInit, AfterViewInit {
  @ViewChildren('rowEl') private rows!: QueryList<ElementRef<HTMLElement>>;
 
  groups = signal<Record<CatKey, Video[]>>({
    new: [],
    documentary: [],
    drama: [],
    romance: [],
  });
  hero = signal<Video | null>(null);
  autoplay = signal(false);
  readonly catKeys = CAT_KEYS;
  scrollState: { prev: boolean; next: boolean }[] = [];

  private vs = inject(VideoService);
  private rt = inject(Router);
  private ar = inject(ActivatedRoute);
  private san = inject(DomSanitizer);
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setAutoplayFlag();
    this.vs
      .getTrailers()
      .subscribe((t) => this.hero.set(t.length ? t[0] : null));
    this.vs.list().subscribe((list) => this.processVideoList(list));
  }

  ngAfterViewInit(): void {
    this.rows.changes.subscribe(() =>
      setTimeout(() => this.initScrollStates())
    );
  }

  private setAutoplayFlag(): void {
    this.autoplay.set(
      this.ar.snapshot.queryParamMap.get('autoplay') === 'true'
    );
  }

  private processVideoList(list: Video[]): void {
    this.groups.set(this.buildGroups(list));
    setTimeout(() => this.initScrollStates());
  }

  private buildGroups(list: Video[]): Record<CatKey, Video[]> {
    const g: Record<CatKey, Video[]> = {
      new: [],
      documentary: [],
      drama: [],
      romance: [],
    };

    const map: Record<string, CatKey> = {
      'New on Videoflix': 'new',
      Documentary: 'documentary',
      Drama: 'drama',
      Romance: 'romance',
    };

    for (const v of list) {
      if ((v as any).is_trailer) continue;
      const key = map[(v as any).category] ?? 'new';
      g[key].push(v);
    }
    return g;
  }

  
  private pickNewest(list: Video[]): Video | null {
    return list.reduce<Video | null>(
      (best, v) => (!best || v.id > best.id ? v : best),
      null
    );
  }


  private initScrollStates(): void {
    this.scrollState = this.rows.toArray().map((row) => {
      const el = row.nativeElement;
      const overflow = el.scrollWidth > el.clientWidth + 1;
      return { prev: false, next: overflow };
    });
    this.cdr.detectChanges();
  }

  onRowScroll(i: number, el: HTMLElement): void {
    this.scrollState[i] = {
      prev: el.scrollLeft > 0,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    };
    this.cdr.detectChanges();
  }

  scroll(el: HTMLElement, dir: number, idx: number): void {
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
    setTimeout(() => this.onRowScroll(idx, el), 350);
  }

  playVideo(v: Video) {
    this.rt.navigate(['/watch', v.id]);
  }
  playHero() {
    const h = this.hero();
    if (h) this.playVideo(h);
  }
}
