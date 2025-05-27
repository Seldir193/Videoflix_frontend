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
    this.auth.loggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updateFlags(e.urlAfterRedirects));
  }

  private updateFlags(url: string): void {
    this.onLoginPage = url.startsWith('/auth/login');
    this.isVideoPage =
      url.startsWith('/dashboard/videos') || url.startsWith('/watch/');
    this.isMovieInfo = url.includes('/movie/');
  }

  goBack(): void {
    if (this.isVideoPage) {
      this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
    } else if (this.isMovieInfo) {
      this.goBackToGrid();
    } else if (this.onLoginPage) {
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        window.history.back();
      }
    } else {
      this.location.back();
    }
  }

  openLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  goBackToGrid(): void {
    this.router.navigate(['/dashboard/videos'], { replaceUrl: true });
  }
}
