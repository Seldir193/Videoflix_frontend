









import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  // Flags für die aktuelle Seite
  onLoginPage = false;
  isVideoPage = false;
  isMovieInfo = false;
  isLoggedIn = false;

  constructor(
    private location: Location,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Abo des Login-Status Observable
    this.auth.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;  // Aktualisiere den Login-Status
    });

    // Eventlistener für NavigationEnd
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updateFlags(e.urlAfterRedirects));
  }

  /* ---------- URL → Flags aktualisieren ------------------------------------- */
  private updateFlags(url: string): void {
    this.onLoginPage = url.startsWith('/auth/login');
    this.isVideoPage =
      url.startsWith('/dashboard/videos') || url.startsWith('/watch/');
    this.isMovieInfo = url.includes('/movie/');
  }

  /* ---------- Zurück navigieren → je nach Seite unterschiedliche Logik --------- */
  goBack(): void {
    if (this.isVideoPage) {
      this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
    } else if (this.isMovieInfo) {
      this.goBackToGrid(); // Gehe zum Grid
    } else if (this.onLoginPage) {
      if (this.auth.isLoggedIn()) {
        // Wenn der Benutzer eingeloggt ist und auf der Login-Seite ist, leite ihn zum Dashboard weiter
        this.router.navigate(['/dashboard'],{ replaceUrl: true } );
      } else {
        window.history.back(); // Andernfalls gehe zurück aus der App
      }
    } else {
      this.location.back(); // Standard-Rück-Navigation
    }
  }

  /* ---------- Login-Seite öffnen ------------------------ */
  openLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /* ---------- Logout – Token löschen und History-Eintrag ersetzen -------------- */
  logout(): void {
    this.auth.logout();  // Tokens entfernen
    this.router.navigate(['/auth/login'],{ replaceUrl: true } ); // Zur Login-Seite weiterleiten
  }

  /* ---------- Zurück zum Grid (Dashboard) von Movie-Info-Seite ---------------- */
  goBackToGrid(): void {
    this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
  }
}
