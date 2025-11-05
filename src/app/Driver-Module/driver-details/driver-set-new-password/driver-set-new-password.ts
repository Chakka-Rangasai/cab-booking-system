import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DriverService } from '../../driver.service';


@Component({
  selector: 'app-driver-set-new-password',
  imports: [FormsModule,CommonModule],
  templateUrl: './driver-set-new-password.html',
  styleUrl: './driver-set-new-password.css'
})
export class DriverSetNewPassword implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  passwordSet: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Driver credentials from previous steps
  email: string = '';
  mobile: string = '';
  driverId: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private driverService: DriverService) {}

  ngOnInit() {
    // Get credentials from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.mobile = params['mobile'] || '';
      this.driverId = params['driverId'] || '';
      
      console.log('🔐 Set New Password component initialized with:', {
        email: this.email,
        mobile: this.mobile,
        driverId: this.driverId
      });
    });
  }

  onSetPassword() {
    console.log('🎯 Setting new password');
    this.errorMessage = '';
    
    // Validate inputs
    if (!this.newPassword.trim()) {
      this.errorMessage = 'Please enter a new password.';
      return;
    }
    
    if (!this.confirmPassword.trim()) {
      this.errorMessage = 'Please confirm your password.';
      return;
    }
    
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }
    
    this.passwordMismatch = this.newPassword !== this.confirmPassword;
    
    if (this.passwordMismatch) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.email || !this.mobile) {
      this.errorMessage = 'Missing email or mobile number. Please restart the password reset process.';
      return;
    }

    this.isLoading = true;
    console.log('🚀 Calling backend API to change password');

    // Prepare data for API call
    const changePasswordData = {
      driverId: this.driverId,
      passwordHash: this.newPassword // Backend will hash this
    };

    // Call the backend API
    this.driverService.changePassword(changePasswordData).subscribe({
      next: (response: any) => {
        console.log('✅ Password changed successfully:', response);
        this.isLoading = false;
        this.passwordSet = true;
        
        alert('Password changed successfully! Please login with your new password.');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/main/driverlogin']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('❌ Password change failed:', error);
        this.isLoading = false;
        
        if (error.status === 400) {
          this.errorMessage = 'Invalid request. Please check your input.';
        } else if (error.status === 404) {
          this.errorMessage = 'Driver not found. Please restart the password reset process.';
        } else if (error.status === 0) {
          this.errorMessage = 'Network error. Please check if backend is working properly.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Failed to change password. Please try again.';
        }
      }
    });
  }
}
