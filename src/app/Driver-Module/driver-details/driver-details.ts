import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DriverService, DriverInfo } from '../../driver.service';
import { RidePollingService } from '../../ride-polling-service';
 
@Component({
  selector: 'app-driver-details',
  imports: [FormsModule, CommonModule],
  templateUrl: './driver-details.html',
  styleUrl: './driver-details.css'
})
export class DriverDetails implements OnInit {
  constructor(
    private router: Router, 
    private driverService: DriverService,
    private cdr: ChangeDetectorRef,
    private ridePollingService: RidePollingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  // Real driver data from backend
  driver: DriverInfo | null = null;
  isEditing: boolean = false;
  editedDriver: DriverInfo | null = null;
  isLoading: boolean = false;
  averageRating: number | null = null;

  // Ride request and history data with better mock data
  pendingRides: any[] = [];
  ongoingRides: any[] = [];
  rideHistory: any[] = [];

  ngOnInit() {
    this.loadDriverInfo();
    // Only load rides if in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadPendingRides();
      this.loadOngoingRides();
      this.loadConfirmedRides();
    }
  }


  loadDriverInfo() {
    if (isPlatformBrowser(this.platformId)) {
      const storedDriver = localStorage.getItem('driverInfo');
      const token = localStorage.getItem('driverToken');
      if (storedDriver && token) {
        this.driver = JSON.parse(storedDriver);
        if (this.driver) {
          this.ensureDriverFlags(this.driver);
          this.fetchAverage();
          this.editedDriver = this.createDriverCopy(this.driver);
        }
      } else {
        alert('Please login to access the dashboard.');
        this.router.navigate(['/main/driverlogin']);
      }
    }
  }

  
  private fetchAverage() {
    if (!this.driver?.driverId) {
      console.warn('fetchAverage: missing driverId');
      this.averageRating = null;
      return;
    }
    console.log('fetchAverage -> calling /driver/' + this.driver.driverId + '/average (no auth)');
    this.driverService.getDriverAverage(this.driver.driverId, false).subscribe({
      next: (val: number) => {
        this.averageRating = typeof val === 'number' ? val : Number(val);
        console.log('fetchAverage success raw:', val, 'stored averageRating:', this.averageRating);
        console.log('fetchAverage - current isLoading state:', this.isLoading);
        // Only trigger change detection if not currently in a loading state
        if (!this.isLoading) {
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('fetchAverage error status:', err?.status, 'body:', err?.error);
        this.averageRating = null;
        // Only trigger change detection if not currently in a loading state
        if (!this.isLoading) {
          this.cdr.markForCheck();
        }
      }
    });
  }

  // Ensure flags exist (no legacy Available/Verified handling now)
  private ensureDriverFlags(driver: any) {
    console.log('ensureDriverFlags input:', driver);
    if (driver.isAvailable === undefined) driver.isAvailable = true;
    if (driver.isVerified === undefined) driver.isVerified = true;
    console.log('ensureDriverFlags after normalization:', driver);
  }

  // Toggle availability with backend integration
  toggleAvailability() {
    if (!this.driver?.driverId) return;
    
    const newAvailability = !this.driver.isAvailable;
    console.log('Toggling availability from', this.driver.isAvailable, 'to', newAvailability);
    
    // Set loading state
    this.isLoading = true;
    this.cdr.markForCheck(); // Force UI update for loading state
    
    this.driverService.toggleAvailability(this.driver.driverId, newAvailability).subscribe({
      next: (response) => {
        console.log('Availability toggle successful:', response);
        
        // Update the driver object immediately
        this.driver!.isAvailable = newAvailability;
        
        // Update localStorage with new status
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('driverInfo', JSON.stringify(this.driver));
        }
        
        // Update editedDriver as well if it exists
        if (this.editedDriver) {
          this.editedDriver.isAvailable = newAvailability;
        }
        
        // Reset loading state FIRST
        this.isLoading = false;
        
        // Force change detection to update UI immediately
        this.cdr.markForCheck();
        
        // Show success message
        const statusText = newAvailability ? 'Available' : 'Unavailable';
        alert(`Status updated to: ${statusText}`);
        
        // Refresh average rating (but don't let it interfere with loading state)
        this.fetchAverage();
      },
      error: (error) => {
        console.error('Failed to update availability:', error);
        
        // Reset loading state FIRST
        this.isLoading = false;
        
        // Force change detection
        this.cdr.markForCheck();
        
        alert('Failed to update availability. Please try again.');
      }
    });
  }

