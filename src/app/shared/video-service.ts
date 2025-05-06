// src/app/shared/video.service.ts
import { Injectable } from '@angular/core';

export interface Video { id:string; title:string; src:string; }

@Injectable({ providedIn: 'root' })
export class VideoService {
  videos: Video[] = [
    { id:'breakout', title:'Breakout',    src:'assets/trailer/video.MOV' },
    { id:'night',    title:'Night Shift', src:'assets/trailer/video1.MOV' },
    { id:'ocean',    title:'Planet Ocean',src:'assets/trailer/ocean.mp4' },
    { id:'edge',     title:'Edge of Hope',src:'assets/trailer/edge.mp4'  },
    { id:'love',     title:'Love & Letters',src:'assets/trailer/love.mp4'}
  ];

  /** aktuelles, nächstes, vorheriges Video ermitteln */
  getVideo(id:string)              { return this.videos.find(v => v.id === id)!; }
  getNext(id:string)  : Video|null { const i=this.idx(id); return i< this.videos.length-1? this.videos[i+1]:null; }
  getPrev(id:string)  : Video|null { const i=this.idx(id); return i>0?                   this.videos[i-1]:null; }
  private idx(id:string){ return this.videos.findIndex(v=>v.id===id); }
}
