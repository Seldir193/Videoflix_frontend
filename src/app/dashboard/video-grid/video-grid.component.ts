import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

interface Video {
  id: string;
  title: string;
  thumb: string;
  src: string;
}

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './video-grid.component.html',
  styleUrls: ['./video-grid.component.scss'],
})
export class VideoGridComponent implements OnInit {
  videos: Record<string, Video[]> = {
    'New on Videoflix': [
      {
        id: 'breakout',
        title: 'Breakout',
        thumb: 'assets/thumbs/pic.JPG',
        src: 'assets/trailer/video.MOV',
      },
      {
        id: 'night',
        title: 'Night Shift',
        thumb: 'assets/thumbs/nightshift.jpg',
        src: 'assets/trailer/video1.MOV',
      },
    ],
    Documentary: [
      {
        id: 'ocean',
        title: 'Planet Ocean',
        thumb: 'assets/thumbs/ocean.jpg',
        src: 'assets/trailer/ocean.mp4',
      },
    ],
    Drama: [
      {
        id: 'edge',
        title: 'Edge of Hope',
        thumb: 'assets/thumbs/edge.jpg',
        src: 'assets/trailer/edge.mp4',
      },
    ],
    Romance: [
      {
        id: 'love',
        title: 'Love & Letters',
        thumb: 'assets/thumbs/love.jpg',
        src: 'assets/trailer/love.mp4',
      },
    ],
  };

  categories = Object.keys(this.videos);
  heroSrc = this.videos[this.categories[0]][0].src;
  heroTitle = this.videos[this.categories[0]][0].title;
  autoplay = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.autoplay =
      this.route.snapshot.queryParamMap.get('autoplay') === 'true';
  }

  playFirst() {
    const first = this.videos[this.categories[0]][0];
    this.goToPlayer(first.id);
  }

  playVideo(v: Video) {
    this.goToPlayer(v.id);
  }

  private goToPlayer(id: string) {
    this.router.navigate(['/watch', id]);
  }
}
