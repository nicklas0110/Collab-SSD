import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  private readonly titlePattern = /^[a-zA-Z0-9\s\-_]{3,100}$/;
  private readonly descriptionPattern = /^[\w\s\-_.,!?()]{0,500}$/;
  private readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  private readonly messagePattern = /^[\w\s\-_.,!?()@#$%^&*]{1,5000}$/;
  private readonly namePattern = /^[a-zA-Z\s\-]{2,20}$/;

  validateTitle(title: string): boolean {
    return this.titlePattern.test(title);
  }

  validateDescription(description: string): boolean {
    return this.descriptionPattern.test(description);
  }

  validateEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }

  validatePassword(password: string): boolean {
    return this.passwordPattern.test(password);
  }

  validateMessage(message: string): boolean {
    return this.messagePattern.test(message) && message.length <= 5000;
  }

  sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, '');
  }

  validateName(name: string): boolean {
    return this.namePattern.test(name) && name.length <= 20;
  }
} 