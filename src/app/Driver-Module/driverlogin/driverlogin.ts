import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../driver.service';

@Component({
  selector: 'app-driverlogin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './driverlogin.html',
  styleUrls: ['./driverlogin.css']
})
export class DriverLoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showPassword: boolean = false;
  isBrowser: boolean = false;

  constructor(
    private router: Router,
    private driverService: DriverService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Check if already logged in
    if (this.isBrowser && localStorage.getItem('driverToken')) {
      console.log('Driver already logged in, redirecting to dashboard');
      this.router.navigate(['/drivernav']);
    }
  }

  private normalizeDriver(driver: any) {
    if (!driver) return driver;
    console.log('normalizeDriver raw from backend:', driver);
    // Map backend field names correctly
    if (driver.isAvailable === undefined) driver.isAvailable = true;
    if (driver.isVerified === undefined) driver.isVerified = true;
    console.log('normalizeDriver after normalization:', driver);
    return driver;
  }

  onLogin() {
    console.log('Login attempt started for email:', this.email);
    this.errorMessage = '';

    // Basic validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;
    console.log('Calling backend API for login...');

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.driverService.loginDriver(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        
        if (response && response.body && response.body.token) {
          // Store the token
          if (this.isBrowser) {
            localStorage.setItem('driverToken', response.body.token);
            if (response.body.driver) {
              const normalized = this.normalizeDriver(response.body.driver);
              localStorage.setItem('driverInfo', JSON.stringify(normalized));
            }
          }
          
          // Show success alert
          alert('Login successful! Welcome to your dashboard.');
          
          console.log('Navigating to driver dashboard...');
          // Navigate to driver dashboard
          this.router.navigate(['/drivernav']).then(success => {
            console.log('Navigation result:', success);
            if (!success) {
              console.error('Navigation failed!');
            }
          });
        } else {
          console.error('Login response missing token:', response);
          this.errorMessage = 'Login failed. Invalid response from server.';
          alert('Login failed. Invalid response from server.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
          alert('Login Failed: Invalid email or password. Please check your credentials.');
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
          alert('Connection Error: Cannot connect to server. Please check if backend is running on http://localhost:8080.');
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
          alert(`Login Failed: ${error.error.message}`);
        } else {
          this.errorMessage = 'Login failed. Please try again.';
          alert('Login Failed: An unexpected error occurred. Please try again.');
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onClickRegister() {
    this.router.navigate(['/main/driverregister']);
  }

  onClickForgotPassword() {
    this.router.navigate(['/main/driverresetpassword']);
  }
}
