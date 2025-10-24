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
  status: 'waiting' | 'confirmed' | 'cancelled' = 'waiting';
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
                this.status = 'confirmed';
                console.log('Booking confirmed:', this.bookingDetails);
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
    this.destroy$.next();
    this.destroy$.complete();
    this.ridePollingService.stopPolling();
  }

  goHome(): void {
    this.router.navigate(['/userhomenav']);
  }
}