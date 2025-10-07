import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-enter-otp',
  imports: [FormsModule,CommonModule],
  templateUrl: './user-enter-otp.html',
  styleUrl: './user-enter-otp.css'
})
export class UserEnterOtp {
  enteredOtp: string = '';
  otpValid: boolean = false;
  otpInvalid: boolean = false;

  private readonly correctOtp = '123456';

  constructor(private router: Router) {}

  onValidateOtp() {
    if (this.enteredOtp === this.correctOtp) {
      this.otpValid = true;
      this.otpInvalid = false;

      // Simulate redirect after success
      setTimeout(() => {
        this.router.navigate(['/main/usersetnewpassword']);
      }, 2000);
    } else {
      this.otpInvalid = true;
      this.otpValid = false;
    }
  }
       
}
