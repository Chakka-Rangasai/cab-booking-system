import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-driver-enter-otp',
  imports: [FormsModule,CommonModule],
  templateUrl: './driver-enter-otp.html',
  styleUrl: './driver-enter-otp.css'
})
export class DriverEnterOtp {
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
              this.router.navigate(['/main/driversetnewpassword']);
            }, 2000);
          } else {
            this.otpInvalid = true;
            this.otpValid = false;
          }
        }
             
}
