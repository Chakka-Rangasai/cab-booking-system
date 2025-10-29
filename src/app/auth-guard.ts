import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
 
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
 
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
 
  canActivate(): boolean | Observable<boolean> {
    // In SSR context, allow navigation and check auth on client-side
    if (!isPlatformBrowser(this.platformId)) {
      console.log('AuthGuard: SSR context - allowing navigation');
      return true; // Allow navigation, will be checked again on client-side
    }

    // Browser context - check token
    console.log('AuthGuard: Browser context - checking token');
    
    // Add small delay to ensure DOM is ready
    return of(null).pipe(
      delay(1),
      map(() => {
        const userToken = localStorage.getItem('jwtToken');
        const driverToken = localStorage.getItem('driverToken');
        const hasToken = !!(userToken || driverToken);
        
        console.log('AuthGuard: User token:', !!userToken);
        console.log('AuthGuard: Driver token:', !!driverToken);
        console.log('AuthGuard: Has any token:', hasToken);
        
        if (hasToken) {
          console.log('AuthGuard: Access granted');
          return true;
        } else {
          console.log('AuthGuard: No token found, redirecting to login');
          this.router.navigate(['/main/userlogin']);
          alert("Please login to access!");
          
          return false;
        }
      })
    );
  }
}
 
 