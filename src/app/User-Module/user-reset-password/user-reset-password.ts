import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-user-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-reset-password.html',
  styleUrl: './user-reset-password.css'
})
export class UserResetPassword {
  userForgotPasswordObj: any = {
  userEmail: '',
  userPhoneNumber: ''
};
 
otpSent: boolean = false;
 
constructor(private router: Router, private userService: UserService) {}
 
onSendOtp(form: any) {
  if (form.valid) {
    this.userService.forgetPasswordCredentials(this.userForgotPasswordObj).subscribe({
      next: (response) => {
        const message = response.body?.message;
 
        if (message === 'OTP sent successfully') {
          this.otpSent = true;
          alert(`OTP has been sent to ${this.userForgotPasswordObj.userEmail} and ${this.userForgotPasswordObj.userPhoneNumber}`);
          this.router.navigate(['/main/userenterotp']);
        } else {
          alert(message);
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Something went wrong. Please try again later.';
        alert(errorMessage);
      }
    });
 }
}
}
