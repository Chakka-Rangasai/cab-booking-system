import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-driver-enter-otp',
  imports: [FormsModule,CommonModule],
  templateUrl: './driver-enter-otp.html',
  styleUrl: './driver-enter-otp.css'
})

export class DriverEnterOtp implements OnInit {
  enteredOtp: string = '';
  otpValid: boolean = false;
  otpInvalid: boolean = false;
  driverId: string = '';

  private readonly correctOtp = '123456';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.driverId = params['driverId'];
      console.log('Driver ID received:', this.driverId);
    });
  }

  onValidateOtp() {
    if (this.enteredOtp === this.correctOtp) {
      this.otpValid = true;
      this.otpInvalid = false;

      // Simulate redirect after success
      setTimeout(() => {
        this.router.navigate(['/main/driversetnewpassword'], {
          queryParams: { driverId: this.driverId }
        });
      }, 2000);
    } else {
      this.otpInvalid = true;
      this.otpValid = false;
    }
  }
}
