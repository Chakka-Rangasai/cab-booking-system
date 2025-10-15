import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
 
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
 
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
 
  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        return true;
      } else {
        alert("Please login to access !");
        this.router.navigate(['/main/userlogin']);
        return false;
      }
    } else {
      // SSR context — skip localStorage access
      this.router.navigate(['/main/userlogin']);
      return false;
    }
  }
}
 
 