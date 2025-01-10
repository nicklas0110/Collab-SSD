import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  private attempts = new Map<string, number>();
  private lockouts = new Map<string, Date>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  checkRateLimit(identifier: string): boolean {
    if (this.isLockedOut(identifier)) {
      return false;
    }

    const attempts = this.attempts.get(identifier) || 0;
    if (attempts >= this.MAX_ATTEMPTS) {
      this.lockouts.set(identifier, new Date(Date.now() + this.LOCKOUT_DURATION));
      return false;
    }

    this.attempts.set(identifier, attempts + 1);
    return true;
  }

  private isLockedOut(identifier: string): boolean {
    const lockoutTime = this.lockouts.get(identifier);
    if (lockoutTime && lockoutTime > new Date()) {
      return true;
    }
    this.lockouts.delete(identifier);
    return false;
  }

  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
    this.lockouts.delete(identifier);
  }

  getRemainingAttempts(identifier: string): number {
    const attempts = this.attempts.get(identifier) || 0;
    return Math.max(0, this.MAX_ATTEMPTS - attempts);
  }

  getLockoutTime(identifier: string): Date | null {
    return this.lockouts.get(identifier) || null;
  }
} 