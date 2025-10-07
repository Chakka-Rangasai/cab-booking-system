import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router: Router) {}

  onSendOtp(form: any) {
    if (form.valid) {
      // Simulate sending OTP
      console.log('Sending OTP to:', this.email, this.mobile);
      this.otpSent = true;

      // // Show alert
      alert(`OTP has been sent to ${this.email} and ${this.mobile}`);

      // Navigate to OTP verification component
      this.router.navigate(['/main/driverenterotp'], {
        queryParams: {
          email: this.email,
          mobile: this.mobile
        }
      });
    }
  }
}
