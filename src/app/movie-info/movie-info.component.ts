import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VideoService, Video } from '../shared/video-service';
import { HeaderComponent } from '../core/header/header.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-movie-info',
  imports: [CommonModule,HeaderComponent, TranslateModule],
  templateUrl: './movie-info.component.html',
  styleUrls: ['./movie-info.component.scss'],
})
export class MovieInfoComponent {
  video?: Video;

  private vs = inject(VideoService);
  private ar = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = +this.ar.snapshot.paramMap.get('id')!;
    this.vs.detail(id).subscribe(v => (this.video = v));
  }

 
}
