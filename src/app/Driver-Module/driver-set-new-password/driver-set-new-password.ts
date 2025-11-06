import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../driver.service';

@Component({
  selector: 'app-driver-set-new-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './driver-set-new-password.html',
  styleUrl: './driver-set-new-password.css'
})
export class DriverSetNewPassword {
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  passwordSet: boolean = false;
  errorMessage: string = '';
  driverId:any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.driverId = params['driverId'];
    });
    console.log("driver id is",this.driverId);
  }

  onSetPassword() {
    this.passwordMismatch = this.newPassword !== this.confirmPassword;
    this.errorMessage = '';

    if (this.passwordMismatch) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }
      
     const playload = {
          driverId: this.driverId,
          passwordHash: this.newPassword
    };
    console.log("playload driver id i:",playload.driverId);
     
    // Call backend to update password
    this.driverService.updateUserPassword(playload).subscribe({
      next: (response: any) => {
        console.log('✅ Password updated:', response);
        this.passwordSet = true;
        alert('Password updated successfully! Redirecting to login...');

        setTimeout(() => {
          this.router.navigate(['/main/driverlogin']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('❌ Failed to update password:', error);
        this.errorMessage = 'Failed to update password. Please try again.';
      }
    });
  }
}