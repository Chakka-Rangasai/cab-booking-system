import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, Subscription, of, EMPTY } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class RidePollingService {
  private bookingDetailsSource = new BehaviorSubject<any>(null);
  bookingDetails$ = this.bookingDetailsSource.asObservable();

  private pollingSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  pollConfirmedRide(userId: number, requestId: number): void {
    // Only run polling in the browser, not during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.stopPolling(); // Cancel any existing polling

    this.pollingSubscription = timer(0, 10000).pipe(
      switchMap(() => {
        // Double-check we're still in browser before making HTTP request
        if (!isPlatformBrowser(this.platformId)) {
          return EMPTY;
        }
        
        return this.http.get(`http://localhost:8088/user/${userId}/request/${requestId}`).pipe(
          catchError(err => {
            console.warn('Polling error:', err);
            return of(null); // Continue polling even if error occurs
          })
        );
      }),
      tap((res: any) => {
        console.log('Polling response:', res);

        if (res?.accepted && res?.status === 'CONFIRMED') {
          this.stopPolling(); // Stop polling once confirmed

          // Only fetch driver details if in browser
          if (isPlatformBrowser(this.platformId)) {
            this.http.get(`http://localhost:8087/driver/${res.acceptedDriverId}`).pipe(
              catchError(() => {
                res.driver = { name: 'Unknown', carNumber: 'N/A', phoneNumber: 'N/A' };
                return of(res); // Return modified response even on error
              })
            ).subscribe((driver: any) => {
              if (driver?.fullName) {
                res.driver = {
                  name: driver.fullName,
                  carNumber: driver.vehicleRegNo,
                  phoneNumber: driver.phoneNumber,
                };
              }
              this.bookingDetailsSource.next(res); // Emit enriched booking details
            });
          }
        }
      })
    ).subscribe();
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
      console.log('Polling stopped.');
    }
  }
}