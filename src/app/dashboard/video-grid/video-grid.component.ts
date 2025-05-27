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
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { VideoService } from '../../shared/video-service';
import { Video } from '../../shared/models/video.model';
import { SafeUrlPipe } from '../../shared/safe-url.pipe';

export const CAT_ORDER = [
  'New on Videoflix',
  'Documentary',
  'Drama',
  'Romance',
] as const;
type Cat = (typeof CAT_ORDER)[number];

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, SafeUrlPipe],
  templateUrl: './video-grid.component.html',
  styleUrls: ['./video-grid.component.scss'],
})
export class VideoGridComponent implements OnInit, AfterViewInit {
  @ViewChildren('rowEl') private rows!: QueryList<ElementRef<HTMLElement>>;

  groups = signal<Record<Cat, Video[]>>({
    'New on Videoflix': [],
    Documentary: [],
    Drama: [],
    Romance: [],
  });
  hero = signal<Video | null>(null);
  autoplay = signal(false);
  readonly catOrder = CAT_ORDER;
  scrollState: { prev: boolean; next: boolean }[] = [];

  private vs = inject(VideoService);
  private rt = inject(Router);
  private ar = inject(ActivatedRoute);
  private san = inject(DomSanitizer);
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setAutoplayFlag();
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
    this.hero.set(this.pickNewest(list));
    setTimeout(() => this.initScrollStates());
  }

  private buildGroups(list: Video[]): Record<Cat, Video[]> {
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
