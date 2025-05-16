// header.component.ts
import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  onLoginPage = false;
  isVideoPage = false;
  isMovieInfo = false;

  constructor(
    private location: Location,
    private router: Router,
    private auth: AuthService,

  ) 

  {
    /* 1) Direkt beim Erzeugen aus aktuellem Pfad ableiten */
    this.updateFlags(this.router.url);

    /* 2) Bei jeder NavigationEnd erneut setzen */
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateFlags(e.urlAfterRedirects));
  }

  /* ---------- URL → Flags ------------------------------------- */
  private updateFlags(url: string): void {
    this.onLoginPage = url.startsWith('/auth/login');

    /* Player = Grid + Watch */
    this.isVideoPage =
      url.startsWith('/dashboard/videos') || url.startsWith('/watch/');

    /* Info-Seite erkennt jede URL, die '/movie/' enthält */
    this.isMovieInfo = url.includes('/movie/');
  }


 
  goBack(): void {
    if (this.isVideoPage) {
      this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
  
    } else if (this.isMovieInfo) {
      this.goBackToGrid();                       // direkt zum Grid
  
    } else if (this.onLoginPage) {
      window.history.back();                     // Login → raus aus App
  
    } else {
      this.location.back();                      // Standard-Back
    }
  }


  /**──────────────────────────────────────────────
   * 2)   Login-Button (kein neuer History-Eintrag)
   *──────────────────────────────────────────────*/
  openLogin(): void {
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  /**──────────────────────────────────────────────
   * 3)   Logout – Token löschen & History-Eintrag ersetzen
   *──────────────────────────────────────────────*/
  logout(): void {
    this.auth.logout();                                   // Token/Speicher leeren
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  goBackToGrid(): void {
    this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
  }
}














