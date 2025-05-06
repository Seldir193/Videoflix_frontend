






import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Subscription }           from 'rxjs';
import { VideoService, Video }    from '../shared/video-service';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watch.component.html',
  styleUrls : ['./watch.component.scss']
})
export class WatchComponent implements OnInit, OnDestroy {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private loc    = inject(Location);
  private vids   = inject(VideoService);

  video!: Video;
  next!:  Video|null;
  prev!:  Video|null;
  playing = true;
  muted   = false;
  rotate  = 0;

  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(p => this.load(p.get('id')!));
  }
  ngOnDestroy() { this.sub.unsubscribe(); }

  load(id:string){
    this.video   = this.vids.getVideo(id);
    this.next    = this.vids.getNext(id);
    this.prev    = this.vids.getPrev(id);
    this.playing = true;
    this.rotate  = 0;
  }

  /* Controls */
  togglePlay(v:HTMLVideoElement){ this.playing ? v.pause() : v.play(); this.playing=!this.playing; }
  toggleMute(v:HTMLVideoElement){ v.muted=!v.muted; this.muted=v.muted; }
 // goFull(v:HTMLVideoElement){ v.requestFullscreen(); }
  rotLeft(v:HTMLVideoElement){ this.rotate-=90; v.style.transform=`rotate(${this.rotate}deg)`; }
  rotRight(v:HTMLVideoElement){ this.rotate+=90; v.style.transform=`rotate(${this.rotate}deg)`; }

  goNext(){ this.next ? this.router.navigate(['/watch', this.next.id]) : null; }
 // goPrev(){ this.prev ? this.router.navigate(['/watch', this.prev.id]) : this.loc.back(); }


/* watch.component.ts – nur diese Methode ändern */

goPrev() {
  if (this.prev) {                               // noch ein vorheriges Video?
    this.router.navigate(['/watch', this.prev.id]);
  } else {                                       // erster Trailer erreicht
    this.router.navigate(['/dashboard/videos']); // oder '/dashboard'
  }
}



  goFull(player: HTMLElement) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      player.requestFullscreen();
    }
  }
  








/* watch.component.ts – Ergänzungen */
current  = 0;   // Sekunden
duration = 0;

initTime(v: HTMLVideoElement) {          // (loadedmetadata)
  this.duration = Math.floor(v.duration);
}

updateTime(v: HTMLVideoElement) {        // (timeupdate)
  this.current = Math.floor(v.currentTime);
}

seek(evt: Event, v: HTMLVideoElement) {  // (input)
  const val = +(evt.target as HTMLInputElement).value;
  v.currentTime = val;
  this.current  = val;
}

/* Hilfsfunktion */
toMMSS(total: number): string {
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = Math.floor(total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

speed = 1;   // 1 ×, 1.5 ×, 2 ×

toggleSpeed(v: HTMLVideoElement) {
  this.speed = this.speed === 1   ? 1.5
            : this.speed === 1.5 ? 2
            : 1;
  v.playbackRate = this.speed;
}


}
