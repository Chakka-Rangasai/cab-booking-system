import { Component, OnInit } from '@angular/core';
import { CommonModule, LocationStrategy } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css']
})
export class PaymentSuccessComponent implements OnInit {
  rating: number = 0;
  submitted: boolean = false;
  bookingId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Try to get booking ID from multiple sources
    this.getBookingId();
    
    setTimeout(() => {
      this.navigateBackToBookingWaiting();
    }, 3000);
  }

  private getBookingId(): void {
    // Method 1: Try from query params (if passed from payment component)
    this.route.queryParamMap.subscribe(params => {
      const requestId = params.get('requestId');
      if (requestId) {
        this.bookingId = Number(requestId);
        console.log('Booking ID from query params:', this.bookingId);
        return;
      }
    });

    // Method 2: Try from localStorage (backup method)
    if (!this.bookingId) {
      const storedRequestId = localStorage.getItem('requestId');
      if (storedRequestId) {
        this.bookingId = Number(storedRequestId);
        console.log('Booking ID from localStorage:', this.bookingId);
      }
    }

    // Method 3: Check sessionStorage as another backup
    if (!this.bookingId) {
      const sessionRequestId = sessionStorage.getItem('currentBookingId');
      if (sessionRequestId) {
        this.bookingId = Number(sessionRequestId);
        console.log('Booking ID from sessionStorage:', this.bookingId);
      }
    }
  }

  private navigateBackToBookingWaiting(): void {
    if (this.bookingId) {
      // Navigate back to booking-waiting with the preserved booking ID
      this.router.navigate(['/userhomenav/booking-waiting'], {
        queryParams: { id: this.bookingId }
      });
      console.log('Navigating back to booking-waiting with ID:', this.bookingId);
    } else {
      // Fallback to home if no booking ID found
      console.warn('No booking ID found, redirecting to home');
      this.router.navigate(['/userhomenav/']);
    }
  }
}
