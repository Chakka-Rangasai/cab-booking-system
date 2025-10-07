import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driverlogin',
  imports: [FormsModule,CommonModule],
  templateUrl: './driverlogin.html',
  styleUrl: './driverlogin.css'
})
export class Driverlogin {
username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    const correctUsername = 'ranga';
    const correctPassword = '1234';

    // Check if both fields are empty
    if (!this.username && !this.password) {
      alert('Please enter username and password.');
      return;
    }

    // Check if username is empty
    if (!this.username) {
      alert('Please enter username.');
      return;
    }

    // Check if password is empty
    if (!this.password) {
      alert('Please enter password.');
      return;
    }

    // Check if both are incorrect
    if (this.username !== correctUsername && this.password !== correctPassword) {
      alert('Invalid username and password.');
      return;
    }

    // Check if username is incorrect
    if (this.username !== correctUsername) {
      alert('Invalid username.');
      return;
    }

    // Check if password is incorrect
    if (this.password !== correctPassword) {
      alert('Invalid password.');
      return;
    }

    // If everything is correct
    alert('Login successful!');
    this.router.navigate(['/drivernav/']);
  }

  onClickRegister() {
    this.router.navigate(['/main/driverregister']);
  }

  onClickForgotPassword() {
    this.router.navigate(['/main/driverresetpassword']);
  }
}
