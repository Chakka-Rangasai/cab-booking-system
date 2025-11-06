import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private router = inject(Router);
  //It is a token to check weather the app is running on browser or server ;
  //If the platform id is present then code is running on browser
  private platformId = inject(PLATFORM_ID);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    // SSR context: allow navigation
    //If code is running on server now you dont get access to local stoprage so thats why we allow navigation here but in our casw we are using client side rendering so  no problem
    if (!isPlatformBrowser(this.platformId)) {
      console.log('AuthGuard: SSR context - allowing navigation');
      return true;
    }
    // this state is used to get the details about the current state what url you are entering all those .
    const currentUrl = state.url;
    console.log('AuthGuard: Navigating to', currentUrl);

    return of(null).pipe(
      delay(1),
      map(() => {
        const userToken = localStorage.getItem('jwtToken');
        const driverToken = localStorage.getItem('driverToken');

        const isUserRoute = currentUrl.includes('/userhomenav');
        const isDriverRoute = currentUrl.includes('/drivernav');

        if (isUserRoute) {
          if (userToken) {
            console.log('AuthGuard: User token valid - access granted');
            return true;
          } else {
            console.log('AuthGuard: No user token - redirecting to user login');
            this.router.navigate(['/main/userlogin']);
            alert('Please login as user to access!');
            return false;
          }
        }

        if (isDriverRoute) {
          if (driverToken) {
            console.log('AuthGuard: Driver token valid - access granted');
            return true;
          } else {
            console.log('AuthGuard: No driver token - redirecting to driver login');
            this.router.navigate(['/main/driverlogin']);
            alert('Please login as driver to access!');
            return false;
          }
        }

        // Default fallback: deny access
        console.log('AuthGuard: Unknown route - denying access');
        this.router.navigate(['/main']);
        alert('Access denied!');
        return false;
      })
    );
  }
}