import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCaptureComponent } from './email-capture.component';

describe('EmailCaptureComponent', () => {
  let component: EmailCaptureComponent;
  let fixture: ComponentFixture<EmailCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailCaptureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
