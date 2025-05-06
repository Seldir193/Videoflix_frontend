import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  constructor(private location: Location, private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.onLoginPage = e.urlAfterRedirects.startsWith('/auth/login');
        this.isVideoPage = e.urlAfterRedirects.startsWith('/dashboard/videos');
      });
  }

  goBack(): void {
    this.location.back();
  }

  openLogin(): void {
    this.router.navigate(['/auth', 'login']);
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
