import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  template: '<p style="padding:2rem">Account wird aktiviert …</p>',
})
export class ActivateComponent {
  private route = inject(ActivatedRoute);
  private auth  = inject(AuthService);
  private router= inject(Router);

  ngOnInit() {
    const uid   = this.route.snapshot.paramMap.get('uid')!;
    const token = this.route.snapshot.paramMap.get('token')!;

    this.auth.activate(uid, token).subscribe({
      next: ()  => this.router.navigate(['/auth/login'], { queryParams:{ activated:'yes' } }),
      error: () => this.router.navigate(['/auth/login'], { queryParams:{ activated:'fail'} }),
    });
  }
}






