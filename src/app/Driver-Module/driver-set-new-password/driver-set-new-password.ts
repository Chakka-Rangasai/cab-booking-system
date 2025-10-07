import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-driver-set-new-password',
  imports: [FormsModule,CommonModule],
  templateUrl: './driver-set-new-password.html',
  styleUrl: './driver-set-new-password.css'
})
export class DriverSetNewPassword {
 newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  passwordSet: boolean = false;

  constructor(private router: Router) {}

  onSetPassword() {
    this.passwordMismatch = this.newPassword !== this.confirmPassword;

    if (!this.passwordMismatch) {
  console.log('Password set:', this.newPassword);
  this.passwordSet = true;

  // Redirect to login after a short delay
  setTimeout(() => {
    this.router.navigate(['/main/driverlogin']);
  }, 2000);
}

  }
}
