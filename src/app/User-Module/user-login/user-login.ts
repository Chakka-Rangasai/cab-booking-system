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
    email: '',
    password: ''
  };
  errorMessage="";
 
  constructor(private router: Router,private userService:UserService) {}
 
  onLogin() {
    if (!this.userLoginObj.email && !this.userLoginObj.password) {
      alert('Please enter username and password.');
      return;
    }
 
    if (!this.userLoginObj.email) {
      alert('Please enter username.');
      return;
    }
 
    if (!this.userLoginObj.password) {
      alert('Please enter password.');
      return;
    }
   
   this.userService.loginValidation(this.userLoginObj).subscribe({
  next: (response) => {
      if(this.userService.getToken()){
        alert('Login Successful');
      this.router.navigate(['/userhomenav']); // Navigate on successful token
    } else {
      alert('Login failed: Token not received.');
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
