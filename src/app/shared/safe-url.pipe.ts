import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private s: DomSanitizer) {}
  transform(url: string | null): SafeResourceUrl | null {
    return url ? this.s.bypassSecurityTrustResourceUrl(url) : null;
  }
}
