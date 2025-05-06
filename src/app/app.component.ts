import { Component } from '@angular/core';
import { LayoutShellComponent } from './core/layout-shell/layout-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutShellComponent],        
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']    
})
export class AppComponent {
  title = 'videoflix-ui';
}
