import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-register',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterModule, CommonModule],
  templateUrl: './driver-register.html',
  styleUrls: ['./driver-register.css']
})
export class DriverRegister {
  username: string = '';
  email: string = '';
  password: string = '';
  mobile: string = '';
  licenseId: string = '';
  vehicleNumber: string = '';
  vehicleModel: string = '';
  vehicleDetailsFile: File | null = null;

  constructor(private router: Router) {}

  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.vehicleDetailsFile = input.files[0];
  }
}

onRegisterDriver() {
  if (
    this.username &&
    this.email &&
    this.password &&
    this.mobile &&
    this.licenseId &&
    this.vehicleNumber &&
    this.vehicleModel &&
    this.vehicleDetailsFile
  ) 
  {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('mobile', this.mobile);
    formData.append('licenseId', this.licenseId);
    formData.append('vehicleNumber', this.vehicleNumber);
    formData.append('vehicleModel', this.vehicleModel);
    formData.append('vehicleDetails', this.vehicleDetailsFile);

    console.log('Driver registered:', formData);
    alert('Driver registration successful!');
    this.router.navigate(['/driverlogin']);
  } else {
    alert('Please fill all fields and upload the vehicle details PDF.');
  }
}
onDriverLoginBtn() {
    this.router.navigate(['/main/driverlogin']);
  }
}



