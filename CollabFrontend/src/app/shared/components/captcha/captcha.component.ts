import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, RecaptchaModule],
  template: `
    <re-captcha
      [siteKey]="siteKey"
      (resolved)="onResolved($event || '')"
    ></re-captcha>
  `
})
export class CaptchaComponent {
  @Output() verified = new EventEmitter<string>();
  siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  onResolved(token: string) {
    this.verified.emit(token);
  }
} 