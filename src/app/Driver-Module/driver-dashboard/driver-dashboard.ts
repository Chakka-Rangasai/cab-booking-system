import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService, DriverInfo } from '../../driver.service';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-dashboard.html',
  styleUrls: ['./driver-dashboard.css']
})
export class DriverDashboard implements OnInit {
  driver: DriverInfo | null = null;
  isEditing: boolean = false;
  editedDriver: DriverInfo | null = null;
  isLoading: boolean = false;

  constructor(
    private driverService: DriverService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadDriverInfo();
  }

  loadDriverInfo() {
    if (isPlatformBrowser(this.platformId)) {
      const storedDriver = localStorage.getItem('currentDriver');
      if (storedDriver) {
        this.driver = JSON.parse(storedDriver);
        if (this.driver) {
          this.editedDriver = this.createDriverCopy(this.driver);
        }
      } else {
        this.router.navigate(['/main/driverlogin']);
      }
    }
  }

  toggleAvailability() {
    if (!this.driver?.driverId) return;

    this.isLoading = true;
    const currentStatus = this.driver.isAvailable;
    const newAvailability = !this.driver.isAvailable;
    
    console.log('🔄 Before toggle:', { 
      currentStatus, 
      newAvailability, 
      driverId: this.driver.driverId 
    });

    this.driverService.toggleAvailability(this.driver.driverId, newAvailability).subscribe({
      next: (response) => {
        console.log('✅ Toggle success response:', response);
        console.log('📄 Response body:', response.body);
        
        // Update driver status
        this.driver!.isAvailable = newAvailability;
        
        // Update localStorage (browser only)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentDriver', JSON.stringify(this.driver));
        }
        
        console.log('🔄 After update:', { 
          driverAvailable: this.driver!.isAvailable,
          newAvailability 
        });
        
        alert(`Availability updated to ${newAvailability ? 'Available' : 'Unavailable'}`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error updating availability:', error);
        console.error('📄 Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        alert('Failed to update availability. Please try again.');
        this.isLoading = false;
      }
    });
  }

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
      next: (response) => {
        this.driver = response.body!;
        if (this.driver) {
          this.editedDriver = this.createDriverCopy(this.driver);
        }
        this.isEditing = false;
        // Update localStorage (browser only)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentDriver', JSON.stringify(this.driver));
        }
        alert('Profile updated successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
        this.isLoading = false;
      }
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentDriver');
      localStorage.removeItem('driverId');
    }
    this.router.navigate(['/main/driverlogin']);
  }

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
      capacity: driver.capacity || 4,
      isAvailable: driver.isAvailable || false,
      isVerified: driver.isVerified || false
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
