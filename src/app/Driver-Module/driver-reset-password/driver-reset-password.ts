import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

    if (!form.valid) {
      this.errorMessage = 'Please fill all fields correctly.';
      console.log('❌ Form is invalid:', form.errors);
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!this.isValidMobile(this.mobile)) {
      console.log("invalid");
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    this.isLoading = true;
    console.log('🚀 Verifying credentials for:', this.email, this.mobile);

    const userForgotPasswordObj = {
      email: this.email,
      phoneNumber: this.mobile
    };

    this.driverService.forgetPasswordCredentials(userForgotPasswordObj).subscribe({
      next: (response: any) => {
        console.log('✅ Credentials verified successfully:', response);
        this.isLoading = false;
        this.otpSent = true;

        if (response && response.body) {
          console.log(response.body.driver_id);
          alert(`OTP has been sent to ${this.email} and ${this.mobile}`);
          this.router.navigate(['/main/driverenterotp'], {
            queryParams: {
              email: this.email,
              mobile: this.mobile,
              driverId: response.body.driver_id
            }
          });
        } else {
          this.errorMessage = 'Invalid response from server.';
          alert(this.errorMessage);
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
        } else if (error.status === 401 && error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to verify credentials. Please try again.';
        }

        alert(this.errorMessage); // Show the error message in an alert
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidMobile(mobile: string): boolean {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  }

  onBackToLogin() {
    this.router.navigate(['/main/driverlogin']);
  }

  resetForm() {
    this.email = '';
    this.mobile = '';
    this.errorMessage = '';
    this.otpSent = false;
    this.isLoading = false;
  }
}