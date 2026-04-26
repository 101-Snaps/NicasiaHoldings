import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}

// FIX: StaffGuard was duplicated across two files (auth.guard.ts and staff.guard.ts).
// Keeping it here as well so both import paths work without changes to app.routes.ts.
export class StaffGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isStaff()) return true;
    this.router.navigate(['/dashboard']);
    return false;
  }
}
