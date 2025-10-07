import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-payment',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment {
   constructor(private router: Router) {}
  paymentMethod: 'card' | 'upi' = 'card';

  cardErrorMessage: string = '';
  upiErrorMessage: string = '';

  amount =134;
  Paymentformcard: FormGroup = new FormGroup({

    name: new FormControl('', Validators.required),

    cardnumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{12}$/) // Exactly 12 digits
    ]),

    expiry: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{4}$/) // MM/YYYY format
    ]),

    cvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}$/) // Exactly 3 digits
    ])
  });

  Paymentformupi: FormGroup = new FormGroup({

    name: new FormControl('', Validators.required),
    upiid: new FormControl('', Validators.required)
  });


  submitCard() {
    if (this.Paymentformcard.invalid) {
      this.cardErrorMessage = '⚠️ Please fill out all required card details correctly.';
    } else {
      this.cardErrorMessage = '';
     
      this.pay();
    }
  }

  submitUpi() {
    if (this.Paymentformupi.invalid) {
      this.upiErrorMessage = '⚠️ Please fill out all required UPI details.';
    } else {
      this.upiErrorMessage = '';
      this.pay();
    }
  }

  selectMethod(method: 'card' | 'upi') {
    this.paymentMethod = method;
  }

// value:boolean=false;
pay() {
  alert(`  ✅ Payment successfull
      Thank you for choosing to ride with us! 🚗`);
      // this.value=true;
  if (this.paymentMethod === 'card') {
    this.Paymentformcard.reset();
  } else {
    this.Paymentformupi.reset();
  }
  this.router.navigate(['/userhomenav/paymentsuccess']);
}
}
