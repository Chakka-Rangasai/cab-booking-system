import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-user-set-new-password',
  imports: [FormsModule,CommonModule],
  templateUrl: './user-set-new-password.html',
  styleUrl: './user-set-new-password.css'
})
export class UserSetNewPassword {
 newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  passwordSet: boolean = false;
 
  constructor(private router: Router,private userService:UserService) {}
 
  onSetPassword() {
    this.passwordMismatch = this.newPassword !== this.confirmPassword;
 
    if (!this.passwordMismatch) {
      console.log('Password set:', this.newPassword);
      this.passwordSet = true;
 
      // Call the service method to update password
      this.userService.updateUserPassword(this.newPassword).subscribe(response => {
        const body = response.body;
        if (body?.message === 'Password updated successfully') {
          console.log('Password updated successfully');
 
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/main/userlogin']);
          }, 2000);
        } else {
          console.error('Failed to update password');
        }
      });
    }
  }
}



