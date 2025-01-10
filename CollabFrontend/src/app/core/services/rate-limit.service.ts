import { Injectable } from '@angular/core';

interface RateLimitData {
  attempts: [string, number][];
  lockouts: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly STORAGE_KEY = 'rate_limit_data';

  private loadFromStorage(): { attempts: Map<string, number>, lockouts: Map<string, Date> } {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as RateLimitData;
      return {
        attempts: new Map<string, number>(parsed.attempts),
        lockouts: new Map(Object.entries(parsed.lockouts).map(([key, value]) => [key, new Date(value)]))
      };
    }
    return { 
      attempts: new Map<string, number>(), 
      lockouts: new Map<string, Date>() 
    };
  }

  private saveToStorage(attempts: Map<string, number>, lockouts: Map<string, Date>) {
    const data: RateLimitData = {
      attempts: Array.from(attempts.entries()),
      lockouts: Object.fromEntries(Array.from(lockouts.entries()).map(([key, value]) => [key, value.toISOString()]))
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  checkRateLimit(identifier: string): boolean {
    const { attempts, lockouts } = this.loadFromStorage();
    
    if (this.isLockedOut(identifier, lockouts)) {
      return false;
    }

    const currentAttempts = attempts.get(identifier) || 0;
    if (currentAttempts >= this.MAX_ATTEMPTS) {
      lockouts.set(identifier, new Date(Date.now() + this.LOCKOUT_DURATION));
      this.saveToStorage(attempts, lockouts);
      return false;
    }

    attempts.set(identifier, currentAttempts + 1);
    this.saveToStorage(attempts, lockouts);
    return true;
  }

  private isLockedOut(identifier: string, lockouts: Map<string, Date>): boolean {
    const lockoutTime = lockouts.get(identifier);
    if (lockoutTime && lockoutTime > new Date()) {
      return true;
    }
    lockouts.delete(identifier);
    return false;
  }

  resetAttempts(identifier: string): void {
    const { attempts, lockouts } = this.loadFromStorage();
    attempts.delete(identifier);
    lockouts.delete(identifier);
    this.saveToStorage(attempts, lockouts);
  }

  getRemainingAttempts(identifier: string): number {
    const { attempts } = this.loadFromStorage();
    const currentAttempts = attempts.get(identifier) || 0;
    return Math.max(0, this.MAX_ATTEMPTS - currentAttempts);
  }

  getLockoutTime(identifier: string): Date | null {
    const { lockouts } = this.loadFromStorage();
    return lockouts.get(identifier) || null;
  }
} 