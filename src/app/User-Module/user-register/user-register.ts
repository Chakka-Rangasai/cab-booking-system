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
 
  // onRegister(form: NgForm) {
  //   if (form.valid) {
  //      this.userService.getUserDetailsObj(this.user);
  //      if(this.userService.responseMessage==="User registered successfully."){
  //       alert("Registration successfull");
  //       this.router.navigate(['/main/userlogin']);
  //      }
  //      else{
  //       alert(this.userService.responseMessage);
  //     }
  //   } else {
  //     alert('Please correct the errors before submitting.');
  //   }
  // }
  onRegister(form: NgForm) {
  if (form.valid) {
    this.userService.getUserDetailsObj(this.user).subscribe({
      next: (res: any) => {
        if (res.message === "User registered successfully") {
          alert("Registration successful");
          setTimeout(() => {
            this.router.navigate(['/main/userlogin']);
          }, 2000);
        } else {
          alert(res.message);
        }
      },
      error: (err: any) => {
        const errorMap = err.error;
        let combinedMessage = '';

        for (const key in errorMap) {
          if (errorMap.hasOwnProperty(key)) {
            combinedMessage += ` ${errorMap[key]}\n`;
          }
        }

        alert(combinedMessage.trim());
        console.error('Registration error:', combinedMessage.trim());
      }
    });
  } else {
    alert('Please correct the errors before submitting.');
  }
}
 
  onuserloginbtn() {
    this.router.navigate(['/main/userlogin']);
  }
}
