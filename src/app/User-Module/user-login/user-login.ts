import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user-service';


@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css']
})
export class UserLogin {
userLoginObj = {
    userName: '',
    userPassword: ''
  };
  errorMessage="";
 
  constructor(private router: Router,private userService:UserService) {}
 
  onLogin() {
    if (!this.userLoginObj.userName && !this.userLoginObj.userPassword) {
      alert('Please enter username and password.');
      return;
    }
 
    if (!this.userLoginObj.userName) {
      alert('Please enter username.');
      return;
    }
 
    if (!this.userLoginObj.userPassword) {
      alert('Please enter password.');
      return;
    }
   
    this.userService.loginValidation(this.userLoginObj).subscribe({
  next: (response) => {
    const message = response.body?.message;
 
    if (message) {
      alert(message); // Shows "Login successful"
      if (message === 'Login successful') {
        this.router.navigate(['/userhomenav']);
      }
    } else {
      alert('Unexpected response from server.');
    }
  },
  error: (error) => {
    const errorMessage = error.error?.message || 'Something went wrong';
    alert(errorMessage); // Shows "User not found" or "Invalid password"
  }
     });
  }
  onClickRegister() {
    this.router.navigate(['/main/userregister']);
  }
 
  onClickForgotPassword() {
    this.router.navigate(['/main/userresetpassword']);
  }
}




