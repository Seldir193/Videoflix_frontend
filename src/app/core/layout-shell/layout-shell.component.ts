











import { Component } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HeaderComponent }  from '../header/header.component';
import { FooterComponent }  from '../footer/footer.component';
import { CommonModule }     from '@angular/common';
import { filter }           from 'rxjs/operators';

@Component({
  selector   : 'app-layout-shell',
  standalone : true,
  imports    : [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './layout-shell.component.html',
  styleUrls  : ['./layout-shell.component.scss']
})
export class LayoutShellComponent {

  bgSrc       : string | undefined = 'assets/img/start.jpg';
  trailerSrc  : string | undefined = undefined;
  isVideoGrid : boolean            = false;   // steuert Header / Footer / Padding

  
 
  largePadding = false;



  constructor(router: Router, root: ActivatedRoute) {

    router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {

        /* ─ Tiefste aktivierte Route ermitteln ─ */
        let r = root.firstChild;
        while (r?.firstChild) r = r.firstChild;

        /* ─ Hintergrundbild (für alle Nicht-Video-Seiten) ─ */
        const bg = r?.snapshot.data['background'] as string | undefined;
        this.bgSrc = bg ? `assets/img/${bg}` : undefined;

        /* ─ Trailer nur, wenn in Route-Data vorhanden ─ */
        this.trailerSrc = r?.snapshot.data['trailer'] as string | undefined;

        /* ─ Flag für Bequemlichkeit ─ */
        this.isVideoGrid = !!this.trailerSrc;
      });
  }
}
