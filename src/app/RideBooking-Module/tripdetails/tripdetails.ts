import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RideHistoryService } from '../../ride-history-service';
 
@Component({
  selector: 'app-tripdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tripdetails.html',
  styleUrls: ['./tripdetails.css']
})
export class TripdetailsComponent implements OnInit {
  rideHistory: any[] = [];
  loading: boolean = true;
  error: string | null = null;
 
  constructor(
    private rideService: RideHistoryService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
 
  ngOnInit(): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.fetchRideHistory();
    } else {
      // Handle SSR case
      this.loading = false;
      this.error = 'Loading...';
    }
  }
 
  private fetchRideHistory(): void {
    // Double-check we're in browser before accessing localStorage
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('fetchRideHistory called in non-browser environment');
      return;
    }

    this.loading = true;
    this.error = null;
 
    // Retrieve user profile from localStorage
    const userProfile = localStorage.getItem('userProfileDetails');
    console.log('Checking localStorage for userProfileDetails:', userProfile);
 
    if (!userProfile) {
      console.error('No user profile found in localStorage');
      this.error = 'User session not found. Please log in again.';
      this.loading = false;
      setTimeout(() => { 
        this.router.navigate(['/main/userlogin']);
      }, 2000);
      return;
    }
 
    let userId: number | undefined;
    try {
      const parsedProfile = JSON.parse(userProfile);
      console.log('Parsed user profile:', parsedProfile);
      userId = parsedProfile.userId;
      console.log('Extracted userId:', userId);
    } catch (e) {
      console.error('Failed to parse userProfileDetails:', e);
      this.error = 'Invalid session data. Please log in again.';
      this.loading = false;
      setTimeout(() => {
        this.router.navigate(['/main/userlogin']);
      }, 2000);
      return;
    }
 
    if (!userId) {
      console.error('User ID is missing or invalid');
      this.error = 'User ID not found. Please log in again.';
      this.loading = false;
      setTimeout(() => {
        this.router.navigate(['/main/userlogin']);
      }, 2000);
      return;
    }
 
    console.log('Fetching ride history for userId:', userId);
 
    // Fetch ride history from the service
    this.rideService.getRideHistory(userId).subscribe({
      next: (data) => {
        console.log('Raw API response:', data);
        this.rideHistory = Array.isArray(data) ? data : [];
        console.log('Processed ride history:', this.rideHistory);
 
        if (this.rideHistory.length === 0) {
          console.warn('No rides found for the user.');
        }
 
        this.loading = false;
        this.error = null;
        this.cdr.markForCheck(); // Trigger view update
      },
      error: (err) => {
        console.error('Error fetching ride history:', err);
        this.error = 'Failed to load ride history. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
 
 