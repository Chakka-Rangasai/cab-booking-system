import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../driver.service';

@Component({
  selector: 'app-driver-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './driver-reset-password.html',
  styleUrl: './driver-reset-password.css'
})
export class DriverResetPassword {
  email: string = '';
  mobile: string = '';
  otpSent: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private driverService: DriverService) {}

  onSendOtp(form: any) {
    console.log('🎯 onSendOtp() called');
    this.errorMessage = '';
    
    // Validate form
    if (!form.valid) {
      this.errorMessage = 'Please fill all fields correctly.';
      console.log('❌ Form is invalid:', form.errors);
      return;
    }

    // Additional validation
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!this.isValidMobile(this.mobile)) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    this.isLoading = true;
    console.log('🚀 Verifying credentials for:', this.email, this.mobile);

    // Call backend API to verify credentials
    this.driverService.verifyForgotPasswordCredentials(this.email, this.mobile).subscribe({
      next: (response: any) => {
        console.log('✅ Credentials verified successfully:', response);
        this.isLoading = false;
        this.otpSent = true;
        
        if (response && response.body) {
          alert(`OTP has been sent to ${this.email} and ${this.mobile}`);
          
          // Navigate to OTP verification component with driver ID
          this.router.navigate(['/main/driverenterotp'], {
            queryParams: {
              email: this.email,
              mobile: this.mobile,
              driverId: response.body.driver_id
            }
          });
        } else {
          this.errorMessage = 'Invalid response from server.';
        }
      },
      error: (error: any) => {
        console.error('❌ Credentials verification failed:', error);
        this.isLoading = false;
        
        if (error.status === 404 || error.status === 400) {
          this.errorMessage = 'Invalid email or phone number. Please check your credentials.';
        } else if (error.status === 0) {
          this.errorMessage = 'Network error. Please check if backend is working properly.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to verify credentials. Please try again.';
        }
      }
    });
  }

  // Email validation method
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mobile validation method
  isValidMobile(mobile: string): boolean {
    const mobileRegex = /^[6-9][0-9]{9}$/;
    return mobileRegex.test(mobile);
  }

  // Navigate back to login
  onBackToLogin() {
    this.router.navigate(['/main/driverlogin']);
  }

  // Reset form
  resetForm() {
    this.email = '';
    this.mobile = '';
    this.errorMessage = '';
    this.otpSent = false;
    this.isLoading = false;
  }
}
