import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DriverService, DriverInfo } from '../../driver.service';
 
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  // Real driver data from backend
  driver: DriverInfo | null = null;
  isEditing: boolean = false;
  editedDriver: DriverInfo | null = null;
  isLoading: boolean = false;

  // Ride request and history data with better mock data
  rideRequests = [
    { 
      id: 1,
      pickup: 'Baner Cross Road', 
      drop: 'Kothrud Station', 
      fare: 220,
      distance: '8.5',
      estimatedTime: '18',
      customerName: 'Rahul S.',
      customerRating: 4.8
    },
    { 
      id: 2,
      pickup: 'Hinjewadi Phase 2', 
      drop: 'Shivajinagar Bus Stop', 
      fare: 350,
      distance: '12.3',
      estimatedTime: '25',
      customerName: 'Priya M.',
      customerRating: 4.9
    },
    { 
      id: 3,
      pickup: 'Pune Airport', 
      drop: 'Deccan Gymkhana', 
      fare: 450,
      distance: '15.2',
      estimatedTime: '30',
      customerName: 'Amit K.',
      customerRating: 4.7
    }
  ];

  rideHistory = [
    { 
      date: 'Oct 13', 
      pickup: 'Wakad IT Park', 
      drop: 'FC Road Metro', 
      fare: 220,
      customerRating: 5.0,
      duration: '22 min'
    },
    { 
      date: 'Oct 12', 
      pickup: 'Aundh ATI', 
      drop: 'Viman Nagar Airport Road', 
      fare: 340,
      customerRating: 4.8,
      duration: '28 min'
    },
    { 
      date: 'Oct 11', 
      pickup: 'Magarpatta City', 
      drop: 'Koregaon Park', 
      fare: 180,
      customerRating: 4.9,
      duration: '15 min'
    },
    { 
      date: 'Oct 10', 
      pickup: 'Hadapsar', 
      drop: 'Camp Area', 
      fare: 280,
      customerRating: 4.6,
      duration: '32 min'
    }
  ];

  ngOnInit() {
    this.loadDriverInfo();
  }

  loadDriverInfo() {
    if (isPlatformBrowser(this.platformId)) {
      const storedDriver = localStorage.getItem('driverInfo');
      const token = localStorage.getItem('driverToken');
      if (storedDriver && token) {
        this.driver = JSON.parse(storedDriver);
        if (this.driver) {
          this.ensureDriverFlags(this.driver);
          this.editedDriver = this.createDriverCopy(this.driver);
        }
      } else {
        alert('Please login to access the dashboard.');
        this.router.navigate(['/main/driverlogin']);
      }
    }
  }

  // Ensure flags exist (no legacy Available/Verified handling now)
  private ensureDriverFlags(driver: any) {
    if (driver.isAvailable === undefined) driver.isAvailable = true;
    if (driver.isVerified === undefined) driver.isVerified = false;
  }

  // Toggle availability with backend integration
  toggleAvailability() {
    if (!this.driver?.driverId) return;
    const newAvailability = !this.driver.isAvailable;
    this.isLoading = true;
    this.driverService.toggleAvailability(this.driver.driverId, newAvailability).subscribe({
      next: (resp) => {
        this.driver!.isAvailable = newAvailability;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('driverInfo', JSON.stringify(this.driver));
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        alert('Failed to update availability');
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
    this.isLoading = true;
    this.driverService.updateDriverProfile(this.editedDriver).subscribe({
      next: (resp) => {
        this.driver = resp.body!;
        this.ensureDriverFlags(this.driver);
        this.editedDriver = this.createDriverCopy(this.driver);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('driverInfo', JSON.stringify(this.driver));
        }
        this.isEditing = false;
        this.isLoading = false;
        alert('Profile successfully updated');
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to update profile');
      }
    });
  }

  // Ride booking methods with better functionality
  acceptRide(ride: any) {
    console.log('🚗 Accepting ride:', ride);
    
    // Simulate ride acceptance
    const confirmAccept = confirm(`Accept ride from ${ride.pickup} to ${ride.drop}?\nFare: ₹${ride.fare}\nCustomer: ${ride.customerName || 'Unknown'}`);
    
    if (confirmAccept) {
      // Remove from requests
      this.rideRequests = this.rideRequests.filter(r => r.id !== ride.id);
      
      // Add to history
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      
      this.rideHistory.unshift({
        date: dateStr,
        pickup: ride.pickup,
        drop: ride.drop,
        fare: ride.fare,
        customerRating: ride.customerRating || 4.5,
        duration: ride.estimatedTime + ' min'
      });
      
      alert(`✅ Ride accepted! Navigate to pickup location: ${ride.pickup}`);
      
      // TODO: Integrate with backend ride acceptance API
      // this.driverService.acceptRide(ride.id).subscribe(...)
    }
  }

  rejectRide(ride: any) {
    console.log('❌ Rejecting ride:', ride);
    
    const confirmReject = confirm(`Reject ride from ${ride.pickup} to ${ride.drop}?\nFare: ₹${ride.fare}`);
    
    if (confirmReject) {
      // Remove from requests
      this.rideRequests = this.rideRequests.filter(r => r.id !== ride.id);
      alert('❌ Ride rejected. Looking for more requests...');
      
      // TODO: Integrate with backend ride rejection API  
      // this.driverService.rejectRide(ride.id).subscribe(...)
    }
  }

  // Method to simulate new ride requests (for testing)
  addMockRideRequest() {
    const mockLocations = [
      { pickup: 'Kalyani Nagar', drop: 'Bund Garden' },
      { pickup: 'Yerawada', drop: 'MG Road' },
      { pickup: 'Kharadi', drop: 'JM Road' },
      { pickup: 'Wagholi', drop: 'Swargate' }
    ];
    
    const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const mockRide = {
      id: Date.now(),
      ...randomLocation,
      fare: Math.floor(Math.random() * 300) + 150,
      distance: (Math.random() * 10 + 5).toFixed(1),
      estimatedTime: Math.floor(Math.random() * 20 + 15).toString(),
      customerName: ['Rajesh P.', 'Sneha T.', 'Vikram S.', 'Anita R.'][Math.floor(Math.random() * 4)],
      customerRating: Math.round((Math.random() * 0.5 + 4.5) * 10) / 10
    };
    
    this.rideRequests.push(mockRide);
  }

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
      isVerified: driver.isVerified ?? false
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