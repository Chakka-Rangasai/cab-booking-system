import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RidePollingService } from '../../ride-polling-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-booking-waiting',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-waiting.html',
  styleUrls: ['./booking-waiting.css']
})
export class BookingWaiting implements OnInit, OnDestroy {
  bookingId!: number;
  status: 'waiting' | 'confirmed' | 'completed' | 'cancelled' = 'waiting';
  bookingDetails: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private ridePollingService: RidePollingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only run polling and localStorage access in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Clear any existing data before starting fresh
    this.ridePollingService.clearData();
    this.status = 'waiting';
    this.bookingDetails = null;

    this.route.queryParamMap.subscribe(params => {
      this.bookingId = Number(params.get('id'));

      try {
        const userProfile = localStorage.getItem("userProfileDetails");
        if (!userProfile) {
          console.error('No user profile found in localStorage');
          this.router.navigate(['/main/userlogin']);
          return;
        }

        const userId = (JSON.parse(userProfile) as { userId: number }).userId;
        const requestId = this.bookingId;

        // Start polling
        this.ridePollingService.pollConfirmedRide(userId, requestId);

        // Subscribe to booking updates
        this.ridePollingService.bookingDetails$
          .pipe(takeUntil(this.destroy$))
          .subscribe(details => {
            if (details) {
              this.ngZone.run(() => {
                this.bookingDetails = details;
                
                // Enhanced status checking with logging
                console.log('Received booking update:', details);
                console.log('Current status:', details.status);
                
                // Check ride status and update accordingly
                if (details.status === 'COMPLETED') {
                  this.status = 'completed';
                  console.log('✅ Ride completed - UI updated to completed state');
                } else if (details.status === 'ONGOING') {
                  this.status = 'confirmed';
                  console.log('🚗 Ride ongoing - UI updated to confirmed state');
                } else {
                  this.status = 'confirmed'; // Default to confirmed for any accepted ride
                  console.log('📋 Booking confirmed - UI updated to confirmed state');
                }
                
                this.cdr.markForCheck();
              });
            }
          });
      } catch (error) {
        console.error('Error parsing user profile from localStorage:', error);
        this.router.navigate(['/main/userlogin']);
      }
    });
  }

  ngOnDestroy(): void {
    // Clear component state
    this.status = 'waiting';
    this.bookingDetails = null;
    
    // Stop observables
    this.destroy$.next();
    this.destroy$.complete();
    
    // Stop polling and clear cached data
    this.ridePollingService.clearData();
    
    console.log('BookingWaiting component destroyed and data cleared.');
  }

  goHome(): void {
    this.router.navigate(['/userhomenav']);
  }

  rateDriver(rating: number): void {
    // TODO: Implement driver rating functionality
    console.log(`User rated driver: ${rating} stars`);
    // After rating, you can send the rating to backend
    alert(`Thank you for rating ${rating} stars!`);
  }

  bookAnotherRide(): void {
    this.router.navigate(['/userhomenav']);
  }
}