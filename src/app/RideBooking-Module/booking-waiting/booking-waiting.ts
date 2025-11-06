import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { RidePollingService } from '../../ride-polling-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-waiting',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './booking-waiting.html',
  styleUrls: ['./booking-waiting.css']
})
export class BookingWaiting implements OnInit, OnDestroy {
  bookingId!: number;
  status: 'waiting' | 'confirmed' | 'completed' | 'cancelled' = 'waiting';
  bookingDetails: any = null;
  paymentDone: boolean = false;
  driverReview: { rating: number; reviewText?: string } = {
    rating: 0,
    reviewText: ''
  };
  driverAverageRating: number = 0;
  isRatingSubmitted: boolean = false;

  private destroy$ = new Subject<void>();
  private popStateHandler = () => this.router.navigate(['/userhomenav']);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private ridePollingService: RidePollingService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ridePollingService.clearData();
    this.status = 'waiting';
    this.bookingDetails = null;

    const userProfile = localStorage.getItem('userProfileDetails');
    if (!userProfile) {
      console.error('No user profile found in localStorage');
      this.router.navigate(['/main/userlogin']);
      return;
    }

    this.route.queryParamMap.subscribe(params => {
      this.bookingId = Number(params.get('id'));

      localStorage.setItem('requestId', String(this.bookingId));
      sessionStorage.setItem('currentBookingId', String(this.bookingId));

      const userId = (JSON.parse(userProfile) as { userId: number }).userId;
      const requestId = this.bookingId;

      this.ridePollingService.pollConfirmedRide(userId, requestId);

      this.ridePollingService.bookingDetails$
        .pipe(takeUntil(this.destroy$))
        .subscribe(details => {
          if (details) {
            this.ngZone.run(() => {
              this.bookingDetails = details;
              console.log('Received booking update:', details);

              switch (details.status) {
                case 'COMPLETED':
                  this.status = 'completed';
                  console.log('✅ Ride completed');
                  this.loadDriverAverageRating();
                  break;
                case 'ONGOING':
                  this.status = 'confirmed';
                  console.log('🚗 Ride ongoing');
                  break;
                default:
                  this.status = 'confirmed';
                  console.log('📋 Booking confirmed');
              }

              localStorage.setItem('requestId', String(this.bookingId));
              this.checkPaymentStatus(this.bookingId);
              this.cdr.markForCheck();
            });
          }
        });
    });

    // Redirect to home on browser back or refresh
    window.addEventListener('popstate', this.popStateHandler);
  }

  checkPaymentStatus(requestId: number): void {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.get<string[] | null>(`http://localhost:8080/payment-api/payment/getpaymentstatusforride/${requestId}`, { headers }).subscribe({
      next: (status) => {
        this.paymentDone = status?.[0] === 'SUCCESS';
      },
      error: (err) => {
        console.error('Error checking payment status:', err);
        this.paymentDone = false;
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.popStateHandler);

    this.status = 'waiting';
    this.bookingDetails = null;
    this.destroy$.next();
    this.destroy$.complete();
    this.ridePollingService.clearData();
    this.ridePollingService.stopPolling();
    console.log('BookingWaiting component destroyed.');
  }

  goHome(): void {
    this.router.navigate(['/userhomenav']);
  }

  goToPayment(): void {
    localStorage.setItem('requestId', String(this.bookingId));
    sessionStorage.setItem('currentBookingId', String(this.bookingId));

    this.router.navigate(['/userhomenav/payment'], {
      queryParams: {
        requestId: this.bookingId,
        amount: this.bookingDetails?.amount,
        returnTo: 'booking-waiting'
      }
    });
  }

  rateDriver(rating: number): void {
    this.driverReview.rating = rating;
    console.log(`User rated driver: ${rating} stars`);
    console.log('Review text:', this.driverReview.reviewText);
  }

  onStarHover(rating: number): void {}

  onStarLeave(): void {}

  submitDriverRating(): void {
    if (this.driverReview.rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }

    if (this.isRatingSubmitted) {
      alert('You have already submitted a rating for this ride.');
      return;
    }

    const driverId = this.bookingDetails?.acceptedDriverId || this.bookingDetails?.driver?.id;
    if (!driverId) {
      alert('Driver information not available. Please try again.');
      return;
    }

    const ratingData = {
      rating: this.driverReview.rating,
      reviewText: this.driverReview.reviewText?.trim() || '',
      driverId: driverId
    };

    console.log('Submitting driver rating:', ratingData);
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`http://localhost:8080/review-api/reviews/${driverId}`, ratingData, { headers }).subscribe({
      next: (response) => {
        console.log('Rating submitted successfully:', response);
        this.isRatingSubmitted = true;
        alert('Rating submitted successfully! Thank you for your feedback.');
        this.loadDriverAverageRating();
      },
      error: (error) => {
        console.error('Error submitting rating:', error);
        alert('Failed to submit rating. Please try again.');
      }
    });
  }

  loadDriverAverageRating(): void {
    const driverId = this.bookingDetails?.acceptedDriverId || this.bookingDetails?.driver?.id;
    if (!driverId) {
      console.warn('Driver ID not available for loading average rating');
      return;
    }

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<number>(`http://localhost:8080/review-api/reviews/driver/${driverId}/average`, { headers }).subscribe({
      next: (averageRating) => {
        this.driverAverageRating = averageRating || 0;
        console.log(`Driver average rating: ${this.driverAverageRating}`);
      },
      error: (error) => {
        console.error('Error loading driver average rating:', error);
        this.driverAverageRating = 0;
      }
    });
  }

  bookAnotherRide(): void {
    this.router.navigate(['/userhomenav']);
  }
}
