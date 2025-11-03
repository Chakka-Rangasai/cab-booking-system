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

    this.pollingSubscription = timer(0, 5000).pipe(
      switchMap(() => {
        // Double-check we're still in browser before making HTTP request
        if (!isPlatformBrowser(this.platformId)) {
          return EMPTY;
        }
        
        return this.http.get(`http://localhost:8080/user-api/user/${userId}/request/${requestId}`,
          {
          headers: {
                         'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                  }
      }).pipe(
          catchError(err => {
            console.warn('Polling error:', err);
            return of(null); // Continue polling even if error occurs
          })
        );
      }),
      tap((res: any) => {
        console.log('Polling response:', res);

        if (res?.accepted && (res?.status === 'ONGOING' || res?.status === 'COMPLETED')) {
          
          // For completed rides, emit the data directly and stop polling
          if (res?.status === 'COMPLETED') {
            console.log('Ride completed detected!');
            this.bookingDetailsSource.next(res);
            this.stopPolling(); // Stop polling once completed
            return;
          }

          // For ongoing rides, fetch driver details but continue polling for completion
          if (res?.status === 'ONGOING') {
            console.log('Ongoing ride detected, continuing to poll for completion...');

            // Only fetch driver details if in browser and we haven't already fetched them
            if (isPlatformBrowser(this.platformId)) {
              const currentDetails = this.bookingDetailsSource.value;
              
              // Only fetch driver details if we don't have them yet
              if (!currentDetails || !currentDetails.driver) {
                this.http.get(`http://localhost:8080/driver-api/driver/${res.acceptedDriverId}`,
                  {
                    headers: {
                         'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                  }
                  }
                ).pipe(
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
              } else {
                // Keep the existing driver details and just update the status
                res.driver = currentDetails.driver;
                this.bookingDetailsSource.next(res);
              }
            }
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
    
    // Clear the cached booking details when stopping polling
    this.bookingDetailsSource.next(null);
    console.log('Booking details cleared from cache.');
  }

  // Check if ride is completed (can be called separately)
  checkRideCompletion(userId: number, requestId: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

  this.http.get(`http://localhost:8080/user-api/user/${userId}/request/${requestId}`,{
    headers: {
                         'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
  }).pipe(
      catchError(err => {
        console.warn('Error checking ride completion:', err);
        return of(null);
      })
    ).subscribe((res: any) => {
      if (res?.status === 'COMPLETED') {
        this.bookingDetailsSource.next(res);
      }
    });
  }

  // Clear all cached data and stop polling
  clearData(): void {
    this.stopPolling();
    this.bookingDetailsSource.next(null);
    console.log('All ride polling data cleared.');
  }
}