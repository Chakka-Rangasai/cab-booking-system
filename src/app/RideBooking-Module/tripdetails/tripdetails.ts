import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tripdetails',
  imports: [FormsModule,CommonModule],
  templateUrl: './tripdetails.html',
  styleUrl: './tripdetails.css'
})
export class Tripdetails {
  rapidoTrips = [
    {
      pickup: 'Baner Road',
      drop: 'FC Road',
      fare: 85,
      driver: 'Ravi Kumar',
      time: '4:30 PM',
      payment:'UPI'
    },
    {
      pickup: 'Hinjewadi Phase 2',
      drop: 'Pune Station',
      fare: 120,
      driver: 'Sneha Patil',
      time: '5:15 PM',
      payment:'CASH'
    },
    {
      pickup: 'Kothrud',
      drop: 'Magarpatta',
      fare: 150,
      driver: 'Amit Joshi',
      time: '6:00 PM',
      payment:'UPI'
    },
    {
      pickup: 'Hinjewadi Phase 1',
      drop: 'Koregaon Park',
      fare: 120,
      driver: 'Sneha Patil',
      time: '6:15 PM',
      payment: 'Cash'
    },
    {
      pickup: 'Aundh',
      drop: 'Swargate',
      fare: 95,
      driver: 'Mohit Deshmukh',
      time: '5:45 PM',
      payment: 'Card'
    }
];
}
