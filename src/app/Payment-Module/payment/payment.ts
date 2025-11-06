import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class Payment implements OnInit {
  paymentMethod: 'card' | 'upi' | 'cash' = 'card';
  cardErrorMessage: string = '';
  upiErrorMessage: string = '';
  amount: number = 0;
  requestId: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const amt = params.get('amount');
      const reqId = params.get('requestId');

      this.amount = amt ? Number(amt) : 0;
      this.requestId = reqId ? Number(reqId) : 0;

      if (!this.requestId) {
        const storedRequestId = localStorage.getItem('requestId');
        this.requestId = storedRequestId ? Number(storedRequestId) : 0;
      }
    });
  }

  Paymentformcard: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    cardnumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{12}$/)
    ]),
    expiry: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{4}$/)
    ]),
    cvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}$/)
    ])
  });

  Paymentformupi: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    upiid: new FormControl('', Validators.required)
  });

  selectMethod(method: 'card' | 'upi' | 'cash') {
    this.paymentMethod = method;
  }

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

  submitCash() {
    this.pay(); // No form validation needed
  }

  pay() {
    const payload = {
      method: this.paymentMethod.toUpperCase(),
      status: 'SUCCESS',
      amount: this.amount,
      requestId: this.requestId
    };

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post('http://localhost:8080/payment-api/payment/create', payload, { headers }).subscribe({
      next: () => {
        this.Paymentformcard.reset();
        this.Paymentformupi.reset();

        this.router.navigate(['/userhomenav/paymentsuccess'], {
          queryParams: { requestId: this.requestId }
        });
      },
      error: err => {
        console.error('Payment submission failed:', err);
        alert('❌ Payment failed. You may pay cash directly to the driver.');
        this.router.navigate(['/userhomenav/paymentsuccess'], {
          queryParams: { requestId: this.requestId }
        });
      }
    });
  }
}