  // Profile editing methods
  startEdit() {
    this.isEditing = true;
    if (this.driver) {
      this.editedDriver = this.createDriverCopy(this.driver);
    }
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.driver) {
      this.editedDriver = this.createDriverCopy(this.driver);
    }
  }

  saveProfile() {
    if (!this.editedDriver) return;
    
    console.log('Saving profile with data:', this.editedDriver);
    this.isLoading = true;
    
    this.driverService.updateDriverProfile(this.editedDriver).subscribe({
      next: (resp: any) => {
        console.log('Profile update successful:', resp);
        
        // Update the main driver object
        this.driver = resp.body!;
        this.ensureDriverFlags(this.driver);
        
        // Create a fresh copy for editing
        this.editedDriver = this.createDriverCopy(this.driver!);
        
        // Update localStorage
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('driverInfo', JSON.stringify(this.driver));
        }
        
        // Force change detection
        this.cdr.markForCheck();
        
        this.isEditing = false;
        this.isLoading = false;
        
        alert('Profile successfully updated');
      },
      error: (error) => {
        console.error('Profile update failed:', error);
        this.isLoading = false;
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  loadPendingRides() {
    // Only make HTTP requests in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.driverService.getPendingRides().subscribe({
      next: (rides) => {
        this.pendingRides = rides;
        console.log('Fetched pending rides:', rides);
        rides.forEach(ride => {
          console.log('Fetched pending ride:', ride.requestId);
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching pending rides:', err);
      }
    });
  }

  loadConfirmedRides() {
    // Only make HTTP requests in browser environment
    if (!isPlatformBrowser(this.platformId) || !this.driver?.driverId) {
      return;
    }
    
    this.driverService.getCompletedRidesByDriver(this.driver.driverId).subscribe({
      next: (rides) => {
        this.rideHistory = rides.map(ride => ({
          // date: new Date().toLocaleDateString(), // You can replace this with actual ride date if available
          pickup: ride.origin,
          drop: ride.destination,
          fare: ride.amount,
          // customerRating: 4.8, // Placeholder if rating is not available
          duration: ride.distance // Or calculate duration if available
        }));
        console.log('Confirmed rides loaded:', this.rideHistory);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(' Error loading confirmed rides:', err);
      }
    });
  }

  loadOngoingRides() {
    // Only make HTTP requests in browser environment
    if (!isPlatformBrowser(this.platformId) || !this.driver?.driverId) {
      return;
    }
    
    this.driverService.getOngoingRidesByDriver(this.driver.driverId).subscribe({
      next: (rides) => {
        this.ongoingRides = rides;
        console.log('Fetched ongoing rides:', rides);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching ongoing rides:', err);
      }
    });
  }


acceptRide(ride: any) {
  const confirmAccept = confirm(`Accept ride from ${ride.origin} to ${ride.destination}?\nFare: ₹${ride.amount}`);
  if (!confirmAccept || !this.driver?.driverId) return;
  
  console.log('Accepting ride:', ride.requestId, 'for driver:', this.driver.driverId);
  
  this.driverService.acceptRideRequest(ride.requestId, this.driver.driverId).subscribe({
    next: (response) => {
      console.log('Ride acceptance successful:', response);
      
      // Remove from pending rides immediately
      this.pendingRides = this.pendingRides.filter(r => r.requestId !== ride.requestId);
      
      // Add to ongoing rides
      this.ongoingRides.push(ride);
      
      // Force change detection to update UI immediately
      this.cdr.markForCheck();
      
      alert(`✅ Ride accepted! Navigate to pickup location: ${ride.origin}`);
    },
    error: (err) => {
      console.error('Failed to accept ride:', err);
      alert('❌ Failed to accept ride. Please try again.');
    }
  });
}

completeRide(ride: any) {
  const confirmComplete = confirm(`Complete ride from ${ride.origin} to ${ride.destination}?\nFare: ₹${ride.amount}`);
  if (!confirmComplete || !this.driver?.driverId) return;
  
  console.log('Completing ride:', ride.requestId, 'for driver:', this.driver.driverId);
  
  this.driverService.completeRide(ride.requestId, this.driver.driverId).subscribe({
    next: (response) => {
      console.log('Ride completion successful:', response);
      
      // Remove from ongoing rides
      this.ongoingRides = this.ongoingRides.filter(r => r.requestId !== ride.requestId);
      
      // Reload pending rides and other data
      this.loadPendingRides();
      this.loadConfirmedRides();
      
      // Force change detection to update UI immediately
      this.cdr.markForCheck();
      
      alert(`✅ Ride completed successfully! Payment of ₹${ride.amount} processed.`);
    },
    error: (err) => {
      console.error('Failed to complete ride:', err);
      alert('❌ Failed to complete ride. Please try again.');
    }
  });
}




   rejectRide(ride: any) {
    const confirmReject = confirm(`Reject ride from ${ride.origin} to ${ride.destination}?\nFare: ₹${ride.amount}`);
    if (confirmReject) {
      this.pendingRides = this.pendingRides.filter(r => r.requestId !== ride.requestId);
      alert('❌ Ride rejected. Looking for more requests...');
      // TODO: Integrate with backend ride rejection API
    }
  }
  // Method to simulate new ride requests (for testing)
  // addMockRideRequest() {
  //   const mockLocations = [
  //     { pickup: 'Kalyani Nagar', drop: 'Bund Garden' },
  //     { pickup: 'Yerawada', drop: 'MG Road' },
  //     { pickup: 'Kharadi', drop: 'JM Road' },
  //     { pickup: 'Wagholi', drop: 'Swargate' }
  //   ];
    
  //   const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  //   const mockRide = {
  //     id: Date.now(),
  //     ...randomLocation,
  //     fare: Math.floor(Math.random() * 300) + 150,
  //     distance: (Math.random() * 10 + 5).toFixed(1),
  //     estimatedTime: Math.floor(Math.random() * 20 + 15).toString(),
  //     customerName: ['Rajesh P.', 'Sneha T.', 'Vikram S.', 'Anita R.'][Math.floor(Math.random() * 4)],
  //     customerRating: Math.round((Math.random() * 0.5 + 4.5) * 10) / 10
  //   };
    
  //   this.rideRequests.push(mockRide);
  // }

  // Enhanced logout with proper cleanup
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      localStorage.removeItem('authToken'); // Clear any other auth tokens
    }
    alert('You have been logged out successfully.');
    this.router.navigate(['/main/driverlogin']);
  }

  // TrackBy function for ngFor performance optimization
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Helper method to create a safe copy of driver data
  private createDriverCopy(driver: DriverInfo): DriverInfo {
    console.log("driverId", driver.driverId);
    return {
      driverId: driver.driverId,
      fullName: driver.fullName || '',
      email: driver.email || '',
      phoneNumber: driver.phoneNumber || '',
      passwordHash: driver.passwordHash || '',
      licenseNumber: driver.licenseNumber || '',
      vehicleModel: driver.vehicleModel || '',
      vehicleRegNo: driver.vehicleRegNo || '',
      vehicleColor: driver.vehicleColor || '',
      capacity: driver.capacity,
      isAvailable: driver.isAvailable ?? true,
      isVerified: driver.isVerified ?? true
    };
    
  }
 

  // Validation methods
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone);
  }

  isFormValid(): boolean {
    if (!this.editedDriver) return false;
    
    return this.editedDriver.fullName.trim().length >= 2 &&
           this.isValidEmail(this.editedDriver.email) &&
           this.isValidPhoneNumber(this.editedDriver.phoneNumber) &&
           this.editedDriver.licenseNumber.trim().length > 0 &&
           this.editedDriver.vehicleModel.trim().length > 0 &&
           this.editedDriver.vehicleRegNo.trim().length > 0 &&
           this.editedDriver.vehicleColor.trim().length > 0 &&
           this.editedDriver.capacity >= 1 && this.editedDriver.capacity <= 8;
  }
}