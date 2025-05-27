





import { Component, Inject, ElementRef, AfterViewInit} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';



@Component({
  standalone: true,
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
 
})
export class ToastComponent implements AfterViewInit {
   

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public text: string,
    private ref: MatSnackBarRef<ToastComponent>,
    private el : ElementRef<HTMLElement>
   
    
  ) {}

  ngAfterViewInit(): void {
    /* Startklasse (slide-toast) kommt vom Aufruf – hier nur show hinzufügen */
    
    queueMicrotask(() => this.container.classList.add('show'));
  }

  close(): void {
    this.container.classList.add('hide');          // Slide-Out
    setTimeout(() => this.ref.dismiss(), 500);     // Gleich lang wie transition
  }

  private get container(): HTMLElement {
    return this.el.nativeElement.parentElement as HTMLElement;
  }
}

