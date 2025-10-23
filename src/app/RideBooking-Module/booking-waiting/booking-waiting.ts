import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    private ridePollingService: RidePollingService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.bookingId = Number(params.get('id'));

      const userId = (JSON.parse(localStorage.getItem("userProfileDetails")!) as { userId: number }).userId // Replace with actual user ID logic
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