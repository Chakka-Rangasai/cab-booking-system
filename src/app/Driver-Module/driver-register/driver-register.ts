import { Component } from '@angular/core';
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

onRegisterDriver() {
  this.errorMessage = '';
  this.isLoading = true;
  
  // Validate all required fields
  if (!this.fullName.trim()) {
    this.errorMessage = 'Please enter your full name';
    this.isLoading = false;
    return;
  }

  if (!this.isValidEmail(this.email)) {
    this.errorMessage = 'Please enter a valid email address';
    this.isLoading = false;
    return;
  }

  if (!this.isValidPassword(this.password)) {
    this.errorMessage = 'Password must be at least 8 characters long';
    this.isLoading = false;
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match';
    this.isLoading = false;
    return;
  }

  if (!this.isValidPhoneNumber(this.phoneNumber)) {
    this.errorMessage = 'Please enter a valid 10-digit Indian phone number';
    this.isLoading = false;
    return;
  }

  if (!this.licenseNumber.trim()) {
    this.errorMessage = 'Please enter your license number';
    this.isLoading = false;
    return;
  }

  if (!this.vehicleModel.trim()) {
    this.errorMessage = 'Please enter your vehicle model';
    this.isLoading = false;
    return;
  }

  if (!this.vehicleRegNo.trim()) {
    this.errorMessage = 'Please enter your vehicle registration number';
    this.isLoading = false;
    return;
  }

  if (!this.vehicleColor.trim()) {
    this.errorMessage = 'Please enter your vehicle color';
    this.isLoading = false;
    return;
  }

  if (this.capacity < 1 || this.capacity > 8) {
    this.errorMessage = 'Vehicle capacity must be between 1 and 8';
    this.isLoading = false;
    return;
  }

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
      
      if (error.status === 400) {
        this.errorMessage = 'Registration failed: Please check your input data.';
      } else if (error.status === 409) {
        this.errorMessage = 'Registration failed: Email or phone number already exists.';
      } else if (error.status === 0) {
        this.errorMessage = 'Network error. Please check if backend is working properly';
      } else if (error.status === 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = `Registration failed: Server error (${error.status}). Please try again later.`;
      }
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
  this.capacity = 2;
  this.errorMessage = '';
  this.isLoading = false;
}
onDriverLoginBtn() {
    this.router.navigate(['/main/driverlogin']);
  }
}



