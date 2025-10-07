import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css'
})
export class PaymentSuccessComponent implements OnInit {
   constructor(private router: Router) {}
  
ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/userhomenav']); // Redirect to home after 5 seconds
    }, 3000);

  }
}
