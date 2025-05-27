
import { Component ,ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../core/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from '../core/footer/footer.component';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CommonModule,HeaderComponent, TranslateModule,FooterComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
  encapsulation: ViewEncapsulation.None 
})
export class ImprintComponent {

}
