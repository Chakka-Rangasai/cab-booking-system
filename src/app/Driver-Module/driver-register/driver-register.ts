import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DriverService, DriverInfo } from '../../driver.service';

@Component({
  selector: 'app-driver-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './driver-register.html',
  styleUrls: ['./driver-register.css']
})
export class DriverRegister {
  @ViewChild('driverForm', { static: false }) driverForm!: NgForm;
  
  // Driver properties matching backend DriverInfo interface
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  licenseNumber: string = '';
  vehicleModel: string = '';
  vehicleRegNo: string = '';
  vehicleColor: string = '';
  capacity: number = 4;
  // Backend boolean fields (capitalized in entity)
  isAvailable: boolean = true; // default available
  isVerified: boolean = true; // default not verified until backend sets
  
  // UI state properties
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private driverService: DriverService) {}

  // Validation methods
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phone);
  }

  isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

onRegisterDriver(form?: NgForm) {
  console.log('🎯 onRegisterDriver() called');
  
  // Use the form parameter if provided, otherwise fall back to ViewChild
  const currentForm = form || this.driverForm;
  
  console.log('📝 Form reference:', !!currentForm);
  console.log('📝 Form valid:', currentForm?.valid);
  console.log('📝 Form value:', currentForm?.value);
  console.log('📝 Component values:', {
    fullName: this.fullName,
    email: this.email,
    phoneNumber: this.phoneNumber
  });
  
  this.errorMessage = '';
  
  // Debug form errors if form exists
  if (currentForm) {
    console.log('📝 Form errors:', currentForm.errors);
    if (currentForm.controls) {
      Object.keys(currentForm.controls).forEach(key => {
        const control = currentForm.controls[key];
        if (control.invalid) {
          console.log(`❌ Field ${key} is invalid:`, control.errors);
        }
      });
    }
  }
  
  // Check if form exists and is valid
  if (!currentForm || !currentForm.valid) {
    this.errorMessage = 'Please fill all required fields correctly.';
    console.log('❌ Form is invalid or missing');
    // Mark all fields as touched to show validation errors
    if (currentForm && currentForm.controls) {
      Object.keys(currentForm.controls).forEach(key => {
        currentForm.controls[key].markAsTouched();
      });
    }
    return;
  }
  
  // Additional validation for password confirmation (since it's not easily done in template)
  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match';
    return;
  }

  // Additional validation for capacity range
  if (this.capacity < 1 || this.capacity > 8) {
    this.errorMessage = 'Vehicle capacity must be between 1 and 8';
    return;
  }

  // Set loading state
  this.isLoading = true;

  // Create driver data object matching backend Driver entity exactly
  const driverData = {
    fullName: this.fullName.trim(),
    email: this.email.trim().toLowerCase(),
    phoneNumber: this.phoneNumber.trim(),
    passwordHash: this.password, // Backend will hash this and store as passwordHash
    licenseNumber: this.licenseNumber.trim().toUpperCase(),
    vehicleModel: this.vehicleModel.trim(),
    vehicleRegNo: this.vehicleRegNo.trim().toUpperCase(),
    vehicleColor: this.vehicleColor.trim(),
    capacity: this.capacity,
    isAvailable: this.isAvailable,
    isVerified: this.isVerified
  };

  console.log('🚀 Registering driver with data:', driverData);

  // Call backend API through DriverService
  this.driverService.registerDriver(driverData).subscribe({
    next: (response: any) => {
      console.log('✅ Driver registration successful:', response.body);
      this.isLoading = false;
      alert('Driver registration successful! Please login to continue.');
      this.resetForm();
      this.router.navigate(['/main/driverlogin']);
    },
    error: (error: any) => {
      console.error('❌ Driver registration failed:', error);

      this.isLoading = false;
      
      // Handle specific backend error messages
      if (error.status === 500) {
        let errorMessage = '';
        
        // Try different ways to extract the error message
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = 'Unknown server error';
        }
        
        console.log(' Extracted error message:', errorMessage);
        
        if (errorMessage.includes('Driver with this email already exists')) {
          this.errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
        } else if (errorMessage.includes('Driver with this license number already exists')) {
          this.errorMessage = 'This license number is already registered. Please verify your license number.';
        } else {
          this.errorMessage =  errorMessage;
        }
      } else if (error.status === 400) {
        this.errorMessage = 'Registration failed: Please check your input data and ensure all fields are valid.';
      } else if (error.status === 409) {
        this.errorMessage = 'Registration failed: Email or license number already exists.';
      } else if (error.status === 0) {
        this.errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
      } else {
        this.errorMessage = `Registration failed: Server error (${error.status}). Please try again later.`;
      }
      
      // Always show an alert for debugging
      alert('Registration Error: ' + this.errorMessage);
      console.log('🚨 Error message set to:', this.errorMessage);
    }
  });
}

resetForm() {
  this.fullName = '';
  this.email = '';
  this.password = '';
  this.confirmPassword = '';
  this.phoneNumber = '';
  this.licenseNumber = '';
  this.vehicleModel = '';
  this.vehicleRegNo = '';
  this.vehicleColor = '';
  this.capacity = 4; // Match default value
  this.errorMessage = '';
  this.isLoading = false;
}
onDriverLoginBtn() {
    this.router.navigate(['/main/driverlogin']);
  }
}



