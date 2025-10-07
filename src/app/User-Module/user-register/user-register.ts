import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterModule,CommonModule],
  templateUrl: './user-register.html',
  styleUrl: './user-register.css'
})
export class UserRegister {
  user = {
    userName: '',
    userEmail: '',
    userPhoneNumber:'',
    userPassword: ''
  };
 
  constructor(private router: Router,private userService:UserService) {
  }
 
  onRegister(form: NgForm) {
    if (form.valid) {
       this.userService.getUserDetailsObj(this.user);
       if(this.userService.responseMessage==="User registered successfully."){
        alert(this.userService.responseMessage);
        this.router.navigate(['/userlogin']);
       }
       else{
        alert(this.userService.responseMessage);
      }
    } else {
      alert('Please correct the errors before submitting.');
    }
  }
 
  onuserloginbtn() {
    this.router.navigate(['/main/userlogin']);
  }
}
