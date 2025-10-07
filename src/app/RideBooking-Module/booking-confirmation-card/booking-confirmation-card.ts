import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation-card',
  imports: [],
  templateUrl: './booking-confirmation-card.html',
  styleUrl: './booking-confirmation-card.css'
})
export class BookingConfirmationCard implements OnInit {
  vehicle: string = '';
  distance: string = '';

  amount: number = 0;
  
  // Optional: mock data for display
  driverName = 'Ravi Kumar';
  cabNumber = 'MH12 AB 1234';
  originAddress : string = '';
  destinationAddress: string = '';
  ngOnInit(): void {
    this.vehicle = this.route.snapshot.queryParamMap.get('vehicle') || '';
    this.distance = this.route.snapshot.queryParamMap.get('distance') || '';
     this.originAddress = this.route.snapshot.queryParamMap.get('origin') || '';
      this.destinationAddress = this.route.snapshot.queryParamMap.get('destination') || '';
      this.amount = Number(this.route.snapshot.queryParamMap.get('amount')) || 0;
    
  }

  constructor(private route: ActivatedRoute) {}
}
